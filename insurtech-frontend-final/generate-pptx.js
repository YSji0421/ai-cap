const pptxgen = require("pptxgenjs");
const path = require("path");
const pres = new pptxgen();

pres.layout = "LAYOUT_16x9";
pres.author = "insurtech-frontend-final";
pres.title = "AI 보험 화상 상담 플랫폼 발표자료";

// ── Colors ──
const NAVY = "1E3A8A";
const BLUE = "2563EB";
const DARK = "0F172A";
const GRAY = "374151";
const LIGHT_GRAY = "64748B";
const BG_LIGHT = "F0F4F8";
const WHITE = "FFFFFF";
const PURPLE = "7C3AED";
const GREEN = "059669";
const ORANGE = "D97706";
const RED = "DC2626";
const ICE = "DBEAFE";
const CARD_BG = "F8FAFC";

// ── Helpers ──
const mkShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.12 });

// ════════════════════════════════════════
// SLIDE 1 - COVER
// ════════════════════════════════════════
let s1 = pres.addSlide();
s1.background = { color: DARK };
// Decorative top bar
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: BLUE } });
// Decorative left accent
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: BLUE } });
s1.addText("AI 보험 화상 상담 플랫폼", { x: 0.8, y: 1.2, w: 8.4, h: 1.2, fontSize: 40, fontFace: "Arial Black", color: WHITE, bold: true, margin: 0 });
s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.5, w: 2, h: 0.05, fill: { color: BLUE } });
s1.addText("Gemini AI 기반 보험업 종사자용 실시간 화상 상담 시스템", { x: 0.8, y: 2.7, w: 8.4, h: 0.8, fontSize: 18, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
// Stats row
const stats = [
  { num: "4", label: "보험 유형" },
  { num: "3", label: "사용자 역할" },
  { num: "10+", label: "핵심 기능" },
  { num: "AI", label: "Gemini 분석" },
];
stats.forEach((st, i) => {
  const sx = 0.8 + i * 2.2;
  s1.addShape(pres.shapes.RECTANGLE, { x: sx, y: 3.7, w: 1.9, h: 0.9, fill: { color: "1E293B" }, line: { color: "334155", width: 1 } });
  s1.addText(st.num, { x: sx, y: 3.72, w: 1.9, h: 0.5, fontSize: 22, fontFace: "Arial Black", color: BLUE, align: "center", valign: "middle", margin: 0 });
  s1.addText(st.label, { x: sx, y: 4.22, w: 1.9, h: 0.35, fontSize: 10, fontFace: "Arial", color: LIGHT_GRAY, align: "center", valign: "middle", margin: 0 });
});
s1.addText("2026년 4월  |  insurtech-frontend-final", { x: 0.8, y: 5.0, w: 8.4, h: 0.4, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });

// ════════════════════════════════════════
// SLIDE 2 - TOC
// ════════════════════════════════════════
let s2 = pres.addSlide();
s2.background = { color: WHITE };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s2.addText("발표 목차", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });
const tocItems = [
  "개발 배경 및 타당성",
  "시스템 개요 및 기술 스택",
  "핵심 기능 소개",
  "화면 흐름 시연",
  "시스템 아키텍처",
  "향후 개선 계획",
];
tocItems.forEach((item, i) => {
  const ty = 1.3 + i * 0.65;
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: ty, w: 0.5, h: 0.5, fill: { color: BLUE } });
  s2.addText(String(i + 1), { x: 0.7, y: ty, w: 0.5, h: 0.5, fontSize: 18, fontFace: "Arial Black", color: WHITE, align: "center", valign: "middle", margin: 0 });
  s2.addText(item, { x: 1.4, y: ty, w: 7, h: 0.5, fontSize: 18, fontFace: "Arial", color: GRAY, valign: "middle", margin: 0 });
  if (i < tocItems.length - 1) {
    s2.addShape(pres.shapes.LINE, { x: 1.4, y: ty + 0.55, w: 7.5, h: 0, line: { color: "E2E8F0", width: 1 } });
  }
});

// ════════════════════════════════════════
// SLIDE 3 - 개발 배경
// ════════════════════════════════════════
let s3 = pres.addSlide();
s3.background = { color: WHITE };
s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s3.addText("개발 배경", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });

