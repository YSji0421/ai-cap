const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat
} = require("docx");

// ── Shared constants ──
const PAGE_WIDTH = 12240;
const MARGIN = 1440;
const CONTENT_W = PAGE_WIDTH - MARGIN * 2; // 9360
const ACCENT = "1E3A8A";
const ACCENT2 = "2563EB";
const GRAY_BG = "F1F5F9";
const HEADER_BG = "1E3A8A";
const HEADER_TEXT = "FFFFFF";
const border = { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: HEADER_BG, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: HEADER_TEXT, font: "Arial", size: 20 })] })],
  });
}

function cell(text, width, opts = {}) {
  const shade = opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: shade,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, font: "Arial", size: 20, bold: !!opts.bold, color: opts.color || "1E293B" })],
    })],
  });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: ACCENT })] });
}

function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: ACCENT2 })] });
}

function bodyText(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: "Arial", size: 21, color: "374151" })] });
}

function codeBlock(lines) {
  return lines.map(line =>
    new Paragraph({
      spacing: { after: 0, line: 276 },
      indent: { left: 360 },
      children: [new TextRun({ text: line, font: "Consolas", size: 19, color: "1E293B" })],
    })
  );
}

function bullet(text, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 21, color: "374151" })],
  });
}

function numberedItem(text, ref = "numbers", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 21, color: "374151" })],
  });
}

