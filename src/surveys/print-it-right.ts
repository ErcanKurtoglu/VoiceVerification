import type { SurveyConfig } from "../types/interview.ts";

export const PRINT_IT_RIGHT_SURVEY: SurveyConfig = {
  id: "print-it-right",
  slug: "print-it-right-food-safe-parts",
  title: "Print It Right: Gıda Üretim Ekipmanı Parça Deneyimi Araştırması",
  titleEn: "Print It Right: Food Production Equipment Part Experience Survey",
  tagline: "A-Side Challenge 2026 • S1 Sektörel Keşif ve Saha Deneyimi Doğrulaması",
  taglineEn: "A-Side Challenge 2026 • S1 Industry Discovery & Field Experience Validation",
  description:
    "Gıda üretim tesislerinde çalışan bir bakım, teknik servis veya üretim uzmanı olarak; bazen kritik bir hattın küçük bir plastik tırnak aşınması, yırtılan bir dolum memesi contası veya bulunamayan bir zincir kılavuzu nedeniyle plansız durmasının ne anlama geldiğini çok iyi biliyorsunuz. Yedek parçanın yurt dışındaki OEM'den haftalarca gelmemesi, eski makinelerde CAD çizimlerinin veya parça kodunun kayıp olması; buna karşılık parçanın agresif kimyasal yıkamalara (CIP) dayanıp doğrudan gıda temas hijyenini koruma zorunluluğu sahada her gün karşılaşılan gerçeklerdir.\n\nBu araştırma teorik tartışmalar için değil; son 12 ay içinde bizzat yaşadığınız tek bir somut parça olayını (arıza, aşınma, temin gecikmesi veya uyarlama ihtiyacı) anlamak için tasarlandı.\n\nNasıl Yanıtlayacaksınız?\nBaşlamadan önce lütfen hafızanızda yakın zamanda sizi, ekibinizi veya fabrikanızı uğraştıran TEK bir makine parçası vakasını gözünüzün önüne getirin. Takip eden 9 kısa soruyu bu seçtiğiniz tek olay ve parça üzerinden yanıtlayacaksınız. Doğru ya da yanlış cevap yoktur; kendi tecrübenizi aktarmanız, yaklaşık süre tahminleri vermeniz veya aklınıza takılan bir noktada AI Asistan'a danışmanız tamamen serbesttir.",
  descriptionEn:
    "As a maintenance engineer, technician, or plant specialist in food manufacturing, you know firsthand the pressure of an unplanned line stoppage caused by a single failing part — a cracked guide star, a worn-out dosing seal, or an unavailable OEM bracket. Often, spare parts take weeks to arrive from overseas, CAD drawings or specs for older lines are missing, and yet every component must endure harsh chemical washdowns (CIP) and strictly comply with food-contact safety standards.\n\nThis customer discovery survey is designed not for abstract theory, but to explore one real, specific part event you directly encountered over the last 12 months (breakdown, wear, supply delay, or temporary workaround).\n\nHow to Participate:\nBefore you begin, please recall ONE specific machinery part incident from your facility that challenged your team. You will navigate the next 9 short questions keeping this single part and event in mind. There are no right or wrong answers; estimating, saying 'I don't know', or consulting the AI Copilot is completely encouraged. Confidential figures, company names, or sensitive drawings are never required.",
  targetAudience:
    "Gıda üretim tesisinde bakım, teknik servis, üretim mühendisliği veya sahada çalışan teknisyen/operatör rollerinde olup son 12 ayda parçayla ilgili bir olaya doğrudan katılmış kişiler (S1 Grubu)",
  targetAudienceEn:
    "Food-production site maintenance, technical service, production engineering, or hands-on technician/operator staff directly involved in a part-related event in the last 12 months (S1 Segment)",
  estimatedMinutes: 9,
  tips: [
    "Sesli yanıt vermek en hızlı yoldur; mikrofona basıp doğrudan konuşun.",
    "Gürültülü bir ortamdaysanız tek tıkla 'Yazarak Yanıtla' sekmesine geçebilirsiniz.",
    "Soruyu açmak veya kapsamı netleştirmek için 'AI Asistan'a danışabilirsiniz.",
    "Ses kaydınız asla biyometrik ses izi olarak işlenmez; göndermeden önce dinleyebilir veya silebilirsiniz.",
    "Görüşleriniz anonim olarak ürün geliştirme yol haritamızı şekillendirmek için kullanılacaktır.",
  ],
  aiContext: `
# Sistem Promptu — Anket Açıklama Yardımcısı (Türkçe)

Gıda sanayii sektöründe uzman (bakım mühendisi, teknik servis şefi, üretim teknisyeni) olan katılımcıya rehberlik eden profesyonel bir araştırma asistanısın. Katılımcının kendi tecrübesi hakkındaki bilginin kaynağı katılımcının kendisidir. Görevin açıklık getirmek ve soruyu somutlaştırmaktır; anketi katılımcı adına yanıtlamak veya yanıtını yönlendirmek değildir.

## Nasıl Yardımcı Olmalısın

1. Katılımcıya mühendislik saygısıyla ve endüstriyel teknik terminolojiyle yaklaş (duruş süresi, CIP kimyasal yıkama, aşınma parçası, gıdaya temas, OEM temin süresi, teknik resim vb.).
2. Katılımcı sorunun kapsamını sorduğunda, soruyu yalnızca özetleyip bırakma; sorunun ne tür bir saha durumunu kastettiğini anlaması için genel ve hipotetik gıda ekipmanı örnekleriyle somutlaştır (ör. şişeleme konveyöründeki kılavuz yıldız çark, dolum memesi sızdırmazlık contası, sıyırıcı bıçak veya OEM braketi).
3. Bu örneklerin yalnızca soruyu somutlaştırmak için olduğunu ve katılımcının kendi seçtiği somut parça olayı üzerinden yanıt vermesi gerektiğini hatırlat.
4. Yaklaşık tahmin yürütmenin veya "bilmiyorum / emin değilim" demenin araştırmamız için tamamen geçerli ve çok kıymetli olduğunu belirt.

## Sınırlar

- Katılımcı adına yanıt uydurma veya hangi cevabın "doğru" olduğunu ima etme.
- Takip sorusu veya ek anket sorusu sorma; yalnızca sorulan soruya net yanıt ver.
- Kesin mühendislik, gıda güvenliği, hijyen veya yasal uygunluk garantisi verme. Teknik tavsiye sorulduğunda: "Bu anket teknik uygunluk, malzeme seçimi veya gıda güvenliği belirleyemez. Lütfen yetkili bir uzmana danışınız. Yalnızca sorunun kapsamını açıklayabilirim." de.
  `,
  aiContextEn: `
# System Prompt — Survey Clarification Assistant (English)

You are a professional research copilot assisting a domain expert (food manufacturing maintenance engineer, plant technical lead, or operator) during a customer discovery survey for "Print It Right: Food-Safe Parts On Demand".
The participant is an expert in their field. Your role is to clarify the scope, intent, and technical context of each question without answering on their behalf or steering their responses.

## How to Help

1. Speak with professional engineering respect using industrial food processing vocabulary (downtime, CIP/SIP washdowns, wear parts, food contact compliance, OEM lead times, CAD drawings).
2. When the participant is unsure what a question is asking, do not just repeat the question text. Ground the concept with neutral, hypothetical examples from food processing equipment (e.g. cracked guide star on a packaging line, worn food-grade silicone seal on a dosing valve, or delayed OEM bracket).
3. Clarify that these examples are purely illustrative to show the dimension of experience being explored, and they should speak from their own specific real-world event.
4. Remind them that rough estimates, partial memory, or stating "I don't know" is completely valid and valuable for exploratory research.

## Boundaries

- Never answer the survey question on the participant's behalf or propose a preferred answer.
- Never ask follow-up questions or probes back to the participant.
- Never give binding engineering, food safety, material-selection, or regulatory certification advice.
  `,
  questions: [
    {
      id: "pir-s1-q1-what-happened",
      order: 1,
      title: "Q1 — Ne Oldu? (Arıza & İhtiyaç Olayı)",
      titleEn: "Q1 — What Happened? (The Incident & Initial Need)",
      description:
        "Son 12 ay içinde gıda üretim hattınızda bir parçanın arızalanması, aşınması veya temin edilememesi nedeniyle yaşanan somut bir olayı anlatır mısınız? Bu ihtiyaç ilk nasıl fark edildi?",
      descriptionEn:
        "Could you describe a specific event within the last 12 months where a part in your food production line failed, wore out, or needed replacement? How did the need first become apparent?",
      clarificationHint:
        "Tek bir somut olayı gözünüzün önüne getirin. Arızanın nasıl belirti verdiğini (ör. ses, titreşim, görsel kontrol, ürün sızıntısı veya planlı bakım muayenesi) kısaca özetleyebilirsiniz. Şirket veya makine seri numarası vermenize gerek yoktur.",
      clarificationHintEn:
        "Focus on one specific event. Describe how the issue first surfaced (e.g., unusual noise, vibration, visual check, product leak, or routine maintenance). Machine serial numbers or proprietary names are not needed.",
      maxDurationSec: 60,
    },
    {
      id: "pir-s1-q2-part-function",
      order: 2,
      title: "Q2 — Parçanın Rolü: Ekipmanda Ne İşe Yarıyordu?",
      titleEn: "Q2 — Part's Role: What Did It Do in the Machine?",
      description:
        "Söz konusu parça ekipmanda ne işe yarıyordu? Genel işlevini ve makinedeki konumunu sade bir dille anlatır mısınız?",
      descriptionEn:
        "What was the role of this component in the equipment? Could you describe its general function and position in plain terms?",
      clarificationHint:
        "Parçanın temel mekanik görevini belirtmeniz yeterlidir (ör. şişeleri yönlendiren kılavuz tırnak, dolum memesi contası, taşıyıcı bant makarası vb.). Kesin model kodu veya teknik çizim gerekmez.",
      clarificationHintEn:
        "Simply describe its mechanical function (e.g., guide rail directing bottles, filling nozzle gasket, conveyor roller, pusher arm). Exact part numbers or CAD drawings are not required.",
      maxDurationSec: 30,
    },
    {
      id: "pir-s1-q3-steps-taken",
      order: 3,
      title: "Q3 — Müdahale: Sorun Fark Edilince Hangi Adımlar Atıldı?",
      titleEn: "Q3 — Response: What Steps Were Taken Once Noticed?",
      description:
        "Parçadaki sorun fark edildiği andan itibaren siz veya ekibiniz sırasıyla hangi adımları attınız? Çözüme kadar süreç nasıl ilerledi?",
      descriptionEn:
        "From the moment the issue was identified, what steps did you or your team take in sequence until the part was fixed, replaced, or work stopped?",
      clarificationHint:
        "Olay anındaki müdahale sırasını düşünün (ör. hattı durdurma, parçayı söküp inceleme, depodaki yedekleri kontrol etme, OEM ile iletişime geçme vb.). Bilmediğiniz adımları atlayabilirsiniz.",
      clarificationHintEn:
        "Consider the immediate sequence of actions (e.g., stopping the line, disassembling for inspection, checking spare stock, contacting OEM). You can skip steps you were not directly involved in.",
      maxDurationSec: 60,
    },
    {
      id: "pir-s1-q4-information-available",
      order: 4,
      title: "Q4 — Parça Bilgisi: Hangi Kayıtlar Vardı, Neler Eksikti?",
      titleEn: "Q4 — Part Data: What Information Was Available vs. Missing?",
      description:
        "Parçayı tanımlamak veya yenilemek istediğinizde elinizde hangi teknik bilgiler (kod, teknik resim, malzeme türü) vardı ve hangi bilgiler eksikti?",
      descriptionEn:
        "When identifying or assessing the part, what technical information or records were available (part code, drawings, material specs), and what was missing?",
      clarificationHint:
        "Eski makinelerde çizim veya yedek kodunun bulunamaması, malzeme sertifikasının belirsizliği gibi bilgi boşluklarını düşünebilirsiniz. Gizli teknik döküman paylaşmanız beklenmez.",
      clarificationHintEn:
        "Think about data gaps such as missing CAD drawings for older machines, unknown material grades, or worn-off serial numbers. Confidential documents are not expected.",
      maxDurationSec: 60,
    },
    {
      id: "pir-s1-q5-options-considered",
      order: 5,
      title: "Q5 — Çözüm Arayışı: Hangi Alternatifler Değerlendirildi?",
      titleEn: "Q5 — Solutions Explored: Which Options Were Considered?",
      description:
        "Bu parça için gerçekte hangi çözüm yolları masaya yatırıldı, hangisi seçildi ve bu tercihte neler (temin süresi, maliyet, güvenlik vb.) etkili oldu?",
      descriptionEn:
        "Which alternative options were actually considered for this part, which one was chosen, and what key factors (lead time, cost, safety) drove that decision?",
      clarificationHint:
        "Değerlendirilen ve elenen alternatifleri aktarabilirsiniz (ör. depodaki yedeği kullanma, orijinal OEM siparişi, parçayı atölyede onarma, lokal fason talaşlı imalat veya 3B baskı düşüncesi).",
      clarificationHintEn:
        "Mention considered and rejected alternatives (e.g., using existing stock, ordering original OEM, internal workshop repair, local machining, or 3D printing). None is presumed best.",
      maxDurationSec: 60,
    },
    {
      id: "pir-s1-q6-conditions-mattered",
      order: 6,
      title: "Q6 — Çalışma Koşulları: Hangi Hijyen & Ortam Şartları Önemliydi?",
      titleEn: "Q6 — Operating Conditions: Which Hygiene & Environment Factors Mattered?",
      description:
        "Bu parçanın çalıştığı yerde gıdayla temas, kimyasal yıkama (CIP/SIP), sıcaklık veya mekanik aşınma gibi hangi koşullar kritikti? Neler biliniyordu, neler belirsizdi?",
      descriptionEn:
        "For this specific part, which conditions mattered regarding direct food contact, chemical washdowns (CIP/SIP), temperature, or wear? What was known vs. uncertain?",
      clarificationHint:
        "Yalnızca bu parçanın maruz kaldığı ortamı düşünün (ör. asitli/kostikli temizlik kimyasalları, buhar, ıslak/kuru ortam veya gıda güvenliği denetim gereksinimi). Emin olmadığınız noktaları 'belirsizdi' diye belirtebilirsiniz.",
      clarificationHintEn:
        "Focus only on this part's environment (e.g., exposure to caustic/acidic washdowns, high steam, wet/dry zone, or food hygiene audits). Saying 'uncertain' or 'not sure' is completely valid.",
      maxDurationSec: 60,
    },
    {
      id: "pir-s1-q7-operational-effect",
      order: 7,
      title: "Q7 — Operasyonel Etki: Üretim Hattı ve Duruş Süresi Nasıl Etkilendi?",
      titleEn: "Q7 — Operational Impact: How Was Production & Downtime Affected?",
      description:
        "Bu olay üretim hattını veya iş akışınızı nasıl etkiledi? Hat duruşu veya geçici yavaşlama yaşandıysa ana adımlar yaklaşık ne kadar sürdü?",
      descriptionEn:
        "What practical effect did this event have on production or your daily operations? If downtime or line throttling occurred, approximately how long did the key stages take?",
      clarificationHint:
        "Sürelerin ölçülen net süre mi yoksa yaklaşık bir tahmin mi olduğunu belirtebilirsiniz (ör. 'yaklaşık 4 saat hat durdu', 'parça 3 hafta beklendi'). Gizli finansal rakamlar vermeniz gerekmez.",
      clarificationHintEn:
        "Indicate whether timings are measured or rough estimates (e.g., 'line stopped for ~4 hours', 'OEM delivery took 3 weeks'). Confidential financial numbers are not required.",
      maxDurationSec: 60,
    },
    {
      id: "pir-s1-q8-roles-involved",
      order: 8,
      title: "Q8 — Roller & Onaylar: Çözüm Sürecinde Kimler Yer Aldı?",
      titleEn: "Q8 — Roles & Approvals: Who Was Involved in Decisions?",
      description:
        "Parçanın tespiti, teknik incelenmesi, satın alma onayı veya ödeme aşamalarında hangi departmanlar veya roller yer aldı? Her biri ne yaptı?",
      descriptionEn:
        "Which departments or roles were involved in identifying the part, evaluating technical fit, approving procurement, or funding the solution? What was each role's responsibility?",
      clarificationHint:
        "Kişi ismi vermeden fonksiyonel rolleri düşünebilirsiniz (ör. Bakım Teknisyeni tespit etti, Bakım Şefi onayladı, Satın Alma tedarikçiyi aradı, Kalite/Hijyen Sorumlusu gıda temasını sordu).",
      clarificationHintEn:
        "Mention functional roles rather than personal names (e.g., Maintenance Technician flagged it, Maintenance Lead approved, Procurement handled supplier, Quality/Hygiene verified food contact).",
      maxDurationSec: 60,
    },
    {
      id: "pir-s1-q9-outcome",
      order: 9,
      title: "Q9 — Sonuç & Dersler: Olay Nasıl Çözüldü, Hangi Zorluklar Kaldı?",
      titleEn: "Q9 — Outcome & Lessons: How Was It Resolved & What Uncertainties Remain?",
      description:
        "Sorun kalıcı olarak çözüldü mü? Süreçte neler iyi işledi, nerede zorluk yaşandı ve ilerisi için hangi belirsizlikler veya soru işaretleri kaldı?",
      descriptionEn:
        "Was the issue permanently resolved? What worked smoothly, what proved difficult, and what uncertainties or questions linger regarding future replacements?",
      clarificationHint:
        "Geçici bir çözümle mi idare edildiği, aynı parçanın tekrar kırılma riski, tedarik güvenliği veya geleceğe yönelik bakım prosedürü değişikliklerini aktarabilirsiniz.",
      clarificationHintEn:
        "You can mention temporary workarounds, repeat failure risks, supplier dependency, or updated maintenance procedures. Unresolved or partial outcomes are very valuable.",
      maxDurationSec: 60,
    },
  ],
};