const bgItems = [
  { icon: "📈", title: "보험업계 디지털 전환 가속화", desc: "비대면 상담 수요 급증 (코로나19 이후 원격 상담 300% 증가)" },
  { icon: "⚠️", title: "기존 화상 상담의 한계", desc: "단순 영상 통화만 제공, 상담 내용 수기 기록, 약관 조항 검색에 시간 소모" },
  { icon: "🤖", title: "AI 기술 발전", desc: "LLM(대규모 언어 모델)의 실시간 텍스트 분석 능력이 상용화 수준에 도달" },
  { icon: "⚖️", title: "보험 분쟁 증가", desc: "손해사정, 보험금 청구 과정에서 전문적 분석 도구 필요성 대두" },
];
bgItems.forEach((item, i) => {
  const cy = 1.2 + i * 1.05;
  s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: cy, w: 8.6, h: 0.9, fill: { color: i % 2 === 0 ? CARD_BG : WHITE }, shadow: mkShadow() });
  s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: cy, w: 0.06, h: 0.9, fill: { color: BLUE } });
  s3.addText(item.icon, { x: 0.95, y: cy, w: 0.5, h: 0.9, fontSize: 22, align: "center", valign: "middle", margin: 0 });
  s3.addText(item.title, { x: 1.5, y: cy + 0.08, w: 7, h: 0.4, fontSize: 16, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
  s3.addText(item.desc, { x: 1.5, y: cy + 0.45, w: 7, h: 0.4, fontSize: 13, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
});

// ════════════════════════════════════════
// SLIDE 4 - 개발 타당성
// ════════════════════════════════════════
let s4 = pres.addSlide();
s4.background = { color: WHITE };
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s4.addText("개발 타당성", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });

// Left column - 기술적
s4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 4.3, h: 4.0, fill: { color: CARD_BG }, shadow: mkShadow() });
s4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 4.3, h: 0.06, fill: { color: BLUE } });
s4.addText("🔧  기술적 타당성", { x: 0.7, y: 1.35, w: 4, h: 0.45, fontSize: 17, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
const techItems = [
  { t: "WebRTC", d: "브라우저 내장 P2P 통신, 별도 플러그인 불필요" },
  { t: "Web Speech API", d: "Chrome 기반 실시간 한국어 음성인식" },
  { t: "Gemini AI", d: "Google의 최신 LLM으로 보험 약관 분석에 최적화" },
  { t: "React SPA", d: "빠른 화면 전환과 실시간 UI 업데이트" },
];
techItems.forEach((item, i) => {
  const iy = 1.95 + i * 0.78;
  s4.addText([
    { text: item.t, options: { bold: true, color: BLUE, fontSize: 13, breakLine: true } },
    { text: item.d, options: { color: GRAY, fontSize: 12 } },
  ], { x: 0.85, y: iy, w: 3.7, h: 0.7, fontFace: "Arial", margin: 0 });
});

// Right column - 경제적
s4.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.15, w: 4.3, h: 4.0, fill: { color: CARD_BG }, shadow: mkShadow() });
s4.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.15, w: 4.3, h: 0.06, fill: { color: GREEN } });
s4.addText("💰  경제적 타당성", { x: 5.4, y: 1.35, w: 4, h: 0.45, fontSize: 17, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
const econItems = [
  { t: "상담 시간 단축", d: "AI 분석으로 약관 검색 시간 70% 절감 예상" },
  { t: "인력 효율화", d: "1인 상담사가 AI 보조로 전문가 수준 상담 가능" },
  { t: "낮은 진입 장벽", d: "웹 브라우저만으로 즉시 사용 가능" },
  { t: "보고서 자동 생성", d: "수기 작성 대비 업무시간 50% 절감" },
];
econItems.forEach((item, i) => {
  const iy = 1.95 + i * 0.78;
  s4.addText([
    { text: item.t, options: { bold: true, color: GREEN, fontSize: 13, breakLine: true } },
    { text: item.d, options: { color: GRAY, fontSize: 12 } },
  ], { x: 5.55, y: iy, w: 3.7, h: 0.7, fontFace: "Arial", margin: 0 });
});

// ════════════════════════════════════════
// SLIDE 5 - 기술 스택
// ════════════════════════════════════════
let s5 = pres.addSlide();
s5.background = { color: WHITE };
s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s5.addText("시스템 개요 및 기술 스택", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });

const stackRows = [
  ["구분", "기술", "역할"],
  ["Frontend", "React 18, React Router v6", "SPA 기반 사용자 인터페이스"],
  ["실시간 통신", "WebRTC, WebSocket", "P2P 화상통화, 시그널링"],
  ["음성인식", "Web Speech API (STT)", "실시간 한국어 음성→텍스트"],
  ["AI 분석", "Google Gemini 1.5 Flash", "보험 유형별 약관 분석"],
  ["Backend", "Spring Boot 3.2", "WebSocket 시그널링 서버"],
  ["저장소", "localStorage / H2", "상담 이력, 사용자 정보"],
];
s5.addTable(
  stackRows.map((row, ri) =>
    row.map((cell) => ({
      text: cell,
      options: {
        fontSize: ri === 0 ? 13 : 12,
        fontFace: "Arial",
        bold: ri === 0,
        color: ri === 0 ? WHITE : GRAY,
        fill: { color: ri === 0 ? NAVY : (ri % 2 === 0 ? "F1F5F9" : WHITE) },
        border: { pt: 0.5, color: "E2E8F0" },
        valign: "middle",
        margin: [6, 8, 6, 8],
      },
    }))
  ),
  { x: 0.5, y: 1.2, w: 9, colW: [1.6, 3.2, 4.2] }
);

// ════════════════════════════════════════
// SLIDE 6 - 핵심 기능 1/3
// ════════════════════════════════════════
let s6 = pres.addSlide();
s6.background = { color: WHITE };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s6.addText("핵심 기능 (1/3)", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });

