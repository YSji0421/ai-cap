const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const INSURANCE_PROMPTS = {
  TRAFFIC: {
    label: "교통사고",
    focus: "과실비율, 후유장해, 치료비, 합의금, 대인배상, 대물배상을 중점적으로 분석",
    jsonHint: `"keywords": ["과실비율","후유장해","치료비","합의금","대인배상" 등],
  "clauseRefs": ["자동차보험 약관 관련 조항"],
  "actionItems": ["과실비율 관련 조치","치료비 관련 조치","합의금 관련 조치"]`
  },
  INJURY: {
    label: "상해",
    focus: "입원일당, 수술비, 후유장해등급, 실손보험 적용 여부, 진단서 확인을 중점적으로 분석",
    jsonHint: `"keywords": ["입원일당","수술비","후유장해등급","실손보험","진단서" 등],
  "clauseRefs": ["상해보험 약관 관련 조항"],
  "actionItems": ["입원일당 산정 조치","실손 적용 확인","후유장해등급 판정 조치"]`
  },
  FIRE: {
    label: "화재",
    focus: "재물손해액, 임시거주비, 영업손해, 잔존물처리비, 화재원인 조사를 중점적으로 분석",
    jsonHint: `"keywords": ["재물손해액","임시거주비","영업손해","잔존물처리","화재원인" 등],
  "clauseRefs": ["화재보험 약관 관련 조항"],
  "actionItems": ["재물손해액 산정","임시거주비 확인","잔존물처리 조치"]`
  },
  LIFE: {
    label: "생명",
    focus: "사망보험금, 수익자 확인, 고지의무 위반 여부, 면책사유, 보험금 지급 조건을 중점적으로 분석",
    jsonHint: `"keywords": ["사망보험금","수익자","고지의무","면책사유","보험금지급" 등],
  "clauseRefs": ["생명보험 약관 관련 조항"],
  "actionItems": ["수익자 확인 조치","고지의무 위반 조사","보험금 지급 심사"]`
  }
};

export const analyzeConsultation = async (transcript, insuranceType = "TRAFFIC") => {
  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") return getMockAnalysis(insuranceType);

  const typeInfo = INSURANCE_PROMPTS[insuranceType] || INSURANCE_PROMPTS.TRAFFIC;

  const prompt = `당신은 보험 손해사정 전문 AI입니다.
다음 상담 내용을 분석하여 JSON만 반환하세요 (설명 없이):
상담내용: "${transcript}"
보험유형: ${typeInfo.label}

분석 시 ${typeInfo.focus}하세요.

{
  "summary": "3줄 요약",
  ${typeInfo.jsonHint},
  "customerTone": "불안|차분|불만|적극적 중 하나",
  "riskLevel": "낮음|보통|높음 중 하나",
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
  } catch { return getMockAnalysis(insuranceType); }
};

const MOCK_DATA = {
  TRAFFIC: {
    summary: "고객이 교통사고로 인한 경추·요추 염좌 진단을 받았으며, 보험사의 조기 합의 요청에 대한 검토를 의뢰함. 치료 기간 및 합의금 산정이 주요 쟁점이며 후유장해 가능성도 있음.",
    keywords: ["과실비율", "후유장해", "치료비", "합의금", "대인배상"],
    clauseRefs: ["자동차보험 약관 제12조 (대인배상)", "제15조 (보험금 청구)", "제18조 (손해배상)", "제22조 (과실상계)"],
    customerTone: "불안",
    riskLevel: "보통",
    actionItems: ["치료 종결 전 합의 거절 권고", "후유장해 진단서 발급 필요", "과실비율 재산정 요청"],
    settlementHint: "치료 종결 후 후유장해 여부 확인 뒤 합의 진행 권장"
  },
  INJURY: {
    summary: "고객이 일상생활 중 발생한 상해로 입원 치료 중이며, 실손보험 및 상해보험 동시 청구를 문의함. 수술 여부와 후유장해등급 판정이 핵심 쟁점임.",
    keywords: ["입원일당", "수술비", "후유장해등급", "실손보험", "진단서"],
    clauseRefs: ["상해보험 약관 제8조 (입원일당)", "제11조 (수술비)", "제14조 (후유장해)", "실손의료비 약관 제5조"],
    customerTone: "불안",
    riskLevel: "보통",
    actionItems: ["입원일당 산정 기준 확인", "실손보험 중복 적용 여부 확인", "후유장해등급 판정 의뢰"],
    settlementHint: "수술 후 경과 관찰 완료 시점에 후유장해 판정 후 보험금 산정 권장"
  },
  FIRE: {
    summary: "고객의 점포에서 전기 합선으로 화재가 발생하여 재물 피해와 영업 중단이 발생함. 재물손해액 산정과 임시거주비 지급이 주요 쟁점임.",
    keywords: ["재물손해액", "임시거주비", "영업손해", "잔존물처리", "화재원인"],
    clauseRefs: ["화재보험 약관 제6조 (재물손해)", "제9조 (임시거주비)", "제12조 (영업손해배상)", "제15조 (잔존물처리비)"],
    customerTone: "불만",
    riskLevel: "높음",
    actionItems: ["화재원인 조사 보고서 확보", "재물손해액 감정평가 의뢰", "임시거주비 및 영업손해 산정"],
    settlementHint: "화재원인 조사 완료 후 재물감정 결과를 바탕으로 손해액 확정 권장"
  },
  LIFE: {
    summary: "피보험자 사망 후 유가족이 사망보험금 청구를 위해 상담을 요청함. 수익자 확인 및 고지의무 위반 여부가 주요 쟁점이며, 면책사유 해당 여부도 검토 필요.",
    keywords: ["사망보험금", "수익자", "고지의무", "면책사유", "보험금지급"],
    clauseRefs: ["생명보험 약관 제10조 (사망보험금)", "제16조 (수익자 지정)", "제21조 (고지의무)", "제25조 (면책사유)"],
    customerTone: "차분",
    riskLevel: "높음",
    actionItems: ["수익자 지정 내역 확인", "고지의무 위반 사항 조사", "면책사유 해당 여부 법률 검토"],
    settlementHint: "고지의무 위반 여부 확인 후 면책 적용 가능성 판단 필요"
  }
};

const getMockAnalysis = (insuranceType = "TRAFFIC") => {
  return MOCK_DATA[insuranceType] || MOCK_DATA.TRAFFIC;
};
