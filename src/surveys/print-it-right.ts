import { SurveyConfig } from "@/types/interview";

export const PRINT_IT_RIGHT_SURVEY: SurveyConfig = {
  id: "print-it-right",
  slug: "print-it-right-food-safe-parts",
  title: "Print It Right: Gıdaya Uygun 3B Parça Doğrulama Araştırması",
  tagline: "A-Side Challenge • AI Destekli Gıda Güvenliğine Uygun Parça Üretimi",
  description:
    "Gıda üretim tesislerinde ve dolum hatlarında yaşanan plansız duruşları önlemek amacıyla; gıdayla temasa uygun (EU 1935/2004, FDA 21 CFR 177), ısıya ve kimyasallara dayanıklı parçaların yapay zeka ile 3B tasarlanıp talep anında üretilmesini araştırıyoruz.",
  targetAudience:
    "Bakım Mühendisleri, Tesis/Operasyon Yöneticileri, Gıda Makineleri Üreticileri (OEM) ve Kalite Ekipleri",
  estimatedMinutes: 3,
  tips: [
    "Sesli yanıt vermek en hızlı yoldur; mikrofona basıp doğrudan konuşun.",
    "Gürültülü bir ortamdaysanız 'Yazarak Yanıtla' sekmesine geçebilirsiniz.",
    "Soruyu açmak veya somut örnek istemek için sağ üstteki 'AI Asistan'a danışabilirsiniz.",
    "Ses kaydınızı göndermeden önce dinleyebilir, silebilir ve yeniden kaydedebilirsiniz.",
  ],
  aiContext: `
    Sen "Print It Right: AI-Designed Food-Safe Parts On Demand" araştırma projesinin teknik uzman asistanısın.
    Konu Çerçevesi:
    - Gıda fabrikalarında (süt, içecek, unlu mamul, konserve vb.) conta, valf, tutucu, nozul gibi özel parçaların tedariki haftalar sürebilmektedir ve hat duruşları ciddi maliyet doğurur.
    - AI destekli generative design ile parçaların ısı, basınç, buhar ve CIP temizlik kimyasallarına dayanıklı 3B modellere dönüştürülmesi hedeflenmektedir.
    - Standartlar ve Zorluklar: EU 1935/2004, EU 10/2011, FDA 21 CFR 177, EHEDG hijyen kuralları. Katman izleri, gözeneklilik, yüzey pürüzlülüğü ve gıda güvenliği sertifikasyonu.
    - Olası malzemeler: PEEK, PPSU, gıdaya uygun sertifikalı dolgulu naylonlar vb.
    
    Amacın: Katılımcıya soruları açıklamak, somut saha örnekleri vermek, tarafsız kalmak ve katılımcının kendi tesisindeki gerçek bakım ve duruş tecrübelerine odaklanmasını sağlamaktır.
  `,
  questions: [
    {
      id: "pir-q1-downtime-cost",
      order: 1,
      title: "Parça Tedarik Süresi & Plansız Duruş Maliyeti",
      description:
        "Tesisinizde veya gıda hattınızda aşınan/kırılan özel bir parça (conta, nozul, valf, konveyör tutucu vb.) arızalandığında orijinal parçanın tedariki ne kadar sürüyor ve bu duruşun yarattığı operasyonel kayıp nedir?",
      clarificationHint:
        "Yurtdışından veya OEM'den beklenen parçalar, haftalar süren duruşlar veya stokta tutulan yüksek maliyetli yedek parça yüklerini düşünebilirsiniz.",
      maxDurationSec: 180,
    },
    {
      id: "pir-q2-hygiene-compliance",
      order: 2,
      title: "3B Baskı Parçalarda Gıda Güvenliği & Hijyen Çekinceleri",
      description:
        "Gıdayla temas eden bir parçanın 3B yazıcıyla tesiste veya hızlı servisle üretilmesi fikrinde sizi en çok düşündüren teknik ya da yasal çekince nedir? (Örn: EU/FDA gıda sertifikasyonu, CIP kimyasallarına/buhara dayanım, katman aralarında bakteri üremesi vb.)",
      clarificationHint:
        "Gıda denetimleri, yüzey pürüzlülüğü, temizlik kimyasalları (CIP) ve mekanik mukavemet konusundaki endişelerinizi aktarabilirsiniz.",
      maxDurationSec: 180,
    },
    {
      id: "pir-q3-ai-service-adoption",
      order: 3,
      title: "AI Destekli Tasarım & Satın Alma Tercihiniz",
      description:
        "Bozulan parçanın ölçülerini ve çalışma koşullarını sisteme girip, yapay zeka ile 24-48 saat içinde doğrulanmış gıda uyumlu parçayı teslim alabileceğiniz bir servis olsaydı, bunu parça başı ödeme mi yoksa garantili bakım aboneliğiyle mi tercih ederdiniz?",
      clarificationHint:
        "Parça başına doğrudan faturalandırma mı yoksa yıllık hat duruşu garantisi sunan servis sözleşmesi mi tesisinize daha uygun olurdu?",
      maxDurationSec: 180,
    },
  ],
};
