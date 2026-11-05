import { ProjectConfig } from "@/types/interview";

export const DEFAULT_PROJECT: ProjectConfig = {
  id: "pilot-validation-2026",
  slug: "ai-voice-validation",
  title: "Yapay Zeka Destekli Sektörel Doğrulama & İçgörü Araştırması",
  tagline: "Sektör profesyonellerinin acı noktalarını ve yeni nesil çözümleri inceliyoruz.",
  description:
    "Geliştirmekte olduğumuz ürünün sektör ihtiyaçlarıyla tam örtüşmesi için sizin saha tecrübenize ve görüşlerinize 3 dakika danışmak istiyoruz. Sesli veya dilediğiniz gibi yazılı yanıtlayabilirsiniz.",
  estimatedMinutes: 3,
  aiContext: `
    Sen bu araştırma projesinin dijital asistanısın. 
    Proje Konusu: Sektör profesyonellerinin müşteri doğrulama, pazar araştırması ve geri bildirim toplama süreçlerindeki zorlukları çözmeyi hedefleyen "Asenkron Sesli Doğrulama Platformu".
    Amacın: Katılımcı soruları tam anlamazsa, kapsamı merak ederse veya "burada neyi kastediyorsunuz?" derse, ona samimi, net ve tarafsız örneklerle soruyu açıklamak.
    Asla katılımcıyı yönlendirme ("ürünümüz çok iyi değil mi?" gibi sorular sorma). Katılımcının geçmiş saha tecrübelerine ve gerçek acı noktalarına odaklanmasını sağla.
  `,
  questions: [
    {
      id: "q1-current-pain",
      order: 1,
      title: "Müşteri Doğrulama & Geri Bildirim Darboğazı",
      description:
        "Yeni bir proje, ürün veya hizmet fikrini sektördeki profesyonellerle veya potansiyel müşterilerle doğrulamaya çalışırken en çok hangi aşamada zorlanıyorsunuz? (Örn: Randevu bulamamak, anketlerin yanıtsız kalması vb.)",
      clarificationHint:
        "Geleneksel anketler, Zoom görüşmeleri veya yüz yüze müşteri görüşmeleri yaparken yaşadığınız en büyük vakit kaybını veya zorluğu düşünebilirsiniz.",
      maxDurationSec: 180,
    },
    {
      id: "q2-async-preference",
      order: 2,
      title: "Asenkron Sesli İletişim Tercihiniz",
      description:
        "Bir projeye fikir bildirmek için 30 dakikalık bir toplantı yapmak yerine, 3 dakikada sesli mesaj bırakabileceğiniz bu tarz bir aracı tercih eder misiniz? Sizi en çok cezbeden veya düşündüren tarafı nedir?",
      clarificationHint:
        "Kendi iş temponuzda, istediğiniz an mikrofona basıp fikir beyan etmenin takvim yönetimi açısından size etkisini değerlendirebilirsiniz.",
      maxDurationSec: 180,
    },
    {
      id: "q3-ideal-solution",
      order: 3,
      title: "İdeal Bir Araçtan Beklentiniz",
      description:
        "Böyle bir sistemin toplanan yanıtları yapay zekayla özetleyip size 'Sektörün En Büyük 3 Acı Noktası' şeklinde bir rapor sunması, karar alma hızınızı nasıl etkilerdi?",
      clarificationHint:
        "Ham ses kayıtlarını tek tek dinlemek yerine, yapay zekanın çıkardığı özet içgörü raporunun size sağlayacağı katma değeri düşünebilirsiniz.",
      maxDurationSec: 180,
    },
  ],
};