// ── Build document ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: ACCENT2 },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets3", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets4", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // ════════════ COVER PAGE ════════════
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: 15840 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      children: [
        new Paragraph({ spacing: { before: 3000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "AI \uBCF4\uD5D8 \uD654\uC0C1 \uC0C1\uB2F4 \uD50C\uB7AB\uD3FC", font: "Arial", size: 48, bold: true, color: ACCENT })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT2, space: 12 } },
          children: [new TextRun({ text: "\uD504\uB85C\uC81D\uD2B8 \uD604\uD669 \uACF5\uC720", font: "Arial", size: 36, color: ACCENT2 })],
        }),
        new Paragraph({ spacing: { before: 600 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: "\uD504\uB860\uD2B8\uC5D4\uB4DC \uAC1C\uBC1C \uC9C4\uD589 \uD604\uD669 \uBC0F \uC2E4\uD589 \uAC00\uC774\uB4DC", font: "Arial", size: 24, color: "64748B" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: "\uD504\uB85C\uC81D\uD2B8\uBA85: insurtech-frontend-final", font: "Arial", size: 22, color: "64748B" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: "\uC791\uC131\uC77C: 2026\uB144 4\uC6D4 3\uC77C", font: "Arial", size: 22, color: "64748B" })],
        }),
      ],
    },

    // ════════════ MAIN CONTENT ════════════
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: 15840 },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 4 } },
            children: [new TextRun({ text: "AI \uBCF4\uD5D8 \uD654\uC0C1 \uC0C1\uB2F4 \uD50C\uB7AB\uD3FC \u2014 \uD504\uB85C\uC81D\uD2B8 \uD604\uD669", font: "Arial", size: 18, color: "94A3B8" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: "D1D5DB", space: 4 } },
            children: [
              new TextRun({ text: "Page ", font: "Arial", size: 18, color: "94A3B8" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "94A3B8" }),
            ],
          })],
        }),
      },
      children: [
        // ── 1. 프로젝트 개요 ──
        heading1("1. \uD504\uB85C\uC81D\uD2B8 \uAC1C\uC694"),
        bodyText("\uBCF8 \uD504\uB85C\uC81D\uD2B8\uB294 \uBCF4\uD5D8\uC5C5 \uC885\uC0AC\uC790\uB97C \uC704\uD55C AI \uAE30\uBC18 \uD654\uC0C1 \uC0C1\uB2F4 \uD50C\uB7AB\uD3FC\uC73C\uB85C, Gemini AI\uAC00 \uC2E4\uC2DC\uAC04\uC73C\uB85C \uBCF4\uD5D8 \uC57D\uAD00\uC744 \uBD84\uC11D\uD558\uACE0 \uC0C1\uB2F4\uC744 \uC9C0\uC6D0\uD569\uB2C8\uB2E4."),

        // 기술 스택 표
        heading2("\uAE30\uC220 \uC2A4\uD0DD"),
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [2400, 6960],
          rows: [
            new TableRow({ children: [headerCell("\uAD6C\uBD84", 2400), headerCell("\uAE30\uC220", 6960)] }),
            new TableRow({ children: [cell("Frontend", 2400, { bold: true, shade: GRAY_BG }), cell("React 18, React Router v6, Web Speech API (STT)", 6960)] }),
            new TableRow({ children: [cell("Backend", 2400, { bold: true, shade: GRAY_BG }), cell("Spring Boot 3.2, WebSocket, Spring Data JPA, H2", 6960)] }),
            new TableRow({ children: [cell("AI", 2400, { bold: true, shade: GRAY_BG }), cell("Google Gemini 1.5 Flash API", 6960)] }),
            new TableRow({ children: [cell("\uC2E4\uC2DC\uAC04 \uD1B5\uC2E0", 2400, { bold: true, shade: GRAY_BG }), cell("WebRTC (P2P), WebSocket \uC2DC\uADF8\uB110\uB9C1", 6960)] }),
            new TableRow({ children: [cell("\uC0C1\uD0DC \uAD00\uB9AC", 2400, { bold: true, shade: GRAY_BG }), cell("localStorage \uAE30\uBC18 (\uACBD\uB7C9 \uAD6C\uC870)", 6960)] }),
          ],
        }),

        // ── 2. 프로그램 실행 방법 ──
        new Paragraph({ children: [new PageBreak()] }),
        heading1("2. \uD504\uB85C\uADF8\uB7A8 \uC2E4\uD589 \uBC29\uBC95"),

        heading2("2.1 \uC0AC\uC804 \uC900\uBE44\uC0AC\uD56D"),
        bullet("Node.js 18 \uC774\uC0C1 \uC124\uCE58 \uD544\uC694", "bullets"),
        bullet("(\uC120\uD0DD) Spring Boot \uBC31\uC5D4\uB4DC \uC11C\uBC84 \u2014 WebSocket \uC2DC\uADF8\uB110\uB9C1\uC6A9, \uC5C6\uC5B4\uB3C4 \uB85C\uCEEC \uBAA8\uB4DC\uB85C \uB3D9\uC791", "bullets"),
        bullet("(\uC120\uD0DD) Gemini API \uD0A4 \uBC1C\uAE09 \u2014 \uC5C6\uC73C\uBA74 Mock \uB370\uC774\uD130\uB85C \uC2DC\uC5F0 \uAC00\uB2A5", "bullets"),

        heading2("2.2 \uD504\uB860\uD2B8\uC5D4\uB4DC \uC2E4\uD589"),
        ...codeBlock([
          "# \uD504\uB85C\uC81D\uD2B8 \uD3F4\uB354 \uC774\uB3D9",
          "cd insurtech-frontend-final",
          "",
          "# \uC758\uC874\uC131 \uC124\uCE58",
          "npm install",
          "",
          "# \uAC1C\uBC1C \uC11C\uBC84 \uC2E4\uD589 (\uD3EC\uD2B8 3000)",
          "npm start",
        ]),
        bodyText("\uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C http://localhost:3000 \uC73C\uB85C \uC811\uC18D\uD569\uB2C8\uB2E4."),

        heading2("2.3 Gemini AI \uC5F0\uB3D9 (\uC120\uD0DD)"),
        numberedItem("Google AI Studio\uC5D0\uC11C API \uD0A4 \uBC1C\uAE09", "numbers"),
        numberedItem("src/services/gemini.js \uD30C\uC77C \uC5F4\uAE30", "numbers"),
        numberedItem("GEMINI_API_KEY \uBCC0\uC218\uC5D0 \uBC1C\uAE09\uBC1B\uC740 \uD0A4 \uC785\uB825", "numbers"),
        numberedItem("API \uD0A4 \uC5C6\uC774\uB3C4 Mock \uB370\uC774\uD130\uB85C \uBAA8\uB4E0 \uAE30\uB2A5 \uC2DC\uC5F0 \uAC00\uB2A5", "numbers"),

        heading2("2.4 Spring Boot \uBC31\uC5D4\uB4DC \uC2E4\uD589 (\uC120\uD0DD)"),
        ...codeBlock([
          "# \uBC31\uC5D4\uB4DC \uD3F4\uB354 \uC774\uB3D9 \uD6C4",
          "./mvnw spring-boot:run",
        ]),
        bullet("WebSocket \uC2DC\uADF8\uB110\uB9C1 \uC11C\uBC84: ws://localhost:8080/ws/signal", "bullets2"),
        bullet("\uBC31\uC5D4\uB4DC \uC5C6\uC774\uB3C4 \uD504\uB860\uD2B8\uC5D4\uB4DC\uB294 \u201C\uB85C\uCEEC \uBAA8\uB4DC\u201D\uB85C \uC815\uC0C1 \uB3D9\uC791", "bullets2"),

        heading2("2.5 \uD14C\uC2A4\uD2B8 \uC2DC\uB098\uB9AC\uC624"),
        numberedItem("http://localhost:3000 \uC811\uC18D", "numbers2"),
        numberedItem("\uC774\uBA54\uC77C/\uBE44\uBC00\uBC88\uD638 \uC785\uB825 + \uC5ED\uD560 \uC120\uD0DD \uD6C4 \uB85C\uADF8\uC778", "numbers2"),
        numberedItem("\u201C\uC0C8\uB85C\uC6B4 AI \uC0C1\uB2F4 \uC2DC\uC791\u201D \uD074\uB9AD", "numbers2"),
        numberedItem("\uBCF4\uD5D8 \uC720\uD615 \uC120\uD0DD (\uAD50\uD1B5\uC0AC\uACE0/\uC0C1\uD574/\uD654\uC7AC/\uC0DD\uBA85) + \uC7A5\uCE58 \uCCB4\uD06C", "numbers2"),
        numberedItem("\uC0C1\uB2F4\uBC29 \uC785\uC7A5 \u2192 STT \uC2DC\uC791 \u2192 AI \uBD84\uC11D \uC2E4\uD589", "numbers2"),
        numberedItem("\uC885\uB8CC \uD6C4 \uC694\uC57D \uD654\uBA74\uC5D0\uC11C \u201C\uBCF4\uACE0\uC11C \uB2E4\uC6B4\uB85C\uB4DC\u201D \uD074\uB9AD", "numbers2"),

        // ── 3. 현재 구현 완료 기능 ──
        new Paragraph({ children: [new PageBreak()] }),
        heading1("3. \uD604\uC7AC \uAD6C\uD604 \uC644\uB8CC \uAE30\uB2A5"),
        bodyText("\uC544\uB798\uB294 \uD604\uC7AC\uAE4C\uC9C0 \uAD6C\uD604\uB41C \uAE30\uB2A5\uC758 \uC804\uCCB4 \uBAA9\uB85D\uC785\uB2C8\uB2E4."),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [500, 1800, 800, 6260],
          rows: [
            new TableRow({ children: [headerCell("#", 500), headerCell("\uAE30\uB2A5", 1800), headerCell("\uC0C1\uD0DC", 800), headerCell("\uC124\uBA85", 6260)] }),
            ...([
              ["1", "\uD68C\uC6D0\uAC00\uC785/\uB85C\uADF8\uC778", "\u2705", "\uC774\uBA54\uC77C+\uBE44\uBC00\uBC88\uD638+\uC5ED\uD560 \uC120\uD0DD (\uC190\uD574\uC0AC\uC815\uC0AC/\uBCF4\uD5D8\uC124\uACC4\uC0AC/\uBCF4\uD5D8\uC0AC CS)"],
              ["2", "\uBCF4\uD5D8 \uC720\uD615 \uC120\uD0DD", "\u2705", "\uC7A5\uCE58 \uCCB4\uD06C \uD654\uBA74\uC5D0\uC11C 4\uAC00\uC9C0 \uC720\uD615 \uC120\uD0DD (\uAD50\uD1B5\uC0AC\uACE0/\uC0C1\uD574/\uD654\uC7AC/\uC0DD\uBA85)"],
              ["3", "\uD654\uC0C1 \uC0C1\uB2F4 (WebRTC)", "\u2705", "\uB85C\uCEEC \uCE74\uBA54\uB77C \uC2A4\uD2B8\uB9BC + P2P \uC5F0\uACB0 (offer/answer/ICE \uAD50\uD658)"],
              ["4", "\uC74C\uC131 \uC778\uC2DD (STT)", "\u2705", "Web Speech API \uAE30\uBC18 \uC2E4\uC2DC\uAC04 \uD55C\uAD6D\uC5B4 \uC74C\uC131\u2192\uD14D\uC2A4\uD2B8 \uBCC0\uD658"],
              ["5", "AI \uBD84\uC11D (Gemini)", "\u2705", "\uBCF4\uD5D8 \uC720\uD615\uBCC4 \uD2B9\uD654 \uD504\uB86C\uD504\uD2B8, Mock \uB370\uC774\uD130 \uC720\uD615\uBCC4 \uBD84\uB9AC"],
              ["6", "\uC57D\uAD00 \uBB38\uC11C \uD328\uB110", "\u2705", "\uC88C\uCE21 \uD328\uB110\uC5D0 \uC57D\uAD00 \uC870\uD56D \uD45C\uC2DC + AI \uCD94\uCD9C \uAD00\uB828 \uC57D\uAD00 \uD558\uC774\uB77C\uC774\uD2B8"],
              ["7", "\uC0C1\uB2F4 \uC694\uC57D", "\u2705", "\uC885\uB8CC \uD6C4 \uD1B5\uACC4/\uD0A4\uC6CC\uB4DC/\uB300\uD654\uB0B4\uC5ED/AI\uBD84\uC11D \uB9AC\uD3EC\uD2B8 \uD45C\uC2DC"],
              ["8", "\uBCF4\uACE0\uC11C \uB2E4\uC6B4\uB85C\uB4DC", "\u2705", "window.print() + @media print CSS\uB85C PDF \uC800\uC7A5 \uAC00\uB2A5"],
              ["9", "\uB300\uC2DC\uBCF4\uB4DC", "\u2705", "\uC5ED\uD560\uBCC4 \uC81C\uBAA9, \uAC10\uC815\uBD84\uD3EC/\uC704\uD5D8\uB3C4/\uC720\uD615\uBCC4 \uD1B5\uACC4/\uD0A4\uC6CC\uB4DC TOP10"],
              ["10", "WebSocket \uC2DC\uADF8\uB110\uB9C1", "\u2705", "Spring Boot \uBC31\uC5D4\uB4DC \uC5F0\uB3D9, ICE candidate \uBC84\uD37C\uB9C1"],
            ]).map(([num, feat, status, desc]) =>
              new TableRow({ children: [
                cell(num, 500, { center: true, shade: GRAY_BG }),
                cell(feat, 1800, { bold: true }),
                cell(status, 800, { center: true }),
                cell(desc, 6260),
              ] })
            ),
          ],
        }),

        // ── 4. 프로젝트 구조 ──
        new Paragraph({ spacing: { before: 360 } }),
        heading1("4. \uD504\uB85C\uC81D\uD2B8 \uAD6C\uC870"),
        ...codeBlock([
          "src/",
          "\u251C\u2500\u2500 App.js                          # \uB77C\uC6B0\uD305 \uC124\uC815",
          "\u251C\u2500\u2500 index.js                        # \uC5D4\uD2B8\uB9AC\uD3EC\uC778\uD2B8",
          "\u251C\u2500\u2500 hooks/",
          "\u2502   \u2514\u2500\u2500 useWebRTC.js               # WebRTC + STT \uD6C5",
          "\u251C\u2500\u2500 pages/",
          "\u2502   \u251C\u2500\u2500 LoginPage.js               # \uB85C\uADF8\uC778 (\uC5ED\uD560 \uC120\uD0DD)",
          "\u2502   \u251C\u2500\u2500 RegisterPage.js            # \uD68C\uC6D0\uAC00\uC785 (\uC5ED\uD560 \uC120\uD0DD)",
          "\u2502   \u251C\u2500\u2500 MainPage.js                # \uBA54\uC778 \uD648 (\uC5ED\uD560 \uBC30\uC9C0 + \uB300\uC2DC\uBCF4\uB4DC \uB9C1\uD06C)",
          "\u2502   \u251C\u2500\u2500 DeviceCheckPage.js         # \uC7A5\uCE58 \uCCB4\uD06C + \uBCF4\uD5D8 \uC720\uD615 \uC120\uD0DD",
          "\u2502   \u251C\u2500\u2500 ConsultationRoomPage.js    # \uD654\uC0C1 \uC0C1\uB2F4\uC2E4 (3\uD328\uB110 \uB808\uC774\uC544\uC6C3)",
          "\u2502   \u251C\u2500\u2500 SummaryPage.js             # \uC0C1\uB2F4 \uC694\uC57D + \uBCF4\uACE0\uC11C \uB2E4\uC6B4\uB85C\uB4DC",
          "\u2502   \u251C\u2500\u2500 DashboardPage.js           # \uBD84\uC11D \uB300\uC2DC\uBCF4\uB4DC (\uC5ED\uD560\uBCC4)",
          "\u2502   \u2514\u2500\u2500 GeminiSetupGuide.js        # Gemini \uC124\uC815 \uAC00\uC774\uB4DC",
          "\u251C\u2500\u2500 services/",
          "\u2502   \u251C\u2500\u2500 gemini.js                  # Gemini AI \uBD84\uC11D (\uC720\uD615\uBCC4 \uD504\uB86C\uD504\uD2B8 + Mock)",
          "\u2502   \u2514\u2500\u2500 api.js                     # API \uC11C\uBE44\uC2A4",
          "\u2514\u2500\u2500 styles/",
          "    \u2514\u2500\u2500 global.css                 # \uAE00\uB85C\uBC8C \uC2A4\uD0C0\uC77C",
        ]),

        // ── 5. 향후 개선 사항 ──
        new Paragraph({ children: [new PageBreak()] }),
        heading1("5. \uD5A5\uD6C4 \uAC1C\uC120 \uC0AC\uD56D (\uC81C\uC548)"),

        heading2("5.1 \uC6B0\uC120\uC21C\uC704 \uB192\uC74C"),
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [500, 2000, 5360, 1500],
          rows: [
            new TableRow({ children: [headerCell("#", 500), headerCell("\uAC1C\uC120 \uD56D\uBAA9", 2000), headerCell("\uC124\uBA85", 5360), headerCell("\uC608\uC0C1 \uACF5\uC218", 1500)] }),
            ...([
              ["1", "\uC2E4\uC81C \uC778\uC99D \uC2DC\uC2A4\uD15C \uAD6C\uCD95", "JWT \uD1A0\uD070 \uAE30\uBC18 \uB85C\uADF8\uC778/\uD68C\uC6D0\uAC00\uC785 API \uC5F0\uB3D9 (\uD604\uC7AC localStorage \uC784\uC2DC \uC778\uC99D)", "3~5\uC77C"],
              ["2", "DB \uC5F0\uB3D9 (\uC0C1\uB2F4 \uC774\uB825)", "\uC0C1\uB2F4 \uAE30\uB85D\uC744 \uC11C\uBC84 DB\uC5D0 \uC800\uC7A5 (\uD604\uC7AC localStorage\uC5D0\uB9CC \uC800\uC7A5, \uBE0C\uB77C\uC6B0\uC800 \uCD08\uAE30\uD654 \uC2DC \uC18C\uC2E4)", "2~3\uC77C"],
              ["3", "TURN \uC11C\uBC84 \uAD6C\uCD95", "NAT/\uBC29\uD654\uBCBD \uD658\uACBD\uC5D0\uC11C WebRTC \uC5F0\uACB0 \uBCF4\uC7A5 (\uD604\uC7AC STUN\uB9CC \uC0AC\uC6A9, \uC0AC\uB0B4\uB9DD\uC5D0\uC11C P2P \uC2E4\uD328 \uAC00\uB2A5)", "2~3\uC77C"],
              ["4", "\uC2E4\uC81C PDF \uC57D\uAD00 \uC5C5\uB85C\uB4DC", "\uC57D\uAD00 PDF \uD30C\uC77C\uC744 \uC5C5\uB85C\uB4DC\uD558\uACE0 AI\uAC00 \uB0B4\uC6A9\uC744 \uD30C\uC2F1\uD558\uC5EC \uBD84\uC11D\uC5D0 \uD65C\uC6A9", "3~5\uC77C"],
            ]).map(([n, item, desc, est]) =>
              new TableRow({ children: [cell(n, 500, { center: true, shade: GRAY_BG }), cell(item, 2000, { bold: true }), cell(desc, 5360), cell(est, 1500, { center: true })] })
            ),
          ],
        }),

        heading2("5.2 \uC6B0\uC120\uC21C\uC704 \uC911\uAC04"),
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [500, 2000, 5360, 1500],
          rows: [
            new TableRow({ children: [headerCell("#", 500), headerCell("\uAC1C\uC120 \uD56D\uBAA9", 2000), headerCell("\uC124\uBA85", 5360), headerCell("\uC608\uC0C1 \uACF5\uC218", 1500)] }),
            ...([
              ["5", "\uC0C1\uB2F4 \uB179\uD654 \uAE30\uB2A5", "MediaRecorder API\uB85C \uC0C1\uB2F4 \uC601\uC0C1 \uB179\uD654 \uBC0F \uC800\uC7A5", "2~3\uC77C"],
              ["6", "\uC2E4\uC2DC\uAC04 AI \uBD84\uC11D", "\uC77C\uC815 \uC2DC\uAC04 \uAC04\uACA9\uC73C\uB85C \uC790\uB3D9 AI \uBD84\uC11D (\uD604\uC7AC \uC218\uB3D9 \uBC84\uD2BC \uD074\uB9AD)", "1~2\uC77C"],
              ["7", "\uB2E4\uAD6D\uC5B4 STT \uC9C0\uC6D0", "\uD55C\uAD6D\uC5B4 \uC678 \uC601\uC5B4/\uC911\uAD6D\uC5B4 \uC74C\uC131 \uC778\uC2DD \uC9C0\uC6D0", "1~2\uC77C"],
              ["8", "\uC0C1\uB2F4 \uC608\uC57D \uC2DC\uC2A4\uD15C", "\uACE0\uAC1D\uC774 \uC0C1\uB2F4 \uC77C\uC815\uC744 \uC608\uC57D\uD558\uACE0, \uB2F4\uB2F9\uC790\uC5D0\uAC8C \uC54C\uB9BC \uC804\uC1A1", "5~7\uC77C"],
              ["9", "\uC774\uBA54\uC77C/\uC54C\uB9BC \uC5F0\uB3D9", "\uC0C1\uB2F4 \uC644\uB8CC \uD6C4 \uACE0\uAC1D\uC5D0\uAC8C \uC694\uC57D \uBCF4\uACE0\uC11C \uC790\uB3D9 \uC774\uBA54\uC77C \uBC1C\uC1A1", "2~3\uC77C"],
            ]).map(([n, item, desc, est]) =>
              new TableRow({ children: [cell(n, 500, { center: true, shade: GRAY_BG }), cell(item, 2000, { bold: true }), cell(desc, 5360), cell(est, 1500, { center: true })] })
            ),
          ],
        }),

        heading2("5.3 \uC6B0\uC120\uC21C\uC704 \uB0AE\uC74C (\uC7A5\uAE30)"),
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [500, 2000, 5360, 1500],
          rows: [
            new TableRow({ children: [headerCell("#", 500), headerCell("\uAC1C\uC120 \uD56D\uBAA9", 2000), headerCell("\uC124\uBA85", 5360), headerCell("\uC608\uC0C1 \uACF5\uC218", 1500)] }),
            ...([
              ["10", "\uBAA8\uBC14\uC77C \uBC18\uC751\uD615 UI", "\uD0DC\uBE14\uB9BF/\uBAA8\uBC14\uC77C \uD658\uACBD \uB300\uC751 (\uD604\uC7AC \uB370\uC2A4\uD06C\uD1B1 \uCD5C\uC801\uD654)", "3~5\uC77C"],
              ["11", "\uAD00\uB9AC\uC790 \uB300\uC2DC\uBCF4\uB4DC", "\uC804\uCCB4 \uC0C1\uB2F4\uC0AC \uC2E4\uC801 \uC870\uD68C, \uC0C1\uB2F4 \uBC30\uC815, \uD1B5\uACC4 \uAD00\uB9AC", "5~7\uC77C"],
              ["12", "AI \uBAA8\uB378 \uAD50\uCCB4 \uAC00\uB2A5", "Gemini \uC678\uC5D0 GPT-4, Claude \uB4F1 \uB2E4\uB978 AI \uBAA8\uB378\uB3C4 \uC120\uD0DD \uAC00\uB2A5\uD558\uB3C4\uB85D", "2~3\uC77C"],
              ["13", "\uD654\uBA74 \uACF5\uC720 \uAE30\uB2A5", "WebRTC DataChannel \uD65C\uC6A9 \uD654\uBA74 \uACF5\uC720", "3~5\uC77C"],
              ["14", "\uD14C\uC2A4\uD2B8 \uCF54\uB4DC \uC791\uC131", "Jest + React Testing Library \uB2E8\uC704/\uD1B5\uD569 \uD14C\uC2A4\uD2B8", "5~7\uC77C"],
            ]).map(([n, item, desc, est]) =>
              new TableRow({ children: [cell(n, 500, { center: true, shade: GRAY_BG }), cell(item, 2000, { bold: true }), cell(desc, 5360), cell(est, 1500, { center: true })] })
            ),
          ],
        }),

        // ── 6. 알려진 이슈 및 참고사항 ──
        new Paragraph({ spacing: { before: 360 } }),
        heading1("6. \uC54C\uB824\uC9C4 \uC774\uC288 \uBC0F \uCC38\uACE0\uC0AC\uD56D"),
        bullet("Gemini API \uD0A4\uAC00 \uC5C6\uC73C\uBA74 Mock \uB370\uC774\uD130\uB85C \uB3D9\uC791\uD569\uB2C8\uB2E4 (\uBAA8\uB4E0 \uAE30\uB2A5 \uC2DC\uC5F0 \uAC00\uB2A5)", "bullets3"),
        bullet("Spring Boot \uBC31\uC5D4\uB4DC\uAC00 \uC2E4\uD589\uB418\uC9C0 \uC54A\uC73C\uBA74 \u201C\uB85C\uCEEC \uBAA8\uB4DC\u201D\uB85C \uD45C\uC2DC\uB418\uBA70, 1\uC778 \uC0C1\uB2F4\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4", "bullets3"),
        bullet("WebRTC P2P \uC5F0\uACB0\uC740 \uAC19\uC740 \uB124\uD2B8\uC6CC\uD06C \uB0B4\uC5D0\uC11C \uD14C\uC2A4\uD2B8 \uAD8C\uC7A5 (TURN \uC11C\uBC84 \uBBF8\uAD6C\uCD95)", "bullets3"),
        bullet("Web Speech API(STT)\uB294 Chrome \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C\uB9CC \uC815\uC0C1 \uB3D9\uC791\uD569\uB2C8\uB2E4", "bullets3"),
        bullet("\uC0C1\uB2F4 \uAE30\uB85D\uC740 \uBE0C\uB77C\uC6B0\uC800 localStorage\uC5D0 \uC800\uC7A5\uB418\uBBC0\uB85C, \uC2DC\uD06C\uB9BF \uBAA8\uB4DC\uB098 \uCE90\uC2DC \uC0AD\uC81C \uC2DC \uC18C\uC2E4\uB429\uB2C8\uB2E4", "bullets3"),
        bullet("\uBCF4\uACE0\uC11C \uB2E4\uC6B4\uB85C\uB4DC\uB294 \uBE0C\uB77C\uC6B0\uC800 \uC778\uC1C4 \uAE30\uB2A5(Ctrl+P)\uC744 \uD65C\uC6A9\uD558\uBA70, \u201CPDF\uB85C \uC800\uC7A5\u201D \uC120\uD0DD \uC2DC PDF \uD30C\uC77C\uB85C \uC800\uC7A5\uB429\uB2C8\uB2E4", "bullets3"),
      ],
    },
  ],
});

const path = require("path");
const OUTPUT = path.join(__dirname, "[팀 공유] AI 보험 화상 상담 플랫폼 - 프로젝트 현황.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUTPUT, buf);
  console.log("Created:", OUTPUT);
});