// Card 1
s6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 4.3, h: 3.8, fill: { color: CARD_BG }, shadow: mkShadow() });
s6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 4.3, h: 0.06, fill: { color: PURPLE } });
s6.addText("👤  역할 기반 로그인", { x: 0.7, y: 1.35, w: 4, h: 0.45, fontSize: 17, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
s6.addText([
  { text: "3가지 역할: 손해사정사 / 보험설계사 / 보험사 CS", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "역할별 대시보드 제목 자동 변경", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "상단 네비게이션에 역할 배지 표시", options: { bullet: true, fontSize: 13, color: GRAY } },
], { x: 0.85, y: 2.0, w: 3.7, h: 2.5, fontFace: "Arial", paraSpaceAfter: 10, margin: 0 });

// Card 2
s6.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.15, w: 4.3, h: 3.8, fill: { color: CARD_BG }, shadow: mkShadow() });
s6.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.15, w: 4.3, h: 0.06, fill: { color: BLUE } });
s6.addText("🎯  보험 유형별 AI 분석", { x: 5.4, y: 1.35, w: 4, h: 0.45, fontSize: 17, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
s6.addText([
  { text: "4가지 보험 유형: 교통사고 / 상해 / 화재 / 생명", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "유형별 특화된 Gemini 프롬프트 자동 적용", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "유형에 맞는 키워드, 약관 조항, 후속 조치 반환", options: { bullet: true, fontSize: 13, color: GRAY } },
], { x: 5.55, y: 2.0, w: 3.7, h: 2.5, fontFace: "Arial", paraSpaceAfter: 10, margin: 0 });

// Type badges at bottom of card 2
const types = [
  { label: "교통사고", color: BLUE },
  { label: "상해", color: GREEN },
  { label: "화재", color: ORANGE },
  { label: "생명", color: PURPLE },
];
types.forEach((t, i) => {
  s6.addShape(pres.shapes.RECTANGLE, { x: 5.5 + i * 0.95, y: 4.2, w: 0.85, h: 0.35, fill: { color: t.color } });
  s6.addText(t.label, { x: 5.5 + i * 0.95, y: 4.2, w: 0.85, h: 0.35, fontSize: 10, fontFace: "Arial", color: WHITE, align: "center", valign: "middle", bold: true, margin: 0 });
});

// ════════════════════════════════════════
// SLIDE 7 - 핵심 기능 2/3
// ════════════════════════════════════════
let s7 = pres.addSlide();
s7.background = { color: WHITE };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s7.addText("핵심 기능 (2/3)", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });

s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 4.3, h: 3.8, fill: { color: CARD_BG }, shadow: mkShadow() });
s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 4.3, h: 0.06, fill: { color: BLUE } });
s7.addText("📹  WebRTC 화상 상담", { x: 0.7, y: 1.35, w: 4, h: 0.45, fontSize: 17, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
s7.addText([
  { text: "P2P 연결: offer/answer/ICE candidate 교환", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "같은 방 ID로 자동 연결", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "마이크/카메라 ON/OFF 개별 제어", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "ICE candidate 버퍼링으로 안정적 연결", options: { bullet: true, fontSize: 13, color: GRAY } },
], { x: 0.85, y: 2.0, w: 3.7, h: 2.5, fontFace: "Arial", paraSpaceAfter: 10, margin: 0 });

s7.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.15, w: 4.3, h: 3.8, fill: { color: CARD_BG }, shadow: mkShadow() });
s7.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.15, w: 4.3, h: 0.06, fill: { color: GREEN } });
s7.addText("🎙️  실시간 음성인식 (STT)", { x: 5.4, y: 1.35, w: 4, h: 0.45, fontSize: 17, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
s7.addText([
  { text: "Web Speech API 기반 한국어 음성→텍스트 변환", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "실시간 대화 기록 자동 생성", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "상담 내용을 AI 분석 입력으로 활용", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "Chrome 브라우저 네이티브 지원", options: { bullet: true, fontSize: 13, color: GRAY } },
], { x: 5.55, y: 2.0, w: 3.7, h: 2.5, fontFace: "Arial", paraSpaceAfter: 10, margin: 0 });

// ════════════════════════════════════════
// SLIDE 8 - 핵심 기능 3/3
// ════════════════════════════════════════
let s8 = pres.addSlide();
s8.background = { color: WHITE };
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s8.addText("핵심 기능 (3/3)", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });

s8.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 4.3, h: 3.8, fill: { color: CARD_BG }, shadow: mkShadow() });
s8.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.15, w: 4.3, h: 0.06, fill: { color: ORANGE } });
s8.addText("📄  상담 보고서 자동 생성", { x: 0.7, y: 1.35, w: 4, h: 0.45, fontSize: 17, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
s8.addText([
  { text: "AI 분석 요약, 키워드, 약관 조항, 감정/위험도, 후속 조치 포함", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "@media print CSS로 PDF 저장 가능", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "별도 라이브러리 없이 브라우저 내장 기능 활용", options: { bullet: true, fontSize: 13, color: GRAY } },
], { x: 0.85, y: 2.0, w: 3.7, h: 2.5, fontFace: "Arial", paraSpaceAfter: 10, margin: 0 });

s8.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.15, w: 4.3, h: 3.8, fill: { color: CARD_BG }, shadow: mkShadow() });
s8.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.15, w: 4.3, h: 0.06, fill: { color: RED } });
s8.addText("📊  분석 대시보드", { x: 5.4, y: 1.35, w: 4, h: 0.45, fontSize: 17, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
s8.addText([
  { text: "감정 분포, 위험도 분포, 보험 유형별 통계", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "핵심 키워드 TOP 10", options: { bullet: true, breakLine: true, fontSize: 13, color: GRAY } },
  { text: "역할별 맞춤 대시보드 제목", options: { bullet: true, fontSize: 13, color: GRAY } },
], { x: 5.55, y: 2.0, w: 3.7, h: 2.5, fontFace: "Arial", paraSpaceAfter: 10, margin: 0 });

// Role badges at bottom of card 2
const roles = [
  { label: "사건 분석", sub: "손해사정사", color: PURPLE },
  { label: "영업 상담", sub: "보험설계사", color: BLUE },
  { label: "민원 처리", sub: "보험사 CS", color: GREEN },
];
roles.forEach((r, i) => {
  s8.addShape(pres.shapes.RECTANGLE, { x: 5.45 + i * 1.35, y: 4.05, w: 1.25, h: 0.55, fill: { color: r.color } });
  s8.addText(r.label, { x: 5.45 + i * 1.35, y: 4.05, w: 1.25, h: 0.3, fontSize: 10, fontFace: "Arial", color: WHITE, align: "center", valign: "middle", bold: true, margin: 0 });
  s8.addText(r.sub, { x: 5.45 + i * 1.35, y: 4.3, w: 1.25, h: 0.25, fontSize: 8, fontFace: "Arial", color: WHITE, align: "center", valign: "middle", margin: 0 });
});

// ════════════════════════════════════════
// SLIDE 9 - 화면 흐름도
// ════════════════════════════════════════
let s9 = pres.addSlide();
s9.background = { color: DARK };
s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s9.addText("화면 흐름도", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, bold: true, margin: 0 });

const flowSteps = [
  { label: "로그인", desc: "역할 선택", color: PURPLE },
  { label: "메인 홈", desc: "상담 시작 / 이력 / 대시보드", color: BLUE },
  { label: "장치 체크", desc: "보험 유형 선택", color: GREEN },
  { label: "화상 상담실", desc: "약관 | 영상 | AI분석", color: ORANGE },
  { label: "AI 분석", desc: "STT → 분석 → 결과", color: RED },
  { label: "상담 종료", desc: "요약 → 보고서 다운로드", color: NAVY },
];
flowSteps.forEach((step, i) => {
  const fx = 0.7;
  const fy = 1.15 + i * 0.72;
  // Number circle
  s9.addShape(pres.shapes.OVAL, { x: fx, y: fy + 0.05, w: 0.45, h: 0.45, fill: { color: step.color } });
  s9.addText(String(i + 1), { x: fx, y: fy + 0.05, w: 0.45, h: 0.45, fontSize: 16, fontFace: "Arial Black", color: WHITE, align: "center", valign: "middle", margin: 0 });
  // Label
  s9.addText(step.label, { x: 1.4, y: fy, w: 3, h: 0.3, fontSize: 17, fontFace: "Arial", color: WHITE, bold: true, margin: 0 });
  s9.addText(step.desc, { x: 1.4, y: fy + 0.28, w: 3, h: 0.25, fontSize: 12, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
  // Connector line
  if (i < flowSteps.length - 1) {
    s9.addShape(pres.shapes.LINE, { x: 0.92, y: fy + 0.55, w: 0, h: 0.17, line: { color: "334155", width: 2 } });
  }
});

// Right side - architecture mini
s9.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.15, w: 4.2, h: 4.15, fill: { color: "1E293B" }, line: { color: "334155", width: 1 } });
s9.addText("3패널 상담실 레이아웃", { x: 5.5, y: 1.25, w: 3.8, h: 0.4, fontSize: 14, fontFace: "Arial", color: WHITE, bold: true, margin: 0 });
// Mini panels
s9.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.8, w: 1.1, h: 3.0, fill: { color: "0F172A" }, line: { color: "334155", width: 1 } });
s9.addText("📄\n약관\n문서", { x: 5.5, y: 1.8, w: 1.1, h: 3.0, fontSize: 10, fontFace: "Arial", color: LIGHT_GRAY, align: "center", valign: "middle", margin: 0 });
s9.addShape(pres.shapes.RECTANGLE, { x: 6.7, y: 1.8, w: 1.7, h: 3.0, fill: { color: "0F172A" }, line: { color: "334155", width: 1 } });
s9.addText("📹\n화상 영상\n(WebRTC)", { x: 6.7, y: 1.8, w: 1.7, h: 3.0, fontSize: 10, fontFace: "Arial", color: LIGHT_GRAY, align: "center", valign: "middle", margin: 0 });
s9.addShape(pres.shapes.RECTANGLE, { x: 8.5, y: 1.8, w: 0.85, h: 3.0, fill: { color: "0F172A" }, line: { color: "334155", width: 1 } });
s9.addText("🤖\nAI\n분석", { x: 8.5, y: 1.8, w: 0.85, h: 3.0, fontSize: 10, fontFace: "Arial", color: LIGHT_GRAY, align: "center", valign: "middle", margin: 0 });

