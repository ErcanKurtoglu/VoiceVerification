export type Language = "tr" | "en";

export interface Translations {
  // Navigation & Common
  brandTagline: string;
  langTr: string;
  langEn: string;
  backToHome: string;
  or: string;

  // Landing Page Hero
  heroBadge: string;
  heroTitleStart: string;
  heroTitleHighlight: string;
  heroTitleEnd: string;
  heroDescription: string;

  // Landing Page PIN Card
  pinCardTitle: string;
  pinCardSubtitle: string;
  pinLabel: string;
  pinPlaceholder: string;
  pinHelper: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  titleLabel: string;
  titlePlaceholder: string;
  consentCheckbox: string;
  termsLink: string;
  kvkkLink: string;
  submitButtonText: string;
  submittingText: string;
  pinError: string;
  missingFieldsError: string;
  consentError: string;
  sessionRestoredInfo: string;
  sessionVerifiedInfo: string;

  // Landing 3 Steps
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // Landing Features
  featuresTitle: string;
  featuresSubtitle: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  feat4Title: string;
  feat4Desc: string;

  // Footer
  footerNoBiometrics: string;
  footerKvkk: string;
  footerTerms: string;
  footerBiometricPolicy: string;
  footerCopyright: string;

  // Onboarding Form (Survey Entrance)
  onboardingTitle: string;
  onboardingEstimatedTime: string;
  onboardingSubtitle: string;
  onboardingStartBtn: string;

  // Question Card
  questionProgress: string;
  clarificationHintTitle: string;
  tabAudio: string;
  tabText: string;
  recordStart: string;
  recordStop: string;
  recordListening: string;
  recordRerecord: string;
  recordSuccess: string;
  textSuccess: string;
  textPlaceholder: string;
  askAssistant: string;
  nextQuestion: string;
  prevQuestion: string;
  finishSurvey: string;

  // Feedback Form
  feedbackBadge: string;
  feedbackBackToQuestions: string;
  feedbackTitle: string;
  feedbackSubtitle: string;
  feedbackRatingLabel: string;
  feedbackNoRatingYet: string;
  feedbackTagsTitle: string;
  feedbackTagsSubtitle: string;
  feedbackTags: string[];
  feedbackNotesLabel: string;
  feedbackNotesPlaceholder: string;
  feedbackSubmitBtn: string;
  feedbackSubmittingBtn: string;

  // Completion Card
  completionTitle: string;
  completionSubtitle: string;
  completionBadgeTitle: string;
  completionBadgeDesc: string;

  // Already Completed Card
  alreadyCompletedTitle: string;
  alreadyCompletedSubtitle: string;
  alreadyCompletedDesc: string;

  // Access Denied Card
  accessDeniedTitle: string;
  accessDeniedSubtitle: string;
  accessDeniedDesc: string;
  accessDeniedPinInputPlaceholder: string;
  accessDeniedSubmitBtn: string;
}

