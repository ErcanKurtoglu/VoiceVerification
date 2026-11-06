# Print It Right: Anket İçerik Mimarisi & A/B Test Stratejisi

Bu doküman, **VoiceVerification AI** platformu üzerinde yürütülen **Print It Right (Gıdaya Uygun 3B Parça Doğrulama)** projesinin anket içerik tasarımını, soruların optimizasyonunu, katılımcı motivasyonunu artıracak yaratıcı yaklaşımları ve bilimsel A/B test kurgularını belirler.

---

## 1. Proje Amacı & Temel Dinamikler

### 1.1. Çözülen Problem
Gıda ve içecek sanayiinde (süt fabrikaları, dolum hatları, unlu mamuller, konserve ve ambalaj hatları), aşınan veya kırılan küçük bir parça (özel conta, dolum nozulu, şişe tutucu yıldız dişli, pnömatik valf bağlantısı) tedarik zinciri veya OEM kaynaklı gecikmeler nedeniyle **3 ila 8 hafta** teslim süresi yaratabilmektedir. 
* Bir dolum hattının plansız duruş maliyeti saatte **3.000 € ile 25.000 €** arasında değişir.
* Gıda güvenliği standartları (**EU 1935/2004, FDA 21 CFR 177, EHEDG**) ve yerinde temizlik kimyasalları (**CIP - Kostik, Perasetik Asit, Sıcak Buhar**), standart 3B yazıcı malzemelerinin kullanılmasına izin vermez.

### 1.2. Print It Right Çözüm Hipotezi
* Mühendis veya teknisyen arızalı parçanın fotoğrafını/ölçülerini girer.
* AI generatif tasarım motoru parçayı gıda temas onaylı yüksek performans polimerlerine (**PEEK, PPSU, Sertifikalı Naylon**) göre optimize eder.
* 24-48 saat içinde sertifikalı, gözeneksiz ve test edilmiş parça tesise teslim edilir.

---

## 2. Mevcut Anketin Analizi ve Yaratıcı İyileştirmeler

### 2.1. Mevcut Durum (src/surveys/print-it-right.ts)
Mevcut anket 3 temel soru içermektedir:
1. **Duruş Maliyeti & Parça Tedariki**
2. **Gıda Güvenliği & Hijyen Çekinceleri**
3. **AI Hizmet Modeli & Satın Alma Tercihi**

### 2.2. Saha Mühendislerinin Dilinden Yaratıcı İçerik Revizyonu

Mühendisler ve fabrika müdürleri genel soyut sorulara soğuk yaklaşır; somut operasyonel terimleri (**OEE, CIP yıkama, OEM bağımlılığı, plansız duruş**) duyduklarında ise tecrübelerini aktarmaya çok daha isteklidirler.

| Soru No | Eski Başlık & Ton | Yeni Önerilen Yaratıcı Soru Kurgusu (Voice-First) | Hedeflenen Psikolojik Tetikleyici |
| :--- | :--- | :--- | :--- |
| **Soru 1** | Parça Tedarik Süresi & Duruş Maliyeti | **"Geçtiğimiz 1 yılda tek bir yedek parça gecikmesi yüzünden hattınızın durduğu en kritik anı ve o günkü OEM teslim süresini anlatabilir misiniz?"**<br>*İpucu: "Yurtdışından gelen bir nozul, conta veya özel dişli... O duruş OEE'nizi veya sevkiyatınızı nasıl etkiledi?"* | **Hafıza Canlandırma (Recall Heuristic):** Soyut maliyet tahmininden somut yaşanmış kriz anına odaklama. |
| **Soru 2** | 3B Baskı Parçalarda Gıda Güvenliği Çekinceleri | **"Gıdayla temas eden bir parçayı 3B yazıcıyla üretip hatta takacak olsaydınız, sizi gece uykusuz bırakacak en büyük teknik veya denetim riski ne olurdu?"**<br>*İpucu: "CIP kostik yıkaması, 120°C buhar sterilizasyonu, yüzeydeki bakteri tutulumu mu yoksa gıda denetçisine gösterilecek sertifika mı?"* | **Risk & Hijyen Kaygısı:** Doğrudan en büyük korkuyu ve teknik engeli su yüzüne çıkarma. |
| **Soru 3** | AI Destekli Tasarım & Satın Alma Tercihi | **"Kırılan parçanın yerine 48 saatte sertifikalı teslimat sağlayan bir modelde; doğrudan 'parça başı fatura' mı yoksa 'yıllık hat garantisi aboneliği' mi fabrikanızın satın alma prosedüründen daha kolay geçer?"**<br>*İpucu: "Satın alma onay limitlerinizi veya plansız bakım bütçesi esnekliğinizi düşünerek yanıtlayabilirsiniz."* | **Satın Alma Gerçekliği:** Soyut tercih yerine fabrika satın alma komitesinin onay mekanizmasını sorgulama. |

---

## 3. Katılımcı Bağlılığı & "Give-to-Get" Değer Değişimi

