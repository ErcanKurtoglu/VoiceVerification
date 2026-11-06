# Print It Right: Anket İçerik & Soru Mimarisi Stratejisi

Bu doküman, **VoiceVerification AI** platformu üzerinde yürütülen **Print It Right (Gıdaya Uygun 3B Parça Doğrulama)** projesinin anket içerik tasarımını, saha odaklı soru optimizasyonunu ve katılımcı motivasyonunu artıracak stratejileri belirler.

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

## 2. Saha Odaklı Yaratıcı Soru Tasarımı (Voice-First B2B)

Mühendisler ve fabrika müdürleri genel soyut sorulara soğuk yaklaşır; somut operasyonel terimleri (**OEE, CIP yıkama, OEM bağımlılığı, plansız duruş, göç sertifikası**) duyduklarında ise tecrübelerini aktarmaya çok daha isteklidirler.

| Soru No | Başlık | Yaratıcı Soru Kurgusu (Voice-First) | Hedeflenen Psikolojik Tetikleyici |
| :--- | :--- | :--- | :--- |
| **Soru 1** | Parça Tedarik Süresi & Duruş Maliyeti | **"Geçtiğimiz 1 yılda tek bir yedek parça gecikmesi yüzünden dolum veya üretim hattınızın durduğu en kritik anı ve o günkü OEM teslim süresini anlatabilir misiniz?"**<br>*İpucu: "Yurtdışından veya OEM'den haftalarca beklenen bir nozul, conta veya özel dişli... O duruş OEE'nizi veya sevkiyatınızı nasıl etkiledi?"* | **Hafıza Canlandırma (Recall Heuristic):** Soyut maliyet tahmininden somut yaşanmış kriz anına odaklama. |
| **Soru 2** | 3B Baskıda Gıda Güvenliği & Hijyen Çekinceleri | **"Gıdayla temas eden bir parçayı 3B yazıcıyla üretip hatta takacak olsaydınız, sizi gece uykusuz bırakacak en büyük teknik veya denetim riski ne olurdu?"**<br>*İpucu: "CIP kostik yıkaması, 120°C buhar sterilizasyonu, yüzeydeki bakteri tutulumu mu yoksa gıda denetçisine gösterilecek göç (migrasyon) sertifikası mı?"* | **Risk & Hijyen Kaygısı:** Doğrudan en büyük korkuyu ve teknik engeli su yüzüne çıkarma. |
| **Soru 3** | AI Hizmet Modeli & Satın Alma Tercihi | **"Kırılan parçanın yerine 48 saatte sertifikalı teslimat sağlayan bir modelde; doğrudan 'parça başı fatura' mı yoksa 'yıllık hat garantisi aboneliği' mi fabrikanızın satın alma prosedüründen daha kolay geçer?"**<br>*İpucu: "Satın alma onay limitlerinizi veya plansız bakım bütçesi esnekliğinizi düşünerek yanıtlayabilirsiniz."* | **Satın Alma Gerçekliği:** Soyut tercih yerine fabrika satın alma komitesinin onay mekanizmasını sorgulama. |

---

## 3. Katılımcı Bağlılığı & "Give-to-Get" Değer Değişimi

Fabrika yöneticilerinin ve mühendislerin anket tamamlama oranını maksimize etmek için **"Give-to-Get" (Almak İçin Ver)** ilkesi uygulanır:

1. **Ödül & Karşılık (Incentive):**
   * Katılımcıya anket sonunda **"2026 Türkiye Gıda İmalatında Plansız Duruşlar & 3B Parça Benchmark Raporu (Yönetici Özeti)"** sunulacağı açıkça taahhüt edilir.
2. **Kişiselleştirilmiş Karşılaştırma:**
   * Anket tamamlandığında katılımcının sağladığı verilerin anonimleştirilmiş sektörel içgörülere katkısı belirtilir.
3. **AI Asistan Rehberliği:**
   * Sorularda tereddüt eden katılımcı için asistan; "Örneğin Tetra Pak, Krones veya GEA hatlarında karşılaşılan nozul aşınmalarını veya CIP yıkama kimyasallarını düşünebilirsiniz" gibi spesifik marka ve hat örnekleriyle katılımcıyı destekler.