// ════════════════════════════════════════
// SLIDES 10-13 - 화면 시연 (Description cards)
// ════════════════════════════════════════
function makeScreenSlide(title, leftTitle, leftItems, rightTitle, rightItems) {
  let sl = pres.addSlide();
  sl.background = { color: WHITE };
  sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
  sl.addText(title, { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });

  // Left
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.05, w: 4.3, h: 4.1, fill: { color: CARD_BG }, shadow: mkShadow() });
  sl.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.05, w: 4.3, h: 0.06, fill: { color: BLUE } });
  sl.addText(leftTitle, { x: 0.7, y: 1.2, w: 3.9, h: 0.4, fontSize: 16, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
  sl.addText(
    leftItems.map((item, i) => ({ text: item, options: { bullet: true, breakLine: i < leftItems.length - 1, fontSize: 12, color: GRAY } })),
    { x: 0.8, y: 1.7, w: 3.7, h: 3.2, fontFace: "Arial", paraSpaceAfter: 8, margin: 0 }
  );

  // Right
  sl.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.05, w: 4.3, h: 4.1, fill: { color: CARD_BG }, shadow: mkShadow() });
  sl.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.05, w: 4.3, h: 0.06, fill: { color: GREEN } });
  sl.addText(rightTitle, { x: 5.4, y: 1.2, w: 3.9, h: 0.4, fontSize: 16, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
  sl.addText(
    rightItems.map((item, i) => ({ text: item, options: { bullet: true, breakLine: i < rightItems.length - 1, fontSize: 12, color: GRAY } })),
    { x: 5.5, y: 1.7, w: 3.7, h: 3.2, fontFace: "Arial", paraSpaceAfter: 8, margin: 0 }
  );
  return sl;
}

// Slide 10
makeScreenSlide(
  "화면 시연 - 로그인 및 메인",
  "📱  로그인 화면",
  ["이메일 + 비밀번호 입력", "역할 선택: 손해사정사 / 보험설계사 / 보험사 CS", "역할에 따라 대시보드 제목 자동 변경", "회원가입에서도 동일하게 역할 선택"],
  "🏠  메인 화면",
  ["상단 네비게이션에 역할 배지 표시", "\"새로운 AI 상담 시작\" 버튼", "이전 상담 기록 목록 (키워드 태그 포함)", "대시보드 바로가기 버튼"]
);

// Slide 11
makeScreenSlide(
  "화면 시연 - 장치 체크 및 상담실",
  "🔍  장치 체크 화면",
  ["카메라/마이크 권한 확인 및 프리뷰", "4가지 보험 유형 선택 카드 UI", "교통사고 / 상해 / 화재 / 생명", "선택한 유형은 localStorage에 저장"],
  "💬  화상 상담실",
  ["3패널 레이아웃: 약관문서 | 화상영상 | AI분석", "상단 바: 방 ID, 보험유형 배지, 타이머, 연결 상태", "컨트롤바: 마이크/카메라/STT/AI분석/종료", "실시간 STT 대화 기록 및 AI 분석 결과 패널"]
);

// Slide 12
makeScreenSlide(
  "화면 시연 - AI 분석 및 상담 요약",
  "🤖  AI 분석 결과",
  ["Gemini 분석 요약 (3줄)", "고객 감정: 불안 / 차분 / 불만 / 적극적", "위험도: 낮음 / 보통 / 높음", "핵심 키워드 5개 + 관련 약관 조항", "후속 조치 항목 및 합의 방향 제안"],
  "📋  상담 요약 화면",
  ["통계 카드: 음성인식수 / AI분석수 / 키워드수 / 상담시간", "감지된 키워드 태그", "AI 분석 리포트 (감정, 위험도, 합의방향)", "\"보고서 다운로드\" 버튼 (PDF 인쇄)"]
);

// Slide 13 - Dashboard (full width)
let s13 = pres.addSlide();
s13.background = { color: WHITE };
s13.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s13.addText("화면 시연 - 분석 대시보드", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });

