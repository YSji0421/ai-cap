const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const analyzeConsultation = async (transcript, accidentType = "교통사고") => {
  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") return getMockAnalysis(transcript);

  const prompt = `당신은 보험 손해사정 전문 AI입니다.
다음 상담 내용을 분석하여 JSON만 반환하세요 (설명 없이):
상담내용: "${transcript}"
사고유형: ${accidentType}

{
  "summary": "3줄 요약",
  "keywords": ["키워드1","키워드2","키워드3","키워드4","키워드5"],
  "clauseRefs": ["제12조","제15조"],
  "customerTone": "불안|차분|불만|적극적 중 하나",
  "riskLevel": "낮음|보통|높음 중 하나",
  "actionItems": ["후속조치1","후속조치2","후속조치3"],
  "settlementHint": "예상 합의 방향 한 문장"
}`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 1024 } })
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch { return getMockAnalysis(transcript); }
};

const getMockAnalysis = () => ({
  summary: "고객이 교통사고로 인한 경추·요추 염좌 진단을 받았으며, 보험사의 조기 합의 요청에 대한 검토를 의뢰함. 치료 기간 및 합의금 산정이 주요 쟁점이며 후유장해 가능성도 있음.",
  keywords: ["후유장해", "치료비", "합의금", "과실비율", "대인배상"],
  clauseRefs: ["제12조 (계약 해지)", "제15조 (보험금 청구)", "제18조 (손해배상)"],
  customerTone: "불안",
  riskLevel: "보통",
  actionItems: ["치료 종결 전 합의 거절 권고", "후유장해 진단서 발급 필요", "과실비율 재산정 요청"],
  settlementHint: "치료 종결 후 후유장해 여부 확인 뒤 합의 진행 권장"
});
