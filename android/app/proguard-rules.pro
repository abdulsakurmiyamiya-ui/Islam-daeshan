# ProGuard rules for Islam Darshan
# Keep JavascriptInterface methods accessible from WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface

# Keep WebAppInterface explicitly
-keep class com.islamdarshan.app.WebAppInterface {
    *;
}
