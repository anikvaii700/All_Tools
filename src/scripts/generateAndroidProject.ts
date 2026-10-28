import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

async function generateAndroidStudioProject() {
  const zip = new JSZip();

  const appPackage = 'com.mosafa.tools';
  const appName = 'The MoSaFa Tools';
  const appUrl = 'https://ais-pre-vzob6g5trhnzc2w7qmf6to-580416772203.asia-southeast1.run.app';

  // Root project files
  zip.file('The-MoSaFa-Android/settings.gradle', `
rootProject.name = "TheMoSaFaTools"
include ':app'
  `.trim());

  zip.file('The-MoSaFa-Android/build.gradle', `
buildscript {
    ext.kotlin_version = "1.9.22"
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:8.2.2"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

tasks.register('clean', Delete) {
    delete rootProject.buildDir
}
  `.trim());

  zip.file('The-MoSaFa-Android/gradle.properties', `
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
android.nonTransitiveRClass=true
  `.trim());

  zip.file('The-MoSaFa-Android/gradle/wrapper/gradle-wrapper.properties', `
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
  `.trim());

  // app/build.gradle
  zip.file('The-MoSaFa-Android/app/build.gradle', `
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${appPackage}'
    compileSdk 34

    defaultConfig {
        applicationId "${appPackage}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
}
  `.trim());

  zip.file('The-MoSaFa-Android/app/proguard-rules.pro', `
# ProGuard configuration for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
  `.trim());

  // app/src/main/AndroidManifest.xml
  zip.file('The-MoSaFa-Android/app/src/main/AndroidManifest.xml', `
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.TheMoSaFa"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
  `.trim());

  // app/src/main/res/values/strings.xml
  zip.file('The-MoSaFa-Android/app/src/main/res/values/strings.xml', `
<resources>
    <string name="app_name">The MoSaFa Tools</string>
</resources>
  `.trim());

  // app/src/main/res/values/colors.xml
  zip.file('The-MoSaFa-Android/app/src/main/res/values/colors.xml', `
<resources>
    <color name="primary">#E11D48</color>
    <color name="primary_dark">#BE123C</color>
    <color name="accent">#4F46E5</color>
    <color name="white">#FFFFFF</color>
</resources>
  `.trim());

  // app/src/main/res/values/themes.xml
  zip.file('The-MoSaFa-Android/app/src/main/res/values/themes.xml', `
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.TheMoSaFa" parent="Theme.MaterialComponents.Light.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryVariant">@color/primary_dark</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="android:statusBarColor">@color/primary</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>
  `.trim());

  // app/src/main/res/layout/activity_main.xml
  zip.file('The-MoSaFa-Android/app/src/main/res/layout/activity_main.xml', `
<?xml version="1.0" encoding="utf-8"?>
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/swipeRefreshLayout"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
  `.trim());

  // app/src/main/java/com/mosafa/tools/MainActivity.kt
  zip.file('The-MoSaFa-Android/app/src/main/java/com/mosafa/tools/MainActivity.kt', `
package com.mosafa.tools

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private val appUrl = "${appUrl}"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)

        swipeRefreshLayout.setColorSchemeColors(
            getColor(R.color.primary),
            getColor(R.color.accent)
        )

        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
        }

        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
            cacheMode = WebSettings.LOAD_DEFAULT
            allowFileAccess = true
            userAgentString = userAgentString + " TheMoSaFaApp/1.0"
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                view?.loadUrl(request?.url.toString())
                return true
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                swipeRefreshLayout.isRefreshing = true
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                swipeRefreshLayout.isRefreshing = false
            }
        }

        webView.webChromeClient = WebChromeClient()

        if (savedInstanceState == null) {
            webView.loadUrl(appUrl)
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }
}
  `.trim());

  // README with instructions
  zip.file('The-MoSaFa-Android/README.md', `
# The MoSaFa Tools - Android Studio Project

## রান করার নিয়ম:
1. Android Studio ওপেন করে "Open" চাপুন এবং এই ফোল্ডারটি (The-MoSaFa-Android) সিলেক্ট করুন।
2. Gradle Sync স্বয়ংক্রিয়ভাবে সম্পন্ন হবে।
3. ইউএসবি ক্যাবল দিয়ে আপনার অ্যান্ড্রয়েড ফোন কানেক্ট করুন (ফোনের Developer Options থেকে USB Debugging অন থাকতে হবে)।
4. ওপরের ডিভাইসের ঘরে স্বয়ংক্রিয়ভাবে আপনার ফোনের নাম দেখতে পাবেন।
5. সবুজ **Run ▶️** বাটনে চাপ দিন। আপনার ফোনে সরাসরি ইনস্টল হয়ে যাবে!
  `.trim());

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const outPath1 = path.resolve('public/The-MoSaFa-Tools-Android-Studio-Project.zip');
  const outPath2 = path.resolve('public/Aviator-Android-Studio-Project.zip');

  fs.writeFileSync(outPath1, content);
  fs.writeFileSync(outPath2, content);
  console.log('Generated Android Studio Project zip files successfully!');
}

generateAndroidStudioProject().catch(console.error);