const dashFeatures = [
  { icon: "🏷️", title: "역할별 맞춤 제목", desc: "사건 분석 / 영업 상담 / 민원 처리", color: PURPLE },
  { icon: "📊", title: "상단 통계 카드", desc: "총 상담 건수, 총/평균 상담 시간, 키워드 종류", color: BLUE },
  { icon: "😊", title: "고객 감정 분포 차트", desc: "불안 / 차분 / 불만 / 적극적 비율 시각화", color: GREEN },
  { icon: "⚠️", title: "위험도 분포 차트", desc: "낮음 / 보통 / 높음 건수 시각화", color: ORANGE },
  { icon: "📋", title: "보험 유형별 상담 통계", desc: "교통사고 / 상해 / 화재 / 생명 건수 비교", color: RED },
  { icon: "🔑", title: "핵심 키워드 TOP 10", desc: "가장 많이 감지된 키워드 순위 및 빈도", color: NAVY },
];
dashFeatures.forEach((f, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const fx = 0.5 + col * 3.1;
  const fy = 1.1 + row * 2.15;
  s13.addShape(pres.shapes.RECTANGLE, { x: fx, y: fy, w: 2.9, h: 1.85, fill: { color: CARD_BG }, shadow: mkShadow() });
  s13.addShape(pres.shapes.RECTANGLE, { x: fx, y: fy, w: 0.06, h: 1.85, fill: { color: f.color } });
  s13.addText(f.icon, { x: fx + 0.2, y: fy + 0.15, w: 0.5, h: 0.5, fontSize: 24, margin: 0 });
  s13.addText(f.title, { x: fx + 0.2, y: fy + 0.7, w: 2.5, h: 0.35, fontSize: 14, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
  s13.addText(f.desc, { x: fx + 0.2, y: fy + 1.1, w: 2.5, h: 0.55, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
});

// ════════════════════════════════════════
// SLIDE 14 - 시스템 아키텍처
// ════════════════════════════════════════
let s14 = pres.addSlide();
s14.background = { color: DARK };
s14.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s14.addText("시스템 아키텍처", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, bold: true, margin: 0 });

// Browser box
s14.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.2, w: 4.0, h: 3.8, fill: { color: "1E293B" }, line: { color: BLUE, width: 2 } });
s14.addText("사용자 브라우저 (React)", { x: 0.5, y: 1.2, w: 4.0, h: 0.5, fontSize: 14, fontFace: "Arial", color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
const browserItems = [
  { label: "WebRTC", desc: "P2P 화상 통화", c: BLUE },
  { label: "Web Speech API", desc: "실시간 STT", c: GREEN },
  { label: "Gemini API", desc: "AI 분석 요청/응답", c: ORANGE },
  { label: "WebSocket", desc: "시그널링 (offer/answer/ICE)", c: PURPLE },
];
browserItems.forEach((item, i) => {
  const iy = 1.85 + i * 0.75;
  s14.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: iy, w: 3.4, h: 0.6, fill: { color: "0F172A" } });
  s14.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: iy, w: 0.06, h: 0.6, fill: { color: item.c } });
  s14.addText(item.label, { x: 1.05, y: iy + 0.02, w: 3, h: 0.3, fontSize: 12, fontFace: "Arial", color: WHITE, bold: true, margin: 0 });
  s14.addText(item.desc, { x: 1.05, y: iy + 0.3, w: 3, h: 0.25, fontSize: 10, fontFace: "Arial", color: LIGHT_GRAY, margin: 0 });
});

