import type { SurveyConfig } from "../types/interview.ts";

export const PRINT_IT_RIGHT_SURVEY: SurveyConfig = {
  id: "print-it-right",
  slug: "print-it-right-food-safe-parts",
  title: "Print It Right: Gıdaya Uygun 3B Parça Doğrulama Araştırması",
  tagline: "A-Side Challenge • AI Destekli Gıda Güvenliğine Uygun Parça Üretimi",
  description:
    "Gıda üretim tesislerinde ve dolum hatlarında yaşanan plansız duruşları önlemek amacıyla; gıdayla temasa uygun (EU 1935/2004, FDA 21 CFR 177), ısıya ve kimyasallara dayanıklı parçaların yapay zeka ile 3B tasarlanıp 24-48 saatte üretilmesini araştırıyoruz.",
  targetAudience:
    "Bakım Mühendisleri, Tesis/Operasyon Yöneticileri, Gıda Makineleri Üreticileri (OEM) ve Kalite Ekipleri",
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
  questions: [
    {
      id: "pir-q1-downtime-cost",
      order: 1,
      title: "Parça Tedarik Süresi & Plansız Duruş Kaybı",
      description:
        "Geçtiğimiz 1 yılda tek bir yedek parça gecikmesi yüzünden dolum veya üretim hattınızın durduğu en kritik anı ve o günkü OEM teslim süresini anlatabilir misiniz?",
      clarificationHint:
        "Yurtdışından veya OEM'den haftalarca beklenen özel bir nozul, conta veya dişliyi düşünebilirsiniz. O duruş OEE'nizi veya sevkiyatınızı nasıl etkiledi?",
      maxDurationSec: 180,
    },
    {
      id: "pir-q2-hygiene-compliance",
      order: 2,
      title: "3B Baskıda Gıda Güvenliği & Hijyen Çekinceleri",
      description:
        "Gıdayla temas eden bir parçayı 3B yazıcıyla üretip hatta takacak olsaydınız, sizi gece uykusuz bırakacak en büyük teknik veya denetim riski ne olurdu?",
      clarificationHint:
        "CIP kostik yıkaması, 120°C buhar sterilizasyonu, yüzeydeki bakteri tutulumu mu yoksa gıda denetçisine gösterilecek göç (migrasyon / EU 1935/2004) sertifikası mı?",
      maxDurationSec: 180,
    },
    {
      id: "pir-q3-ai-service-adoption",
      order: 3,
      title: "AI Destekli Tasarım & Satın Alma Modeli",
      description:
        "Kırılan parçanın yerine 48 saatte sertifikalı teslimat sağlayan bir modelde; doğrudan 'parça başı fatura' mı yoksa 'yıllık hat garantisi aboneliği' mi fabrikanızın satın alma prosedüründen daha kolay geçer?",
      clarificationHint:
        "Satın alma komitesi limitlerinizi, acil bakım bütçenizi veya yıllık plansız duruş maliyetinizi düşünebilirsiniz.",
      maxDurationSec: 180,
    },
  ],
};
