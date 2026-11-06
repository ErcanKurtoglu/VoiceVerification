# Survey Access & Expiring Invitation Architecture Specification

Bu doküman, VoiceVerification AI platformunda anket bağlantılarının güvenliği, geçerlilik süresi (Time-To-Live / TTL), katılımcı izleme (Tracking) ve erişim yönetimi standartlarını tanımlar.

---

## 1. Mimari Gereksinim & Problem Tanımı
* **Doğrudan/Rastgele Giriş Koruması:** Rastgele bir kullanıcının anket adresine (`/s/[surveyId]`) yetkisiz erişmesi engellenir.
* **Süreli Bağlantılar (Expiring Links):** Katılımcılara gönderilen davet bağlantıları sonsuza kadar açık kalmaz; varsayılan olarak **7 gün** (veya belirlenen süre) sonra otomatik geçersiz hale gelir.
* **Landing Page Yönlendirmesi:** Geçerli bir davet bağlantısı veya kodu olmayan tüm ziyaretçiler platformun ana sayfasına (`/`) veya `AccessDenied` arayüzüne yönlendirilir.

---

## 2. Sektör Standartlarına Göre 3 Kademeli Erişim Modeli

Platform, modern SaaS ve araştırma standartlarına (UserTesting, Maze, Typeform) uygun olarak 3 erişim yöntemini destekler:

| Yöntem | Format | Kullanım Senaryosu | Güvenlik Düzeyi |
| :--- | :--- | :--- | :--- |
| **A) Süreli İmzalı Token (Signed Token)** | `/s/[id]?token=eyJ...` | Bireysel katılımcılara e-posta veya CRM ile gönderilen kişisel süreli davetler | **Çok Yüksek** (TTL + Payload korumalı) |
| **B) Kampanya / Erişim Kodu (Access Code)** | `/s/[id]?code=PIR-2026` veya Landing Page'de kod girişi | LinkedIn/etkinlik bültenlerinde toplu paylaşılan kontrollü kampanya kodları | **Yüksek** (Süreli & Kod bazlı) |
| **C) CRM / Parametrik İzleme (Tracking URL)** | `/s/[id]?uid=usr_42&ref=linkedin` | Kurumsal CRM ve sosyal medya outreach kampanyaları | **Yüksek** (Attribution & Kayıt) |

---

## 3. Token & Süre (TTL) Doğrulama Mantığı

`src/services/invitation/token.ts` modülü şu pipeline üzerinden çalışır:
```text
[ Gelen İstek: /s/[surveyId] ]
        │
        ├── 1. Geliştirici Kısayolu mu? (?n=e) ─────────────► [ İzin Ver (Dev Mode) ]
        ├── 2. Kampanya Kodu mu? (?code=...)
        │        ├── Kod eşleşti mi?
        │        └── Süresi (exp) geçerli mi? ──────────────► [ İzin Ver ]
        ├── 3. İmzalı Token mı? (?token=...)
        │        ├── Base64URL payload decode
        │        ├── Survey ID eşleşti mi?
        │        └── Date.now() < payload.exp mi? ──────────► [ İzin Ver ]
        ├── 4. CRM Parametreleri var mı? (?uid=... | ?ref=...) ► [ İzin Ver & Track Et ]
        └── 5. Hiçbir yetki yoksa ──────────────────────────► [ AccessDeniedCard & Landing Page ]
```

---

## 4. Kod Standartları & Entegrasyon Noktaları
* **Erişim Değerlendirme Motoru:** `src/services/invitation/token.ts`
* **Dinamik Rota Koruması:** `src/app/s/[surveyId]/page.tsx`
* **Yetkisiz Erişim Arayüzü:** `src/features/interview/components/AccessDeniedCard.tsx`
* **Ana Karşılama Portalı (Landing Page):** `src/app/page.tsx`
