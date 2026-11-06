# VoiceVerification AI 🎙️

Asenkron, ses odaklı sektörel doğrulama ve içgörü toplama platformu. 
Katılımcıların yapay zeka rehberliğinde sesli veya yazılı olarak soruları yanıtlayabildiği, anti-çöp veri (bot, sessizlik, düşük kalite engelleme) ve KVKK/GDPR korumalı bir araştırma altyapısıdır.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FErcanKurtoglu%2FVoiceVerification&env=GEMINI_API_KEY)

---

## 🚀 Temel Yetenekler & Özellikler

1. **Ses Odaklı & Metin Eşitliği:**
   - Web Audio API ile gerçek zamanlı desibel & dalga formu (waveform) animasyonu.
   - Yazarak yanıtlama ("Yazarak Yanıtla") alternatifi.
   - Soru geçişlerinde önceki soruya dönebilme ve kaydedilen sesleri dinleyebilme/tekrar kaydedebilme imkanı.

2. **Dinamik Anket Mimarisi & Erişim Güvenliği:**
   - Her anket bağımsız bir modül olarak `src/surveys/` altında tanımlanır.
   - Yetkisiz doğrudan URL girişleri engellenir (`AccessDeniedCard`).
   - Zaman kısıtlı (TTL) imzalı tokenlar veya kampanya kodları (`PIR-2026`) ile güvenli erişim.
   - CRM ve e-posta kampanyaları için katılımcı takip parametreleri (`?uid=...&lead=...`).

3. **Anti-Garbage & Veri Bütünlüğü Motoru:**
   - **Ses Kalitesi & Süre Kontrolü:** 2 saniyeden kısa veya sessiz/parazit kayıtlar istemcide engellenir.
   - **Honeypot Bot Koruması:** Gizli alanları dolduran botlar anında elenir.
   - **Deşifre Odaklı AI:** Google Gemini 2.5 Flash modeli ile ses kayıtlarının birebir ve yüksek doğruluklu transkripti çıkarılır.

4. **Hiyerarşik Ses Depolama:**
   - Ses dosyaları `audio/{surveyId}/{sessionId}/{questionId}.webm` dizin hiyerarşisinde düzenli olarak saklanır (yerel fallback ve Supabase entegrasyonuna hazır).

5. **KVKK, GDPR & Biyometrik Veri Güvencesi:**
   - Ses kayıtlarının yalnızca metne dönüştürme ve içerik analizi amacıyla kullanıldığı, biyometrik kimlik eşleştirmesi yapılmadığı açıkça taahhüt edilir.

---

## 🛠️ Kurulum & Geliştirme

### Gereksinimler
- Node.js 18+
- [Google AI Studio](https://aistudio.google.com/) üzerinden ücretsiz bir Gemini API Anahtarı

### Adımlar

1. Depoyu klonlayın ve bağımlılıkları yükleyin:
```bash
git clone https://github.com/ErcanKurtoglu/VoiceVerification.git
cd VoiceVerification
npm install
```

2. Ortam değişkenlerini ayarlayın:
```bash
cp .env.example .env.local
# .env.local dosyasına GEMINI_API_KEY bilginizi ekleyin
```

3. Testleri çalıştırın:
```bash
npm test
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## 🔗 Hızlı Test Bağlantıları

- **Ana Sayfa / Karşılama:** `http://localhost:3000/`
- **Aktif Anket (Erişim Kodlu):** `http://localhost:3000/s/print-it-right?code=PIR-2026`
- **Yetkisiz Giriş Örneği (Engelleme Sayfası):** `http://localhost:3000/s/print-it-right`
- **CRM Takip Örneği:** `http://localhost:3000/s/print-it-right?code=PIR-2026&uid=usr_101&lead=fabrika_a`
- **Yönetici Paneli (Transkriptler & Ses Kayıtları):** `http://localhost:3000/admin`

---

## ☁️ Vercel Üzerinde Canlıya Alma (100% Ücretsiz)

1. [Vercel](https://vercel.com) hesabınıza giriş yapın.
2. **Add New... -> Project** seçeneğini tıklayın.
3. `ErcanKurtoglu/VoiceVerification` deposunu import edin.
4. **Environment Variables** bölümüne:
   - `GEMINI_API_KEY`: Google AI Studio'dan aldığınız API anahtarını ekleyin.
5. **Deploy** butonuna tıklayın.

Tebrikler! Platformunuz canlı ortamda çalışmaya başlayacaktır.
