# VoiceVerification AI — KVKK & GDPR Veri Toplama ve Gizlilik Politikası

**Yürürlük Tarihi:** 6 Kasım 2026  
**Mevzuat Uyumu:** 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve Avrupa Birliği Genel Veri Koruma Tüzüğü ("GDPR" - Regulation EU 2016/679)

---

## 1. Veri Sorumlusu Bilgilendirmesi

**VoiceVerification AI** ve **Print It Right** araştırma konsorsiyumu ("Veri Sorumlusu"), kullanıcıların ve katılımcıların kişisel verilerinin korunmasına, veri güvenliğine ve şeffaflık ilkelerine en üst düzeyde bağlıdır.

İşbu Aydınlatma Metni; platformumuz üzerinden toplanan kişisel verilerin hangi hukuki sebeplerle işlendiğini, hangi yöntemlerle aktarıldığını ve katılımcıların kanuni haklarını detaylandırmak üzere hazırlanmıştır.

---

## 2. İşlenen Kişisel Veri Kategorileri

| Veri Kategorisi | Veri Kalemleri | Toplama Amacı | Hukuki Sebep |
| :--- | :--- | :--- | :--- |
| **Kimlik Bilgisi** | Ad, Soyad | Katılımcıyı tanımlama, araştırma doğrulama raporunda yetkilendirme | KVKK m.5/1 (Açık Rıza) & GDPR m.6/1(a) |
| **İletişim Bilgisi** | Kurumsal/Kişisel E-posta, LinkedIn Profil URL'si | Araştırma sonuç raporunu iletme, takip soruları, A/B test geri bildirimi | KVKK m.5/1 (Açık Rıza) |
| **Mesleki Deneyim** | Şirket/Tesis Adı, Unvan/Rol (Bakım Müh., Tesis Md. vb.) | Hedef kitle (B2B persona) segmentasyonu, sektörel doğruluk teyidi | KVKK m.5/2(f) (Meşru Menfaat) |
| **Ses Verisi** | Mikrofon aracılığıyla kaydedilen ham ses dosyası (`.webm`, `.wav`, `.mp4`) | Yapay zeka ile metne dönüştürme (transkripsiyon), konuşma uzunluğu ve nitelik analizi | **KVKK m.5/1 (Özel Açık Rıza)** |
| **Metin & Anket Yanıtları** | Sesin deşifre edilmiş metni veya yazılı yanıt formu içeriği | Ürün-pazar uyumu (PMF) analizi, gıda sertifikasyonu ve duruş maliyeti modelleme | KVKK m.5/1 & m.5/2(f) |
| **İşlem Güvenliği & Cihaz** | IP adresi, tarayıcı bilgisi, ses RMS enerji seviyesi, honeypot bot sinyalleri, token oturumu | Bot engelleme (Anti-Garbage), spam önleme, platform siber güvenliği | KVKK m.5/2(f) (Meşru Menfaat) |

---

## 3. Biyometrik Veri Sınırı ve Güvence Bildirimi (Kritik Taahhüt)

> [!IMPORTANT]
> **Ses Kayıtları Asla Biyometrik Veri Olarak İşlenmez:**  
> KVKK m.6 ve GDPR m.9 kapsamında biyometrik veriler özel nitelikli kişisel veri sayılmaktadır.  
> **Platformumuz, katılımcının ses kayıtlarını akustik ses izi (voice biometric template), sesli kimlik doğrulama, ses klonlama veya kişi teşhisi amacıyla KESİNLİKLE İŞLEMEZ.**
> 
> Ses dalgaları yalnızca standart dil modelleri (NLP) aracılığıyla yazılı metne dönüştürülmekte ve ardından semantik olarak incelenmektedir. İşlem tamamlandıktan sonra ses kaydı ham veri niteliğini yitirir ve imha protokolüne tabi tutulur.

---

