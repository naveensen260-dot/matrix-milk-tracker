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
        }

    private val filePicker =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { res ->
            fileCallback?.onReceiveValue(
                WebChromeClient.FileChooserParams.parseResult(res.resultCode, res.data)
            )
            fileCallback = null
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
                return try {
                    filePicker.launch(params.createIntent()); true
                } catch (e: Exception) {
                    fileCallback = null; false
                }
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
