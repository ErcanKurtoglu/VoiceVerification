import type { SurveyConfig } from "../types/interview.ts";

export const PRINT_IT_RIGHT_SURVEY: SurveyConfig = {
  id: "print-it-right",
  slug: "print-it-right-food-safe-parts",
  title: "Print It Right: Gıdaya Uygun 3B Parça Doğrulama Araştırması",
  titleEn: "Print It Right: Food-Safe 3D Printed Parts Validation",
  tagline: "A-Side Challenge • AI Destekli Gıda Güvenliğine Uygun Parça Üretimi",
  taglineEn: "A-Side Challenge 2026 • AI-Designed Food-Safe Parts On Demand",
  description:
    "Gıda üretim tesislerinde ve dolum hatlarında yaşanan plansız duruşları önlemek amacıyla; gıdayla temasa uygun (EU 1935/2004, FDA 21 CFR 177), ısıya ve kimyasallara dayanıklı parçaların yapay zeka ile 3B tasarlanıp 24-48 saatte üretilmesini araştırıyoruz.",
  descriptionEn:
    "Exploring rapid on-demand 3D printing of food-contact certified (EU 1935/2004, FDA 21 CFR 177) thermal and chemical resistant replacement parts to eliminate unplanned downtime in food processing and filling lines.",
  targetAudience:
    "Bakım Mühendisleri, Tesis/Operasyon Yöneticileri, Gıda Makineleri Üreticileri (OEM) ve Kalite Ekipleri",
  targetAudienceEn:
    "Maintenance Engineers, Plant & Operations Managers, Food OEM Equipment Manufacturers, Quality Assurance Teams",
  estimatedMinutes: 3,
  tips: [
    "Sesli yanıt vermek en hızlı yoldur; mikrofona basıp doğrudan konuşun.",
    "Gürültülü bir ortamdaysanız tek tıkla 'Yazarak Yanıtla' sekmesine geçebilirsiniz.",
    "Soruyu açmak veya fabrika örnekleri istemek için 'AI Asistan'a danışabilirsiniz.",
    "Ses kaydınız asla biyometrik ses izi olarak işlenmez; göndermeden önce dinleyebilir veya silebilirsiniz.",
    "Görüşleriniz anonim olarak ürün geliştirme yol haritamızı şekillendirmek için kullanılacaktır.",
  ],
  aiContext: `
    Sen "Print It Right: AI-Designed Food-Safe Parts On Demand" araştırma projesinin teknik uzman asistanısın.
    Konu Çerçevesi:
    - Gıda fabrikalarında (süt, içecek, unlu mamul, konserve vb.) conta, valf, tutucu, nozul gibi özel parçaların tedariki haftalar sürebilmektedir ve hat duruşları ciddi OEE ve maliyet kayıpları doğurur.
    - AI destekli generative design ile parçaların ısı, basınç, buhar ve CIP temizlik kimyasallarına dayanıklı 3B modellere dönüştürülmesi hedeflenmektedir.
    - Standartlar ve Zorluklar: EU 1935/2004, EU 10/2011, FDA 21 CFR 177, EHEDG hijyen kuralları. Katman izleri, gözeneklilik, yüzey pürüzlülüğü, kimyasal migrasyon ve gıda güvenliği sertifikasyonu.
    - Olası malzemeler: PEEK, PPSU, gıdaya uygun sertifikalı dolgulu naylonlar vb.
    
    Amacın: Katılımcıya soruları açıklamak, somut saha örnekleri (Tetra Pak dolum hatları, Krones etiketleme, GEA homojenizatör valfleri vb.) vermek, tarafsız kalmak ve katılımcının kendi tesisindeki gerçek bakım ve duruş tecrübelerine odaklanmasını sağlamaktır.
  `,
  aiContextEn: `
    You are the neutral technical assistant for the "Print It Right: AI-Designed Food-Safe Parts On Demand" research study.
    Scope & Boundaries:
    - In food processing plants (dairy, beverage, bakery, canning), custom parts like gaskets, nozzles, grippers, and valves take weeks to deliver from OEMs, causing severe OEE and cost losses.
    - The project explores using AI-driven generative design and certified food-contact additive manufacturing (FDM/SLS) with PEEK, PPSU, and compliant polymers.
    - Standards: EU 1935/2004, EU 10/2011, FDA 21 CFR 177, EHEDG sanitary guidelines. Layer lines, porosity, microbial harborage, chemical migration, CIP caustic washes, 120°C steam resistance.
    - Your objective: Clarify question scope, provide neutral examples, and help participants reflect on their own real plant maintenance experiences without steering their answers.
  `,
  questions: [
    {
      id: "pir-q1-downtime-cost",
      order: 1,
      title: "Parça Tedarik Süresi & Plansız Duruş Kaybı",
      titleEn: "Lead Times & Unplanned Downtime Costs",
      description:
        "Geçtiğimiz 1 yılda tek bir yedek parça gecikmesi yüzünden dolum veya üretim hattınızın durduğu en kritik anı ve o günkü OEM teslim süresini anlatabilir misiniz?",
      descriptionEn:
        "Over the past 12 months, can you describe the most critical filling or production line stoppage caused by a single replacement part delay, along with the OEM delivery timeline?",
      clarificationHint:
        "Yurtdışından veya OEM'den haftalarca beklenen özel bir nozul, conta veya dişliyi düşünebilirsiniz. O duruş OEE'nizi veya sevkiyatınızı nasıl etkiledi?",
      clarificationHintEn:
        "Consider custom nozzles, seals, or gears awaited from abroad for weeks. How did that stoppage impact your OEE, factory output, or delivery schedule?",
      maxDurationSec: 180,
    },
    {
      id: "pir-q2-hygiene-compliance",
      order: 2,
      title: "3B Baskıda Gıda Güvenliği & Hijyen Çekinceleri",
      titleEn: "Food Safety & Hygiene Concerns in 3D Printing",
      description:
        "Gıdayla temas eden bir parçayı 3B yazıcıyla üretip hatta takacak olsaydınız, sizi gece uykusuz bırakacak en büyük teknik veya denetim riski ne olurdu?",
      descriptionEn:
        "If you were to install a 3D printed food-contact part on your production line, what would be the single biggest technical, microbial, or audit risk keeping you up at night?",
      clarificationHint:
        "CIP kostik yıkaması, 120°C buhar sterilizasyonu, yüzeydeki bakteri tutulumu mu yoksa gıda denetçisine gösterilecek göç (migrasyon / EU 1935/2004) sertifikası mı?",
      clarificationHintEn:
        "Consider CIP caustic wash resistance, 120°C steam sterilization, interlayer bacterial harborage, or migration/compliance documentation required by food safety auditors (EU 1935/2004).",
      maxDurationSec: 180,
    },
    {
      id: "pir-q3-ai-service-adoption",
      order: 3,
      title: "AI Destekli Tasarım & Satın Alma Modeli",
      titleEn: "AI-Assisted Replacement & Procurement Model",
      description:
        "Kırılan parçanın yerine 48 saatte sertifikalı teslimat sağlayan bir modelde; doğrudan 'parça başı fatura' mı yoksa 'yıllık hat garantisi aboneliği' mi fabrikanızın satın alma prosedüründen daha kolay geçer?",
      descriptionEn:
        "In a service model guaranteeing certified replacement parts within 24-48 hours, which commercial framework passes your company's procurement review more smoothly: 'Per-Part Invoicing' or an 'Annual Line Availability Subscription'?",
      clarificationHint:
        "Satın alma komitesi limitlerinizi, acil bakım bütçenizi veya yıllık plansız duruş maliyetinizi düşünebilirsiniz.",
      clarificationHintEn:
        "Consider your purchasing committee thresholds, emergency maintenance expenditure limits, and the annual cost of unplanned downtime.",
      maxDurationSec: 180,
    },
  ],
};