Fabrika yöneticilerinin ve mühendislerin anket tamamlama oranını %15'ten %60+'ya çıkarmak için **"Give-to-Get" (Almak İçin Ver)** ilkesi uygulanmalıdır:

1. **Ödül & Karşılık (Incentive):**
   * Katılımcıya anket sonunda **"2026 Türkiye Gıda İmalatında Plansız Duruşlar & 3B Parça Benchmark Raporu (Yönetici Özeti)"** sunulacağı taahhüt edilir.
2. **Kişiselleştirilmiş Karşılaştırma:**
   * "Soru 1'i tamamladığınızda, kendi duruş sürenizi sektör ortalamasıyla anlık kıyaslayan mikro grafiği göreceksiniz."
3. **AI Asistan Güçlendirmesi:**
   * Sorularda tereddüt eden katılımcı için asistan; "Örneğin Tetra Pak, Krones veya GEA hatlarında karşılaşılan nozul aşınmalarını düşünebilirsiniz" gibi spesifik marka ve hat örnekleriyle yönlendirir.

---

## 4. Bilimsel A/B Test Mimarisi (4 Temel Deney)

Platformun dönüşüm (conversion) ve sesli yanıt kalitesini maksimize etmek için aşağıdaki 4 deney kurgulanmıştır:

### A/B Test 1: Başlık & Değer Önerisi Çerçevesi (Landing Page & Onboarding)
* **Hipotez:** Kayıptan kaçınma (Loss Aversion) odaklı başlık, inovasyon odaklı başlığa göre fabrika yöneticilerinde %35 daha yüksek başlama oranı (Start Rate) sağlayacaktır.
* **Varyant A (Kayıptan Kaçınma):** *"Gıda Hattınızda Tek Bir Parça Yüzünden Saatte 10.000 € Kaybetmeyin: Plansız Duruşları 48 Saatte Çözen Yeni Nesil 3B Doğrulama"*
* **Varyant B (Gelecek & İnovasyon):** *"Yapay Zeka ve Gıda Sertifikalı 3B Baskı ile Parça Üretiminde Yeni Çağ: Türkiye Gıda Sanayii Araştırması"*
* **Ölçülecek Metrikler:** Form tamamlama oranı, Form terk oranı.

### A/B Test 2: Sesli ve Yazılı Yanıt Önceliği (UX Modality Prompt)
* **Hipotez:** Mikrofona basmayı tek aksiyon olarak öne çıkaran arayüz, sesli yanıt oranını artırırken; hemen altında "Yazarak Devam Et" butonu psikolojik güvenlik sağlayarak terk oranını düşürecektir.
* **Varyant A (Ses Öncelikli Odak):** Dev mikrofon butonu merkezde; ses dalgası animasyonu aktif. Yazılı yanıt sekmesi ikincil link olarak altta.
* **Varyant B (Eşit Sekmeli Seçici):** "Sesli Yanıt" ve "Yazılı Yanıt" üstte %50-%50 genişlikte iki eşit sekme olarak sunulur.
* **Ölçülecek Metrikler:** Sesli Yanıt / Yazılı Yanıt Oranı, Ortalama Konuşma Süresi (Saniye), Yanıt Zenginliği (Kelime Sayısı).

### A/B Test 3: Soru Derinliği ve Uzunluğu
* **Hipotez:** 3 soru katılımcıyı yormadan optimum derinlik sağlarken, 4. soru olarak "Opsiyonel Derinleşme" sorusu sunmak en değerli %20'lik uzman gruptan altın içgörüleri çekecektir.
* **Varyant A (Yalın 3 Soru):** Sabit 3 soru (Duruş, Hijyen, Satın Alma).
* **Varyant B (3+1 Aşamalı Derinleşme):** 3 temel soru bittikten sonra: *"Tesisinizde 3B yazıcıyla test etmek isteyeceğiniz ilk spesifik parçayı bize tarif etmek ister misiniz? (Opsiyonel)"*
* **Ölçülecek Metrikler:** 3. soru tamamlama oranı, Opsiyonel soruya katılım oranı.

### A/B Test 4: Güvenlik & Gizlilik Vurgusu
* **Hipotez:** Sayfanın en başında "Biyometrik ses izi alınmaz, ticari sırlar anonimleştirilir" rozeti bulunan kurgu, kurumsal e-posta ile giriş oranını %40 artıracaktır.
* **Varyant A:** Standart gizlilik metni (Klasik KVKK linki).
* **Varyant B:** Vurgulu Güven Rozeti: *"Kurumsal Gizlilik Korumalı: Fabrika marka ve model bilgileriniz raporlarda tamamen anonimleştirilir."*

---

## 5. Uygulama ve İzleme Kriterleri

Tüm A/B varyantları URL parametreleri (`?var=a` veya `?var=b`) ve oturum tracking verisi (`tracking.variant`) ile kaydedilmeli, `src/services/storage/interface.ts` ve Admin paneli üzerinden varyant bazlı analiz edilebilmelidir.