## 4. İki Kademeli Açık Rıza ve Kullanıcı Kontrolü

Platformumuzda katılımcının onay özgürlüğü "katmanlı şeffaflık" ilkesiyle korunur:

1. **Ön Bilgilendirme ve Onay Kutusu (Onboarding):**
   * Katılımcı görüşmeye başlamadan önce onay kutusunu işaretlemek zorundadır:
   * *"Ses kaydımın bu araştırma kapsamında yapay zeka modelleriyle deşifre edilmesini ve anonimleştirilerek sektörel doğrulamada işlenmesini kabul ediyorum."*
2. **Kayıt Sonrası Geri Çekme ve Silme Hakkı (In-Interview Control):**
   * Katılımcı kaydettiği sesi göndermeden önce dinleyebilir, silebilir ve yeniden kaydedebilir.
   * Dilediği an ses kaydından vazgeçip tek bir tıklama ile **"Yazarak Yanıtla"** moduna geçebilir.
   * Onay verilmeden sunucuya hiçbir ses aktarımı yapılmaz.

---

## 5. Çerezler, Oturum Yönetimi ve Yerel Depolama (LocalStorage)

Platform; katılımcı deneyimini korumak ve güvenliği sağlamak amacıyla sınırlı teknik çerezler ve istemci önbelleği (localStorage) kullanır:

1. **Taslak Senkronizasyonu (Draft Resilience):** Katılımcının yanıtları tarayıcı yenilemelerine karşı yerel depolamada (`draft_session_[surveyId]`) geçici olarak tutulur. Katılımcı gönderimi tamamladığında veya 24 saat sonra bu taslak otomatik imha edilir.
2. **Süreli Davet Token Doğrulaması:** Yetkisiz erişimleri engellemek için URL parametrelerinde yer alan süreli token (`exp`) kontrol edilir.
3. **Anti-Garbage Sinyalleri:** Ses enerjisi (RMS > 0.015) ve honeypot bot tuzağı gibi kontroller istemci seviyesinde çalıştırılarak gereksiz veri transferi önlenir.

---

## 6. Veri Saklama ve Otomatik İmha Takvimi

* **Ham Ses Dosyaları:** Transkripsiyon ve kalite denetimi tamamlandıktan sonra en geç **30 (otuz) gün** içerisinde güvenli silme protokolleriyle depolama alanından (S3/R2/Local Storage) kalıcı olarak silinir.
* **Metin Yanıtları:** Sektörel benchmark raporları oluşturulurken şirket ve kişi isimleri tamamen anonimleştirilir (`Fabrika A - Süt Dolum Tesisi`, `Bakım Mühendisi B` formatında kodlanır). Anonim veriler istatistiki araştırmalar için 12 ay boyunca saklanabilir.
* **Tamamlanmamış / Terk Edilmiş Oturumlar:** 24 saatten eski yarım kalmış taslaklar temizleme job'ları tarafından otomatik silinir.

---

## 7. İlgili Kişinin Hakları (KVKK m.11 & GDPR m.15-22)

Her katılımcı, veri sorumlusuna başvurarak aşağıdaki haklarını kullanabilir:
1. Kişisel verilerinin işlenip işlenmediğini öğrenme,
2. İşlenmişse buna ilişkin bilgi talep etme,
3. İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,
4. Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,
5. Eksik veya yanlış işlenmişse düzeltilmesini isteme,
6. KVKK m.7 çerçevesinde silinmesini veya yok edilmesini talep etme,
7. Ses kaydının derhal silinmesini ve araştırmadan çıkarılmasını isteme (Rızayı Geri Çekme).

**Başvuru İletişim Kanalı:** Katılımcılar haklarını kullanmak için kayıt oldukları e-posta adresinden `privacy@voiceverify.ai` (veya proje iletişim yetkilisi) adresine talep iletebilirler. Talepler en geç 30 gün içinde ücretsiz sonuçlandırılır.
