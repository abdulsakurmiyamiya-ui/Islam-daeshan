export interface AndroidSourceFile {
  filename: string;
  path: string;
  language: string;
  code: string;
  description: string;
}

export const NATIVE_ANDROID_FILES: AndroidSourceFile[] = [
  {
    filename: 'MainActivity.kt',
    path: 'app/src/main/java/com/islamdarshan/app/MainActivity.kt',
    language: 'kotlin',
    description: 'Jetpack Compose को मुख्य एक्टिभिटी, नेभिगेसन तथा अडियो/थिम ह्यान्डलर',
    code: `package com.islamdarshan.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.islamdarshan.app.ui.theme.IslamDarshanTheme
import com.islamdarshan.app.ui.screens.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            IslamDarshanTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF021810)
                ) {
                    IslamDarshanApp()
                }
            }
        }
    }
}

@Composable
fun IslamDarshanApp() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "cover") {
        composable("cover") {
            CoverScreen(
                onStartReading = { navController.navigate("reader/ch-1") },
                onOpenTOC = { navController.navigate("toc") },
                onOpenFAQ = { navController.navigate("faq") }
            )
        }
        composable("toc") {
            TableOfContentsScreen(
                onSelectChapter = { chapterId -> navController.navigate("reader/$chapterId") },
                onBack = { navController.popBackStack() }
            )
        }
        composable("reader/{chapterId}") { backStackEntry ->
            val chapterId = backStackEntry.arguments?.getString("chapterId") ?: "ch-1"
            BookReaderScreen(
                chapterId = chapterId,
                onBack = { navController.popBackStack() },
                onNextChapter = { nextId -> navController.navigate("reader/$nextId") }
            )
        }
        composable("faq") {
            FAQScreen(onBack = { navController.popBackStack() })
        }
    }
}
`,
  },
  {
    filename: 'BookReaderScreen.kt',
    path: 'app/src/main/java/com/islamdarshan/app/ui/screens/BookReaderScreen.kt',
    language: 'kotlin',
    description: 'पुस्तक पठन स्क्रिन: फन्ट साइज, कुरआन आयत/हदीस कार्ड, जिज्ञासा बक्स र प्रतिक्रिया',
    code: `package com.islamdarshan.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookReaderScreen(
    chapterId: String,
    onBack: () -> Unit,
    onNextChapter: (String) -> Unit
) {
    var fontSize by remember { mutableStateOf(16) }
    var inquiryText by remember { mutableStateOf("") }
    var isAnonymous by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "अध्याय १: म को हुँ?",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFFEF3C7)
                        )
                        Text(
                            "अस्तित्व, चेतना र जीवनको उद्देश्य",
                            fontSize = 11.sp,
                            color = Color(0xFFA7F3D0)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { if (fontSize > 12) fontSize -= 2 }) {
                        Text("A-", color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
                    }
                    IconButton(onClick = { if (fontSize < 24) fontSize += 2 }) {
                        Text("A+", color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF021810))
            )
        },
        containerColor = Color(0xFFFCFAF4)
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(8.dp))
                // Bismillah Banner
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF021810), RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                        color = Color(0xFFF59E0B),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            item {
                Text(
                    text = "हामी किन यहाँ छौँ? के हाम्रो जन्म केवल संयोग हो, वा कुनै महान् उद्देश्यको सुरुवाती पाइला?",
                    fontSize = fontSize.sp,
                    lineHeight = (fontSize * 1.6).sp,
                    color = Color(0xFF1C1917)
                )
            }

            // Quran Ayah Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF04271B))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
                            color = Color(0xFFFBBF24),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "\\"मैले जिन्न र मानिसलाई केवल आफ्नो उपासना र पहिचानका लागि मात्र सृष्टि गरेको हुँ।\\"",
                            color = Color(0xFFFEF3C7),
                            fontSize = 14.sp
                        )
                        Text(
                            "— सूरह अज्-जारियात [५१:५६]",
                            color = Color(0xFF6EE7B7),
                            fontSize = 11.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }

            // Inquiry Box
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF3F4F6))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "यस अध्यायबारे तपाईंको मनमा कुनै जिज्ञासा छ?",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color(0xFF064E3B)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = inquiryText,
                            onValueChange = { inquiryText = it },
                            placeholder = { Text("तपाईंको प्रश्न यहाँ लेख्नुहोस्...", fontSize = 13.sp) },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(checked = isAnonymous, onCheckedChange = { isAnonymous = it })
                            Text("गुमनाम रूपमा पठाउनुहोस्", fontSize = 12.sp)
                        }
                        Button(
                            onClick = { /* Submit question to local database */ },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF064E3B))
                        ) {
                            Text("प्रश्न पठाउनुहोस्", color = Color(0xFFFEF3C7))
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    filename: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Gradle बिल्ड कन्फिगरेसन (Android SDK 36, Jetpack Compose, Kotlin 2.2)',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "com.islamdarshan.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.islamdarshan.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    signingConfigs {
        create("debugConfig") {
            storeFile = file("\${rootDir}/debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildTypes {
        debug {
            signingConfig = signingConfigs.getByName("debugConfig")
        }
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    kotlinOptions {
        jvmTarget = "21"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.compose.material.icons.extended)
}
`,
  },
  {
    filename: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest: अनुमति, थिम, एप आइकन तथा लन्चर एक्टिभिटी',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="इस्लाम दर्शन"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.IslamDarshan">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.IslamDarshan"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
];
