package com.matrix.milktracker

import android.Manifest
import android.annotation.SuppressLint
import android.content.ContentValues
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.provider.Settings
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import android.webkit.WebViewClient
import java.io.File

/**
 * Hosts the MATRIX Milk Tracker web app (app/src/main/assets/www) in a WebView.
 * Pages are served from https://appassets.androidplatform.net so the page is a
 * secure context: camera (getUserMedia) and IndexedDB work, and data stays on the phone.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView
    private var pendingCamRequest: PermissionRequest? = null
    private var fileCallback: ValueCallback<Array<Uri>>? = null

    /* ---- auto-update: newer app code (index.html + app.js) downloaded from the server ---- */
    private val otaDir by lazy { File(filesDir, "ota") }
    private val otaPrefs by lazy { getSharedPreferences("ota", MODE_PRIVATE) }
    @Volatile private var otaActive = false

    private fun apkVersion(): Long {
        val info = packageManager.getPackageInfo(packageName, 0)
        return if (Build.VERSION.SDK_INT >= 28) info.longVersionCode else info.versionCode.toLong()
    }

    private fun clearOta() {
        otaDir.deleteRecursively()
        otaPrefs.edit().remove("ver").putInt("fails", 0).apply()
        otaActive = false
    }

    /** Decide on each start whether to use the downloaded code or the code inside the APK. */
    private fun prepareOta() {
        otaActive = false
        if (!File(otaDir, "index.html").exists() || !File(otaDir, "app.js").exists()) return
        // A newly installed APK already has the newest code: drop the old download.
        if (otaPrefs.getLong("apk", -1L) != apkVersion()) { clearOta(); return }
        val fails = otaPrefs.getInt("fails", 0)
        if (fails >= 2) {
            // The downloaded code did not start twice: go back to the APK's own code and never use that version again.
            otaPrefs.edit().putString("bad", otaPrefs.getString("ver", "")).apply()
            clearOta(); return
        }
        otaPrefs.edit().putInt("fails", fails + 1).apply()
        otaActive = true
    }

    private fun otaFile(name: String, mime: String): WebResourceResponse? {
        val f = File(otaDir, name)
        if (!f.exists()) return null
        return WebResourceResponse(mime, "UTF-8", 200, "OK", mapOf("Cache-Control" to "no-store"), f.inputStream())
    }

    private val cameraPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            pendingCamRequest?.let { req ->
                if (granted) req.grant(arrayOf(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) else req.deny()
            }
            pendingCamRequest = null
            pendingChooser?.let { go -> pendingChooser = null; go(granted) }
        }

    /* ---- GPS location for the page (saved with the face scan) ---- */
    private var pendingGeo: Pair<String?, GeolocationPermissions.Callback>? = null

    private val locationPermission =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { res ->
            val ok = res.values.any { it }
            pendingGeo?.let { (origin, cb) -> cb.invoke(origin, ok, ok) }
            pendingGeo = null
        }

    private fun hasLocation(): Boolean =
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    /* ---- photo from the phone's own camera app (file input with capture) ---- */
    private var cameraPhotoUri: Uri? = null
    private var cameraPhotoFile: File? = null
    private var pendingChooser: ((Boolean) -> Unit)? = null

    private val filePicker =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { res ->
            var result = WebChromeClient.FileChooserParams.parseResult(res.resultCode, res.data)
            if (result == null && res.resultCode == RESULT_OK) {
                // The camera app saves the photo to our file and returns no data.
                val f = cameraPhotoFile
                val u = cameraPhotoUri
                if (f != null && u != null && f.exists() && f.length() > 0) result = arrayOf(u)
            }
            fileCallback?.onReceiveValue(result)
            fileCallback = null
            cameraPhotoUri = null
            cameraPhotoFile = null
        }

    private fun hasCamera(): Boolean =
        ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED

    private fun newCameraIntent(): Intent {
        val dir = File(cacheDir, "camera")
        dir.mkdirs()
        dir.listFiles()?.forEach { it.delete() } // keep only the newest photo
        val f = File(dir, "photo_" + System.currentTimeMillis() + ".jpg")
        val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", f)
        cameraPhotoFile = f
        cameraPhotoUri = uri
        return Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
            putExtra(MediaStore.EXTRA_OUTPUT, uri)
            addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
    }

    /** "Phone camera se" opens the camera directly; "Gallery se" opens the photo picker. */
    private fun openImagePicker(capture: Boolean, camOk: Boolean) {
        try {
            if (capture && camOk) {
                filePicker.launch(newCameraIntent()); return
            }
            val pick = Intent(Intent.ACTION_GET_CONTENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "image/*"
            }
            val chooser = Intent.createChooser(pick, "Photo chunein")
            if (capture && !camOk) {
                // Camera permission refused: tell the page, then fall back to the picker.
                web.post { web.evaluateJavascript("window.__camDenied && window.__camDenied()", null) }
            }
            filePicker.launch(chooser)
        } catch (e: Exception) {
            fileCallback?.onReceiveValue(null)
            fileCallback = null
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
        web.setBackgroundColor(0xFF0B6B85.toInt()) // same teal as the splash, no white flash
        setContentView(web)

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            allowContentAccess = false
            setGeolocationEnabled(true)
        }

        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView, request: WebResourceRequest
            ): WebResourceResponse? {
                if (otaActive && request.url.host == "appassets.androidplatform.net") {
                    when (request.url.path) {
                        "/assets/www/index.html" -> otaFile("index.html", "text/html")?.let { return it }
                        "/assets/www/app.js" -> otaFile("app.js", "application/javascript")?.let { return it }
                    }
                }
                return assetLoader.shouldInterceptRequest(request.url)
            }

            // Links that leave the app (Google Sheet, Drive photos) open in the browser,
            // so the app page itself is never replaced.
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                if (request.url.host == "appassets.androidplatform.net") return false
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, request.url))
                } catch (e: Exception) { /* no browser installed */ }
                return true
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                if (callback == null) return
                if (hasLocation()) {
                    callback.invoke(origin, true, true); return
                }
                pendingGeo?.let { (o, cb) -> cb.invoke(o, false, false) }
                pendingGeo = Pair(origin, callback)
                try {
                    locationPermission.launch(
                        arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
                    )
                } catch (e: Exception) {
                    pendingGeo = null
                    callback.invoke(origin, false, false)
                }
            }

            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread {
                    if (!request.resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) {
                        request.deny(); return@runOnUiThread
                    }
                    val has = ContextCompat.checkSelfPermission(
                        this@MainActivity, Manifest.permission.CAMERA
                    ) == PackageManager.PERMISSION_GRANTED
                    if (has) {
                        request.grant(arrayOf(PermissionRequest.RESOURCE_VIDEO_CAPTURE))
                    } else {
                        pendingCamRequest = request
                        cameraPermission.launch(Manifest.permission.CAMERA)
                    }
                }
            }

            override fun onShowFileChooser(
                webView: WebView,
                callback: ValueCallback<Array<Uri>>,
                params: FileChooserParams
            ): Boolean {
                fileCallback?.onReceiveValue(null)
                fileCallback = callback
                val types = params.acceptTypes.filter { it.isNotBlank() }
                val image = types.isEmpty() || types.any { it.startsWith("image") }
                if (!image) {
                    return try {
                        filePicker.launch(params.createIntent()); true
                    } catch (e: Exception) {
                        fileCallback = null; false
                    }
                }
                val capture = params.isCaptureEnabled
                if (!capture || hasCamera()) {
                    openImagePicker(capture, true)
                } else {
                    pendingChooser = { granted -> openImagePicker(true, granted) }
                    cameraPermission.launch(Manifest.permission.CAMERA)
                }
                return true
            }
        }

        web.addJavascriptInterface(Bridge(), "AndroidBridge")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (web.canGoBack()) web.goBack() else finish()
            }
        })

        prepareOta()
        if (savedInstanceState == null) {
            web.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
        } else {
            web.restoreState(savedInstanceState)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    /** Called from the page as AndroidBridge.saveFile(name, text, mime); returns where it was saved. */
    inner class Bridge {
        /** Version of the downloaded app code ("" = code inside the APK). */
        @JavascriptInterface
        fun otaVersion(): String =
            if (File(otaDir, "app.js").exists()) otaPrefs.getString("ver", "") ?: "" else ""

        /** A version that failed to start before (never download it again). */
        @JavascriptInterface
        fun otaBad(): String = otaPrefs.getString("bad", "") ?: ""

        /** Saves new app code; it is used from the next start (or reloadApp). */
        @JavascriptInterface
        fun saveUpdate(ver: String, html: String, js: String): String = try {
            if (ver.isBlank() || html.length < 1000 || js.length < 1000) throw IllegalArgumentException("empty update")
            val tmp = File(filesDir, "ota_new")
            tmp.deleteRecursively(); tmp.mkdirs()
            File(tmp, "index.html").writeText(html, Charsets.UTF_8)
            File(tmp, "app.js").writeText(js, Charsets.UTF_8)
            otaDir.deleteRecursively()
            if (!tmp.renameTo(otaDir)) throw IllegalStateException("could not save update")
            otaPrefs.edit().putString("ver", ver).putLong("apk", apkVersion()).putInt("fails", 0).apply()
            "OK"
        } catch (e: Exception) {
            "ERROR: " + (e.message ?: "update failed")
        }

        /** "granted" or "denied": camera permission of the app. */
        @JavascriptInterface
        fun cameraStatus(): String = if (hasCamera()) "granted" else "denied"

        /** Opens this app's page in phone Settings (to allow the camera). */
        @JavascriptInterface
        fun openAppSettings() {
            runOnUiThread {
                try {
                    startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName")))
                } catch (e: Exception) { /* ignore */ }
            }
        }

        /** Called by the page after it started fine. */
        @JavascriptInterface
        fun otaOk() {
            otaPrefs.edit().putInt("fails", 0).apply()
        }

        /** Restart the page with the newest code. */
        @JavascriptInterface
        fun reloadApp() {
            runOnUiThread {
                prepareOta()
                web.clearCache(false)
                web.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
            }
        }

        @JavascriptInterface
        fun saveFile(name: String, text: String, mime: String): String = try {
            write(name, text, mime)
        } catch (e: Exception) {
            "ERROR: " + (e.message ?: "save failed")
        }

        private fun write(name: String, text: String, mime: String): String {
            val bytes = text.toByteArray(Charsets.UTF_8)
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, name)
                    put(MediaStore.Downloads.MIME_TYPE, mime)
                    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/MATRIX Milk")
                }
                val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                    ?: throw IllegalStateException("Could not create file")
                contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
                "Download/MATRIX Milk/$name"
            } else {
                val dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: filesDir
                val f = File(dir, name)
                f.writeBytes(bytes)
                f.absolutePath
            }
        }
    }
}