// Arrows
s14.addShape(pres.shapes.LINE, { x: 4.6, y: 2.5, w: 0.7, h: 0, line: { color: BLUE, width: 2 } });
s14.addShape(pres.shapes.LINE, { x: 4.6, y: 3.95, w: 0.7, h: 0, line: { color: ORANGE, width: 2 } });

// Server box
s14.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.2, w: 4.0, h: 1.6, fill: { color: "1E293B" }, line: { color: PURPLE, width: 2 } });
s14.addText("Spring Boot 서버", { x: 5.5, y: 1.25, w: 4.0, h: 0.45, fontSize: 14, fontFace: "Arial", color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
s14.addShape(pres.shapes.RECTANGLE, { x: 5.8, y: 1.85, w: 3.4, h: 0.6, fill: { color: "0F172A" } });
s14.addShape(pres.shapes.RECTANGLE, { x: 5.8, y: 1.85, w: 0.06, h: 0.6, fill: { color: PURPLE } });
s14.addText("WebSocket Handler → 시그널링 중계", { x: 6.05, y: 1.85, w: 3.0, h: 0.6, fontSize: 11, fontFace: "Arial", color: LIGHT_GRAY, valign: "middle", margin: 0 });

// Gemini box
s14.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 3.2, w: 4.0, h: 1.8, fill: { color: "1E293B" }, line: { color: ORANGE, width: 2 } });
s14.addText("Google Gemini AI", { x: 5.5, y: 3.25, w: 4.0, h: 0.45, fontSize: 14, fontFace: "Arial", color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
s14.addShape(pres.shapes.RECTANGLE, { x: 5.8, y: 3.85, w: 3.4, h: 0.9, fill: { color: "0F172A" } });
s14.addShape(pres.shapes.RECTANGLE, { x: 5.8, y: 3.85, w: 0.06, h: 0.9, fill: { color: ORANGE } });
s14.addText([
  { text: "보험 유형별 특화 프롬프트", options: { breakLine: true, fontSize: 11, color: WHITE } },
  { text: "→ JSON 분석 결과 반환", options: { fontSize: 11, color: LIGHT_GRAY } },
], { x: 6.05, y: 3.9, w: 3.0, h: 0.8, fontFace: "Arial", margin: 0 });

// ════════════════════════════════════════
// SLIDE 15 - 향후 계획
// ════════════════════════════════════════
let s15 = pres.addSlide();
s15.background = { color: WHITE };
s15.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: BLUE } });
s15.addText("향후 개선 계획", { x: 0.7, y: 0.3, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: NAVY, bold: true, margin: 0 });

