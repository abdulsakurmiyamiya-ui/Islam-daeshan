# इस्लाम दर्शन (Islam Darshan) — Android Studio Project

यो फोल्डर **इस्लाम दर्शन** एपको पूर्ण, स्वतन्त्र र Android Studio सँग शतप्रतिशत अनुकूल (compatible) नेटिभ एन्ड्रोइड प्रोजेक्ट हो।

---

## १. प्रोजेक्ट फोल्डरको अवस्थिति (Folder Location)

* **रुट डाइरेक्टरी**: `android/`
* **मुख्य मोड्युल**: `android/app/`
* **प्याकेज नाम / Application ID**: `com.islamdarshan.app`
* **लक्षित Android भर्सन**: Min SDK 24 (Android 7.0+) देखि Target SDK 34/35 (Android 14/15)

---

## २. Android Studio मा प्रोजेक्ट कसरी खोल्ने (How to Open in Android Studio)

1. **Android Studio** खोल्नुहोस्।
2. स्वागत स्क्रिनमा **Open** (वा `File` > `Open...`) मा क्लिक गर्नुहोस्।
3. फाइल ब्राउजरमा गएर यस प्रोजेक्टको **`android`** फोल्डर छान्नुहोस् र **OK** थिच्नुहोस्।
   > **महत्वपूर्ण**: मुख्य रुट फोल्डर होइन, **`android`** फोल्डरलाई नै Android Studio को Root Project को रूपमा खोल्नुहोस्।
4. Android Studio ले स्वचालित रूपमा Gradle Sync सुरु गर्नेछ। केही सेकेन्डमा सबै आवश्यक डिपेन्डेन्सीहरू (AndroidX WebKit, Splash Screen, Material Components) डाउनलोड भई प्रोजेक्ट तयार हुनेछ।

---

## ३. APK कसरी बनाउने (How to Build Debug APK)

### विकल्प १: Android Studio को GUI बाट:
1. मेनु बारमा **Build** मा जानुहोस्।
2. **Build Bundle(s) / APK(s)** मा क्लिक गर्नुहोस्।
3. **Build APK(s)** रोज्नुहोस्।
4. निर्माण पूरा भएपछि तल दायाँ कुनामा `locate` भन्ने लिंक देखिनेछ। त्यहाँ क्लिक गर्दा तपाईंको `app-debug.apk` भेटिनेछ:
   * पथ: `android/app/build/outputs/apk/debug/app-debug.apk`

### विकल्प २: Terminal / कमाण्ड लाइनबाट:
टर्मिनलमा `android` फोल्डरभित्र गएर तलको कमाण्ड चलाउनुहोस्:

* **Windows (cmd/powershell)**:
  ```cmd
  gradlew.bat assembleDebug
  ```
* **macOS / Linux**:
  ```bash
  ./gradlew assembleDebug
  ```

---

## ४. Google Play Store का लागि AAB तयार गर्ने तरिका (Release AAB for Google Play Store)

यो प्रोजेक्ट Google Play Store को पछिल्लो नीति (Target SDK 34+, 64-bit support, App Bundle format) अनुसार पूर्ण रूपमा तयार छ।

### Release AAB जेनेरेट गर्न:
1. Android Studio मेनुबाट: **Build** > **Generate Signed Bundle / APK...**
2. **Android App Bundle** छान्नुहोस् र **Next** थिच्नुहोस्।
3. आफ्नो **Key store path**, पासवर्ड र **Key alias** भर्नुहोस् (वा नयाँ `Create new...` गर्नुहोस्)।
4. **release** बिल्ड भेरियन्ट छान्नुहोस् र **Create** मा क्लिक गर्नुहोस्।
5. Google Play Console मा अपलोड गर्न योग्य `.aab` फाइल यहाँ तयार हुनेछ:
   * पथ: `android/app/build/outputs/bundle/release/app-release.aab`

---

## ५. वेब सामग्री अपडेट गर्दा (When updating book content):
भविष्यमा कुनै सामग्री थपघट वा अपडेट गर्दा मुख्य डाइरेक्टरीमा निम्न कमाण्ड चलाउनुहोस्:
```bash
npm run build:android
```
यसले नयाँ वेब बिल्ड स्वतः `android/app/src/main/assets/web/` मा सिङ्क्रोनाइज गरिदिनेछ।
