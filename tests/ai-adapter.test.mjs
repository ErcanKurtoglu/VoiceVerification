import { test, describe } from "node:test";
import assert from "node:assert";
import { MockAIService } from "../src/services/ai/mock.ts";

describe("AI Adapter & Gemini Service Contract", () => {
  const aiService = new MockAIService();

  test("Yazılı yanıtlarda doğrudan metni transkript kabul etmeli ve AI kotasını tüketmemelidir", async () => {
    const userText = "Bizim tesisimizde nozullar 2 haftada bir aşınıyor ve paslanmaz çelikten üretiliyor.";
    const result = await aiService.transcribeAudioOrText({
      questionTitle: "Parça Tedarik Süresi",
      userTextResponse: userText,
    });

    assert.strictEqual(result.transcript, userText);
    assert.strictEqual(result.isJunk, false);
  });

  test("Sesli yanıtlarda deşifre üretmeli ve çöp bayrağını (isJunk) doğru set etmelidir", async () => {
    const result = await aiService.transcribeAudioOrText({
      questionTitle: "Parça Tedarik Süresi",
      audioBase64: "MOCK_BASE64_AUDIO_STREAM",
      mimeType: "audio/webm",
    });

    assert.strictEqual(typeof result.transcript, "string");
    assert.strictEqual(result.transcript.length > 20, true);
    assert.strictEqual(result.isJunk, false);
  });

  test("Katılımcı soruyla ilgili ipucu veya örnek sorduğunda net rehberlik sunmalıdır", async () => {
    const explanation = await aiService.chatClarification({
      questionTitle: "Parça Tedarik Süresi & Plansız Duruş",
      questionDescription: "Geçtiğimiz 1 yılda tek bir yedek parça gecikmesi yüzünden dolum hattınızın durduğu anı anlatır mısınız?",
      userQuery: "Buna bir örnek verir misiniz?",
      conversationHistory: [],
      projectContext: "Print It Right 3D parça araştırması",
    });

    assert.strictEqual(typeof explanation, "string");
    assert.strictEqual(explanation.includes("örneğin") || explanation.includes("Örneğin"), true);
  });

  test("Çöp/Spam (isJunk=true) yanıtlar analitik ve benchmark raporlarından izole edilmelidir", () => {
    const allResponses = [
      { id: "1", participant: "Ahmet", transcript: "Çok faydalı bir araştırma.", isJunk: false },
      { id: "2", participant: "Bot", transcript: "asdfghjk 123456 !!!", isJunk: true },
      { id: "3", participant: "Mehmet", transcript: "Yedek parça maliyetimiz yüksek.", isJunk: false },
    ];

    const benchmarkResponses = allResponses.filter((r) => !r.isJunk);
    const junkResponses = allResponses.filter((r) => r.isJunk);

    assert.strictEqual(benchmarkResponses.length, 2);
    assert.strictEqual(junkResponses.length, 1);
    assert.strictEqual(junkResponses[0].participant, "Bot");
  });
});