export const translations: Record<Language, Translations> = {
  tr: {
    brandTagline: "Asenkron Sesli Doğrulama Altyapısı",
    langTr: "TR",
    langEn: "EN",
    backToHome: "Ana Sayfaya Dön",
    or: "veya",

    heroBadge: "Sektörel Pazar Doğrulaması & Asenkron Niteliksel İçgörü",
    heroTitleStart: "Sektör Liderlerine Danışmanın ",
    heroTitleHighlight: "En Akıcı ve Güvenilir",
    heroTitleEnd: " Yolu",
    heroDescription:
      "Takvim uyuşmazlığı ve yanıtsız anketler geride kaldı. Profesyoneller kendi tempolarında, 3 dakikada sesli veya yazılı yanıt verir; yapay zeka analiz motorumuz hipotezleri doğrular.",

    pinCardTitle: "Erişim Kodu (PIN) ile Görüşmeye Katılın",
    pinCardSubtitle:
      "Size iletilen PIN kodunu ve bilgilerinizi girerek doğrudan ilgili araştırmaya başlayabilirsiniz.",
    pinLabel: "Anket Erişim Kodu (PIN)",
    pinPlaceholder: "Örn: PIR-2026",
    pinHelper: "Örnek Aktif PIN: PIR-2026",
    fullNameLabel: "Ad Soyad",
    fullNamePlaceholder: "Örn: Burak Kaya",
    emailLabel: "E-posta",
    emailPlaceholder: "burak@sirketiniz.com",
    companyLabel: "Şirket / Kurum",
    companyPlaceholder: "Örn: Fabrika veya Bağımsız",
    titleLabel: "Unvan / Rol",
    titlePlaceholder: "Örn: Üretim Mühendisi",
    consentCheckbox:
      "Ses kaydımın deşifre edilmesini, anonim olarak işlenmesini ve Kullanım Şartları ile KVKK Aydınlatma Metnini kabul ediyorum.",
    termsLink: "Kullanım Şartları",
    kvkkLink: "KVKK Aydınlatma Metnini",
    submitButtonText: "Doğrula ve Görüşmeye Başla",
    submittingText: "Oturum Doğrulanıyor & Başlatılıyor...",
    pinError: "Lütfen size iletilen anket erişim kodunu (PIN) giriniz.",
    missingFieldsError: "Lütfen tüm zorunlu katılımcı alanlarını doldurunuz.",
    consentError: "Görüşmeye başlamak için aydınlatma ve kullanım şartlarını onaylamalısınız.",
    sessionRestoredInfo: "Mevcut oturum ve takip bağlantınız geri yüklendi. Yönlendiriliyorsunuz...",
    sessionVerifiedInfo: "Kodunuz doğrulandı. Görüşme başlatılıyor...",

    step1Title: "PIN Kodu Girişi",
    step1Desc:
      "Katılımcılar doğrudan ilgili araştırma için tanımlanmış PIN kodunu girerek süreli oturum oluşturur.",
    step2Title: "Ses & Metin Eşitliği",
    step2Desc:
      "Düşüncelerini konuşarak rahatça aktarır veya yazarak iletir. Takıldığı noktada AI asistanından bağlam desteği alır.",
    step3Title: "Deşifre & Doğrulama",
    step3Desc:
      "Yapay zeka (AI) dil modelleri ile anında transkript çıkarılır; spam ve parazitler filtrelenerek doğrulanır.",

    featuresTitle: "Neden VoiceVerification AI?",
    featuresSubtitle:
      "Endüstri standardı güvenlik, veri bütünlüğü ve gizlilik prensipleri üzerine inşa edilmiştir.",
    feat1Title: "Anti-Garbage Filtresi",
    feat1Desc:
      "Sessiz kayıtlar, mikrofon cızırtıları ve bot aktiviteleri istemci seviyesinde otomatik elenir.",
    feat2Title: "Bağlam Bilen AI Copilot",
    feat2Desc:
      "Sorunun neden sorulduğunu katılımcıya kendi sektörünün terimleriyle açıklayan akıllı asistan.",
    feat3Title: "Web Audio API Motoru",
    feat3Desc:
      "Canlı ses dalga formu, ses seviyesi göstergesi ve kayıt öncesi/sonrası güvenli dinleme desteği.",
    feat4Title: "Sıfır Biyometrik Kayıt",
    feat4Desc:
      "Ses verisi akustik parmak izi için kullanılmaz; yalnızca içerik transkripsiyonu sonrası anonimleştirilir.",

    footerNoBiometrics: "Biyometrik Kimlik Kaydı Tutulmaz",
    footerKvkk: "KVKK & GDPR",
    footerTerms: "Kullanım Şartları",
    footerBiometricPolicy: "Biyometrik Güvence",
    footerCopyright: "VoiceVerify AI © 2026 • Kurumsal Asenkron Doğrulama",

    onboardingTitle: "Araştırmaya Hoş Geldiniz",
    onboardingEstimatedTime: "Tahmini Süre: 3 Dakika",
    onboardingSubtitle:
      "Görüşleriniz yapay zeka analiz motorumuzla değerlendirilecek ve anonim olarak ürün geliştirme yol haritamızı şekillendirecektir.",
    onboardingStartBtn: "Görüşmeye Başla",

    questionProgress: "Soru",
    clarificationHintTitle: "İpucu / Bağlam",
    tabAudio: "Sesli Yanıtla",
    tabText: "Yazarak Yanıtla",
    recordStart: "Kayda Başla",
    recordStop: "Kaydı Durdur",
    recordListening: "Kaydı Dinle",
    recordRerecord: "Tekrar Kaydet",
    recordSuccess: "Ses kaydı hazır",
    textSuccess: "Yazılı yanıtınız hazır",
    textPlaceholder: "Düşüncelerinizi en az 10 karakter olacak şekilde detaylıca yazınız...",
    askAssistant: "AI Asistana Sor",
    nextQuestion: "Sonraki Soruya Geç",
    prevQuestion: "Önceki Soru",
    finishSurvey: "Geri Bildirime Geç",

    feedbackBadge: "Sorular Tamamlandı!",
    feedbackBackToQuestions: "Sorulara Geri Dön",
    feedbackTitle: "Bu Deneyimi Nasıl Buldunuz?",
    feedbackSubtitle:
      "Geliştirdiğimiz bu sesli doğrulama yöntemini geleneksel formlara ve toplantılara kıyasla değerlendirmeniz, sistemi geliştirmemiz için çok değerlidir.",
    feedbackRatingLabel: "Genel Deneyim Puanınız (İsteğe Bağlı)",
    feedbackNoRatingYet: "Seçim yapılmadı",
    feedbackTagsTitle: "En çok neleri beğendiniz?",
    feedbackTagsSubtitle: "(Birden fazla seçebilirsiniz)",
    feedbackTags: [
      "Hızlı ve pratikti",
      "Sesli yanıt vermek çok rahattı",
      "Geleneksel anketlerden çok daha iyi",
      "AI Asistan netleştirmesi faydalıydı",
      "Mikrofon deneyimi sorunsuzdu",
      "Takvim/Zoom derdi olmaması harika",
    ],
    feedbackNotesLabel: "Eklemek istediğiniz bir geri bildirim var mı?",
    feedbackNotesPlaceholder: "Arayüz, ses kalitesi veya soru akışıyla ilgili önerileriniz...",
    feedbackSubmitBtn: "Görüşmeyi Tamamla",
    feedbackSubmittingBtn: "Gönderiliyor ve Analiz Ediliyor...",

    completionTitle: "Teşekkür Ederiz",
    completionSubtitle:
      "Yanıtlarınız başarıyla kaydedildi. Paylaştığınız saha tecrübeleri ve görüşler, ürün geliştirme yol haritamızı ve sektörel hipotezlerimizi doğrulamamızda doğrudan kullanılacaktır.",
    completionBadgeTitle: "Görüşleriniz Güvenle Kaydedildi",
    completionBadgeDesc:
      "Ses ve metin yanıtlarınız yapay zeka analiz motorumuz tarafından anonim içgörülere dönüştürüldü ve sisteme işlendi. Değerli vaktiniz ve katkılarınız için teşekkür ederiz.",

    alreadyCompletedTitle: "Bu Anket Daha Önce Tamamlandı",
    alreadyCompletedSubtitle: "Katılımınız Başarıyla Kaydedilmiştir",
    alreadyCompletedDesc:
      "Bu anket bağlantısı ile daha önce başarılı bir yanıt gönderilmiştir. Her bağlantı tek seferlik katılım için tasarlanmıştır. Katkılarınız için tekrar teşekkür ederiz.",

    accessDeniedTitle: "Erişim İzni Gerekli",
    accessDeniedSubtitle: "Bu anket korumalı bir kurumsal davetiye veya aktif PIN gerektirir.",
    accessDeniedDesc:
      "Geçerli bir davetiye token'ınız yoksa ana sayfadan kurumunuz için tanımlanan PIN kodunu girerek başlayabilirsiniz.",
    accessDeniedPinInputPlaceholder: "Örn: PIR-2026",
    accessDeniedSubmitBtn: "PIN ile Giriş Yap",
  },

  en: {
    brandTagline: "Asynchronous Voice Verification Infrastructure",
    langTr: "TR",
    langEn: "EN",
    backToHome: "Back to Home",
    or: "or",

    heroBadge: "B2B Market Validation & Qualitative Field Insights",
    heroTitleStart: "The Most Fluid & Reliable Way to Consult ",
    heroTitleHighlight: "Industry Leaders",
    heroTitleEnd: "",
    heroDescription:
      "Leave scheduling conflicts and low-response forms behind. Decision-makers answer in 3 minutes via voice or text at their own pace; our AI intelligence engine validates your hypotheses.",

    pinCardTitle: "Join Validation Session via Access Code (PIN)",
    pinCardSubtitle:
      "Enter the access PIN and your professional details provided by your coordinator to begin immediately.",
    pinLabel: "Survey Access Code (PIN)",
    pinPlaceholder: "E.g.: PIR-2026",
    pinHelper: "Active Demo PIN: PIR-2026",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "E.g.: David Miller",
    emailLabel: "Work Email",
    emailPlaceholder: "david@yourcompany.com",
    companyLabel: "Company / Organization",
    companyPlaceholder: "E.g.: Tetra Pak or Independent",
    titleLabel: "Job Title / Role",
    titlePlaceholder: "E.g.: Lead Reliability Engineer",
    consentCheckbox:
      "I agree to content transcription, anonymous research aggregation, Terms of Use, and Privacy Notice.",
    termsLink: "Terms of Use",
    kvkkLink: "Privacy Notice",
    submitButtonText: "Validate & Start Session",
    submittingText: "Validating Session & Starting...",
    pinError: "Please enter the survey access code (PIN) provided to you.",
    missingFieldsError: "Please fill in all required participant fields.",
    consentError: "You must accept the terms and privacy notice to continue.",
    sessionRestoredInfo: "Your existing session and attribution link were restored. Redirecting...",
    sessionVerifiedInfo: "Code verified. Initializing interview session...",

    step1Title: "Secure PIN Entry",
    step1Desc:
      "Participants enter a targeted PIN code to create a single-use expiring tokenized session.",
    step2Title: "Voice & Text Parity",
    step2Desc:
      "Articulate insights naturally by voice or submit typed feedback. Contextual AI assistance is always available.",
    step3Title: "Transcription & Validation",
    step3Desc:
      "Instant transcription powered by advanced AI models; audio noise, spam, and anomalies are filtered out.",

    featuresTitle: "Why VoiceVerification AI?",
    featuresSubtitle:
      "Architected for enterprise security, data integrity, and strict confidentiality.",
    feat1Title: "Anti-Garbage Energy Gate",
    feat1Desc:
      "Client-side RMS energy and duration gating blocks silent clicks, micro-bursts, and bot spam.",
    feat2Title: "Context-Aware AI Copilot",
    feat2Desc:
      "Domain-specific copilot explains why questions are asked and provides industrial context.",
    feat3Title: "Web Audio API Engine",
    feat3Desc:
      "Real-time visual waveforms, input volume metering, and pre-submission playback verification.",
    feat4Title: "Zero Biometric Profiling",
    feat4Desc:
      "Voice samples are never used for biometric profiling; content is transcribed and anonymized.",

    footerNoBiometrics: "No Biometric Identification Retained",
    footerKvkk: "GDPR & Privacy",
    footerTerms: "Terms of Service",
    footerBiometricPolicy: "Biometric Policy",
    footerCopyright: "VoiceVerify AI © 2026 • Enterprise Asynchronous Validation",

    onboardingTitle: "Welcome to the Research Study",
    onboardingEstimatedTime: "Estimated Duration: 3 Minutes",
    onboardingSubtitle:
      "Your field experience will be analyzed by our AI intelligence pipeline to validate product roadmaps and engineering hypotheses.",
    onboardingStartBtn: "Begin Session",

    questionProgress: "Question",
    clarificationHintTitle: "Industrial Context / Hint",
    tabAudio: "Respond by Voice",
    tabText: "Respond in Writing",
    recordStart: "Start Recording",
    recordStop: "Stop Recording",
    recordListening: "Listen Playback",
    recordRerecord: "Re-record",
    recordSuccess: "Recording captured",
    textSuccess: "Written response ready",
    textPlaceholder: "Type your detailed thoughts (minimum 10 characters)...",
    askAssistant: "Ask AI Assistant",
    nextQuestion: "Proceed to Next Question",
    prevQuestion: "Previous Question",
    finishSurvey: "Proceed to Feedback",

    feedbackBadge: "Questions Completed!",
    feedbackBackToQuestions: "Back to Questions",
    feedbackTitle: "How Was Your Experience?",
    feedbackSubtitle:
      "Benchmarking this voice verification flow against traditional surveys and Zoom meetings helps us continuously improve.",
    feedbackRatingLabel: "Overall Experience Rating (Optional)",
    feedbackNoRatingYet: "No rating selected",
    feedbackTagsTitle: "What did you appreciate most?",
    feedbackTagsSubtitle: "(Select all that apply)",
    feedbackTags: [
      "Fast and intuitive",
      "Speaking thoughts was effortless",
      "Far superior to static surveys",
      "AI Assistant context was helpful",
      "Seamless microphone experience",
      "No calendar/Zoom hassle was great",
    ],
    feedbackNotesLabel: "Any additional feedback or suggestions?",
    feedbackNotesPlaceholder: "Your suggestions regarding UI, audio clarity, or question flow...",
    feedbackSubmitBtn: "Complete Interview",
    feedbackSubmittingBtn: "Submitting & Analyzing...",

    completionTitle: "Thank You",
    completionSubtitle:
      "Your responses have been securely recorded. The insights and practical nuances you shared will directly validate our product roadmap.",
    completionBadgeTitle: "Responses Securely Processed",
    completionBadgeDesc:
      "Your voice and text submissions were synthesized into anonymous insights by our AI pipeline. Thank you for your valuable time and contribution.",

    alreadyCompletedTitle: "Survey Already Completed",
    alreadyCompletedSubtitle: "Your Submission Has Been Recorded",
    alreadyCompletedDesc:
      "A submission has already been finalized with this survey link. Each invitation is strictly single-use to preserve survey integrity. Thank you for participating.",

    accessDeniedTitle: "Access Authorization Required",
    accessDeniedSubtitle: "This survey requires an authenticated invite link or an active PIN code.",
    accessDeniedDesc:
      "If you do not have an active invite token, you can enter the survey PIN code issued for your organization on the homepage.",
    accessDeniedPinInputPlaceholder: "E.g.: PIR-2026",
    accessDeniedSubmitBtn: "Enter with PIN",
  },
};