const plans = [
  {
    title: "단기 (1~2주)", color: GREEN,
    items: ["JWT 기반 실제 인증 시스템", "서버 DB 상담 이력 저장", "TURN 서버 구축 (NAT 환경 대응)"],
  },
  {
    title: "중기 (1~2개월)", color: ORANGE,
    items: ["실제 PDF 약관 업로드 및 AI 파싱", "상담 녹화 기능", "실시간 자동 AI 분석", "상담 예약 시스템"],
  },
  {
    title: "장기 (3개월+)", color: RED,
    items: ["모바일 반응형 UI", "관리자 대시보드", "다중 AI 모델 지원 (GPT-4, Claude 등)"],
  },
];
plans.forEach((plan, i) => {
  const px = 0.5 + i * 3.15;
  s15.addShape(pres.shapes.RECTANGLE, { x: px, y: 1.15, w: 2.95, h: 4.0, fill: { color: CARD_BG }, shadow: mkShadow() });
  s15.addShape(pres.shapes.RECTANGLE, { x: px, y: 1.15, w: 2.95, h: 0.06, fill: { color: plan.color } });
  s15.addText(plan.title, { x: px + 0.15, y: 1.35, w: 2.6, h: 0.45, fontSize: 16, fontFace: "Arial", color: NAVY, bold: true, margin: 0 });
  s15.addText(
    plan.items.map((item, j) => ({ text: item, options: { bullet: true, breakLine: j < plan.items.length - 1, fontSize: 12, color: GRAY } })),
    { x: px + 0.15, y: 2.0, w: 2.6, h: 2.8, fontFace: "Arial", paraSpaceAfter: 10, margin: 0 }
  );
});

