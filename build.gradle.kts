plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.matrix.milktracker"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.matrix.milktracker"
        minSdk = 26
        targetSdk = 34
        versionCode = 9
        versionName = "1.8"
    }

    // One fixed signing key, so every new APK installs over the old one (no uninstall, data stays).
    signingConfigs {
        create("matrix") {
            storeFile = file("matrix.keystore")
            storePassword = "matrix123"
            keyAlias = "matrix"
            keyPassword = "matrix123"
        }
    }

    buildTypes {
        debug {
            signingConfig = signingConfigs.getByName("matrix")
        }
        release {
            signingConfig = signingConfigs.getByName("matrix")
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    // keep model weights uncompressed so they load fast
    androidResources { noCompress += listOf("wasm", "json") }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.9.2")
    implementation("androidx.webkit:webkit:1.11.0")
}