// ════════════════════════════════════════
// SLIDE 16 - THANK YOU
// ════════════════════════════════════════
let s16 = pres.addSlide();
s16.background = { color: DARK };
s16.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: BLUE } });
s16.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: BLUE } });
s16.addText("감사합니다", { x: 1, y: 1.3, w: 8, h: 1.2, fontSize: 48, fontFace: "Arial Black", color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
s16.addShape(pres.shapes.RECTANGLE, { x: 4, y: 2.6, w: 2, h: 0.05, fill: { color: BLUE } });
s16.addText("AI 보험 화상 상담 플랫폼", { x: 1, y: 2.8, w: 8, h: 0.7, fontSize: 20, fontFace: "Arial", color: LIGHT_GRAY, align: "center", valign: "middle", margin: 0 });
s16.addText("Q & A", { x: 1, y: 3.8, w: 8, h: 0.8, fontSize: 28, fontFace: "Arial Black", color: BLUE, align: "center", valign: "middle", margin: 0 });

// ── SAVE ──
const OUTPUT = path.join(__dirname, "AI 보험 화상 상담 플랫폼 발표자료.pptx");
pres.writeFile({ fileName: OUTPUT }).then(() => {
  console.log("Created:", OUTPUT);
}).catch(err => {
  console.error("Error:", err);
});
