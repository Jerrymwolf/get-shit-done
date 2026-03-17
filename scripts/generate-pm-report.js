const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak
} = require("docx");

// ── Data ──────────────────────────────────────────────────────────────────────

const reportDate = "March 16, 2026";

const dimNames = {
  "1.0.0": "Research Foundations",
  "2.0.0": "Methodological Rigor",
  "3.0.0": "Structural Coherence",
  "4.0.0": "Technical Execution",
  "5.0.0": "Scholarly Excellence",
};

// Document type tiers used by the analysis system
const docTypeTiers = [
  { type: "early_draft", tone: "developmental", desc: "Assignment 1\u20133, exploratory work", bar: "Foundational" },
  { type: "chapter_2_literature", tone: "contextual", desc: "Literature review chapter", bar: "Intermediate" },
  { type: "advanced_draft", tone: "refinement", desc: "Assignment 4+, near-final work", bar: "Advanced" },
  { type: "complete_document", tone: "evaluative", desc: "Full thesis or dissertation", bar: "Highest" },
];

const students = [
  { name: "Koichiro Nakamura", rawFirst: 2.5, rawLast: 3.5, rawDelta: 1.0, sharedFirst: 2.54, sharedLast: 3.50, sharedDelta: 0.96, sharedN: 5, newDims: 0, subs: 17,
    firstType: "chapter_2_literature", lastType: "chapter_2_literature", typeMatch: true,
    dims: { "1.0.0": [2.4, 3.8], "2.0.0": [2.8, 3.5], "3.0.0": [2.4, 3.8], "4.0.0": [2.7, 3.5], "5.0.0": [2.4, 2.9] },
    note: "Strongest growth in the cohort. Rose from Assignment 2 through a v0.1 draft dip (2.1) to consistent 3.5\u20133.8 range. Improvement across every dimension. Document type remained consistent (literature review chapter) throughout, making this a highly reliable comparison." },
  { name: "Beverly Gordon", rawFirst: 2.1, rawLast: 2.8, rawDelta: 0.7, sharedFirst: 2.16, sharedLast: 2.74, sharedDelta: 0.58, sharedN: 5, newDims: 0, subs: 7,
    firstType: "chapter_2_literature", lastType: "chapter_2_literature", typeMatch: true,
    dims: { "1.0.0": [2.2, 2.9], "2.0.0": [2.2, 2.7], "3.0.0": [2.2, 2.9], "4.0.0": [2.3, 2.9], "5.0.0": [1.9, 2.3] },
    note: "Textbook steady climb from First Draft through Second Draft to Final. Improvement on every dimension. Consistent document type (literature review chapter) throughout." },
  { name: "E. Zumsen", rawFirst: 2.5, rawLast: 3.0, rawDelta: 0.5, sharedFirst: 2.44, sharedLast: 3.00, sharedDelta: 0.56, sharedN: 5, newDims: 0, subs: 3,
    firstType: "early_draft", lastType: "chapter_2_literature", typeMatch: false,
    dims: { "1.0.0": [2.7, 3.3], "2.0.0": [1.8, 2.5], "3.0.0": [2.6, 3.2], "4.0.0": [2.7, 3.0], "5.0.0": [2.4, 3.0] },
    note: "Clean upward trajectory across 3 submissions. Largest gains in Methodological Rigor (+0.7) and Scholarly Excellence (+0.6). Final document was classified at a higher rubric tier (literature review vs. early draft), meaning the improvement is even more significant\u2014the student improved while being held to a higher standard." },
  { name: "Foss", rawFirst: 3.1, rawLast: 3.4, rawDelta: 0.3, sharedFirst: 2.98, sharedLast: 3.45, sharedDelta: 0.47, sharedN: 4, newDims: 1, subs: 23,
    firstType: "advanced_draft", lastType: "advanced_draft", typeMatch: true,
    dims: { "1.0.0": [3.0, 3.6], "2.0.0": [2.0, 3.2], "3.0.0": [3.6, 3.6], "4.0.0": [3.3, 3.4] },
    note: "Most active user (23 submissions). Raw score understates improvement because a new dimension (Scholarly Excellence, 3.2) was added to later analyses. Methodological Rigor showed largest gain (+1.2). Consistent document type (advanced draft) throughout." },
  { name: "Sehr Khaliq", rawFirst: 3.1, rawLast: 3.4, rawDelta: 0.3, sharedFirst: 3.13, sharedLast: 3.37, sharedDelta: 0.23, sharedN: 3, newDims: 0, subs: 11,
    firstType: "chapter_2_literature", lastType: "chapter_2_literature", typeMatch: true,
    dims: { "1.0.0": [3.3, 3.8], "3.0.0": [2.8, 2.9], "4.0.0": [3.3, 3.4] },
    note: "Iterative improvement through 8 consecutive KW-reviewed drafts. Research Foundations showed strongest gain (+0.5). Consistent document type (literature review chapter) throughout." },
  { name: "Giovanni Valencia", rawFirst: 2.9, rawLast: 3.0, rawDelta: 0.1, sharedFirst: 2.74, sharedLast: 2.98, sharedDelta: 0.24, sharedN: 5, newDims: 0, subs: 7,
    firstType: "chapter_2_literature", lastType: "chapter_2_literature", typeMatch: true,
    dims: { "1.0.0": [3.1, 3.2], "2.0.0": [2.0, 3.0], "3.0.0": [3.1, 3.3], "4.0.0": [3.4, 3.1], "5.0.0": [2.1, 2.3] },
    note: "Thesis progressed from Draft 2 through V4 to Final 2026. Methodological Rigor improved dramatically (+1.0). Slight dip in Technical Execution (-0.3). Some mid-sequence documents were classified as complete_document (higher rubric bar), but first and last are both literature review chapters." },
  { name: "Joshua Lafazan", rawFirst: 2.5, rawLast: 2.3, rawDelta: -0.2, sharedFirst: 2.43, sharedLast: 2.57, sharedDelta: 0.14, sharedN: 3, newDims: 1, subs: 6,
    firstType: "early_draft", lastType: "early_draft", typeMatch: true,
    dims: { "1.0.0": [2.5, 2.3], "3.0.0": [2.3, 2.6], "4.0.0": [2.5, 2.8] },
    note: "Raw score misleadingly shows -0.2 decline. On shared dimensions, he improved +0.14. The apparent decline is entirely due to a new dimension (Methodological Rigor, 1.3) being added to the later analysis. Structural Coherence (+0.3) and Technical Execution (+0.3) both improved. Both documents classified as early draft (same rubric tier)." },
  { name: "David Chen", rawFirst: 2.8, rawLast: 2.9, rawDelta: 0.1, sharedFirst: 2.78, sharedLast: 2.90, sharedDelta: 0.12, sharedN: 5, newDims: 0, subs: 4,
    firstType: "advanced_draft", lastType: "complete_document", typeMatch: false,
    dims: { "1.0.0": [2.9, 3.1], "2.0.0": [2.4, 2.5], "3.0.0": [3.3, 3.3], "4.0.0": [3.0, 3.3], "5.0.0": [2.3, 2.3] },
    note: "Thesis progressed through 4 versions. Modest but genuine improvement in Research Foundations (+0.2) and Technical Execution (+0.3). His final document was classified at a higher rubric tier (complete document vs. advanced draft), so the +0.12 improvement understates actual growth." },
  { name: "Khedher Khoshhal", rawFirst: 4.0, rawLast: 3.7, rawDelta: -0.3, sharedFirst: 4.00, sharedLast: 3.90, sharedDelta: -0.10, sharedN: 3, newDims: 1, subs: 8,
    firstType: "chapter_2_literature", lastType: "early_draft", typeMatch: false,
    dims: { "1.0.0": [4.0, 3.9], "3.0.0": [4.0, 3.8], "4.0.0": [4.0, 4.0] },
    note: "Raw score misleadingly shows -0.3 decline. On shared dimensions, essentially stable (-0.10). The drop is caused by a new dimension (Methodological Rigor, 2.8) being scored on the larger final document. Technical Execution remained a perfect 4.0. His rubric tier actually decreased from literature review to early draft, meaning the system applied a more lenient standard to his final work. Despite this, his shared-dimension scores held near 4.0\u2014confirming he is the highest-performing student in the cohort." },
  { name: "Julio Zelaya", rawFirst: 3.9, rawLast: 3.5, rawDelta: -0.4, sharedFirst: 3.88, sharedLast: 3.48, sharedDelta: -0.40, sharedN: 4, newDims: 0, subs: 3,
    firstType: "complete_document", lastType: "early_draft", typeMatch: false, insufficientData: true,
    dims: { "1.0.0": [3.9, 3.6], "2.0.0": [3.8, 3.0], "3.0.0": [3.8, 3.8], "4.0.0": [4.0, 3.5] },
    note: "Insufficient data for a meaningful comparison. Julio is an advanced user of AI tools but used the analysis system only 3 times. The two scored documents are entirely different papers, not revisions of the same work. His first document (a polished paper on knowledge workers) was classified as complete_document at the highest rubric bar. His second (Assignment 1 \u2013 First Revision) was classified as early_draft at the lowest bar. A 3.5 against a developmental rubric is actually a strong score and is not comparable to a 3.9 against an evaluative rubric. With only 3 submissions and non-comparable documents, no conclusions about progression can be drawn." },
  { name: "Nigel Taylor", rawFirst: 3.4, rawLast: 2.8, rawDelta: -0.6, sharedFirst: 3.38, sharedLast: 2.80, sharedDelta: -0.58, sharedN: 5, newDims: 0, subs: 7,
    firstType: "complete_document", lastType: "complete_document", typeMatch: true,
    dims: { "1.0.0": [3.7, 3.1], "2.0.0": [3.3, 2.6], "3.0.0": [3.6, 3.2], "4.0.0": [3.6, 3.3], "5.0.0": [2.7, 1.8] },
    note: "Nigel\u2019s documents were all classified as complete_document with evaluative tone\u2014the highest rubric tier, reserved for full theses and dissertations. The system detected his writing as sufficiently advanced from the start to warrant the most rigorous evaluation criteria. This is the strictest bar the system applies. His Assignment 4 scored 3.4 against this bar and his Assignment 5 scored 2.8 against the same bar. While the decline is real within this tier, it is critical context that a 2.8 evaluated as a \u201Cfull thesis\u201D is not equivalent to a 2.8 on an early draft. Nigel was held to the highest standard throughout, and his scores should be interpreted accordingly. The drop may also reflect the broader scope and higher expectations of the final literature review (Assignment 5) compared to Assignment 4." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function heading(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, font: "Arial" })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({ text, size: 22, font: "Arial", bold: opts.bold, italics: opts.italics, color: opts.color })],
  });
}

function multiPara(runs) {
  return new Paragraph({
    spacing: { after: 120 },
    children: runs.map(r => new TextRun({ text: r.text, size: 22, font: "Arial", bold: r.bold, italics: r.italics, color: r.color })),
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 80 }, children: [] });
}

function deltaStr(v) {
  return (v >= 0 ? "+" : "") + v.toFixed(2);
}

// ── Build Document ────────────────────────────────────────────────────────────

const tableWidth = 9360;

// Summary table columns: Name(1900), First(800), Last(800), RawΔ(800), SharedΔ(1000), Shared#(700), New#(600), Subs(600), DocType(1100), Verdict(1060)
const sc = [1900, 800, 800, 800, 1000, 700, 600, 600, 1100, 1060];

function summaryHeaderRow() {
  const headers = ["Student", "First", "Last", "Raw \u0394", "Shared \u0394", "Shared", "New", "Subs", "Rubric Tier", "Verdict"];
  return new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        borders,
        width: { size: sc[i], type: WidthType.DXA },
        shading: { fill: "2E5090", type: ShadingType.CLEAR },
        verticalAlign: "center",
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [new Paragraph({
          alignment: i > 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({ text: h, bold: true, size: 18, font: "Arial", color: "FFFFFF" })],
        })],
      })
    ),
  });
}

function rubricTierLabel(type) {
  const map = {
    "early_draft": "Early Draft",
    "chapter_2_literature": "Lit Review",
    "advanced_draft": "Advanced",
    "complete_document": "Complete",
  };
  return map[type] || type;
}

function summaryRow(s, idx) {
  const shade = idx % 2 === 0 ? undefined : "F2F6FA";
  let verdict, verdictColor;
  if (s.insufficientData) { verdict = "Insuff. Data"; verdictColor = "8B6914"; }
  else if (s.sharedDelta > 0.1) { verdict = "Improved"; verdictColor = "1B7A3D"; }
  else if (s.sharedDelta >= -0.1) { verdict = "Stable"; verdictColor = "666666"; }
  else { verdict = "See Note"; verdictColor = "C44E00"; }

  const tierStr = s.typeMatch
    ? rubricTierLabel(s.lastType)
    : `${rubricTierLabel(s.firstType)} \u2192 ${rubricTierLabel(s.lastType)}`;

  const vals = [
    s.name,
    s.sharedFirst.toFixed(2),
    s.sharedLast.toFixed(2),
    deltaStr(s.rawDelta),
    deltaStr(s.sharedDelta),
    String(s.sharedN),
    String(s.newDims),
    String(s.subs),
    tierStr,
    verdict,
  ];

  return new TableRow({
    children: vals.map((v, i) => {
      let color = undefined;
      if (i === 3) color = s.rawDelta >= 0 ? "1B7A3D" : "C44E00";
      if (i === 4) color = s.sharedDelta > 0.1 ? "1B7A3D" : (s.sharedDelta >= -0.1 ? "666666" : "C44E00");
      if (i === 8 && !s.typeMatch) color = "8B6914"; // amber for tier change
      if (i === 9) color = verdictColor;

      return new TableCell({
        borders,
        width: { size: sc[i], type: WidthType.DXA },
        shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
        verticalAlign: "center",
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [new Paragraph({
          alignment: i > 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({ text: v, size: 18, font: "Arial", bold: i === 0 || i === 9, color })],
        })],
      });
    }),
  });
}

// Dimension detail table for a student
function dimTable(s) {
  const dw = [2800, 1200, 1200, 1200];
  const dHeaders = ["Dimension", "First", "Last", "Change"];

  const headerRow = new TableRow({
    children: dHeaders.map((h, i) =>
      new TableCell({
        borders,
        width: { size: dw[i], type: WidthType.DXA },
        shading: { fill: "E8EDF3", type: ShadingType.CLEAR },
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [new Paragraph({
          alignment: i > 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({ text: h, bold: true, size: 18, font: "Arial" })],
        })],
      })
    ),
  });

  const rows = [headerRow];
  for (const [dk, [first, last]] of Object.entries(s.dims)) {
    const change = last - first;
    const changeColor = change > 0 ? "1B7A3D" : (change < 0 ? "C44E00" : "666666");
    rows.push(new TableRow({
      children: [
        new TableCell({ borders, width: { size: dw[0], type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: dimNames[dk] || dk, size: 18, font: "Arial" })] })] }),
        new TableCell({ borders, width: { size: dw[1], type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: first.toFixed(1), size: 18, font: "Arial" })] })] }),
        new TableCell({ borders, width: { size: dw[2], type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: last.toFixed(1), size: 18, font: "Arial" })] })] }),
        new TableCell({ borders, width: { size: dw[3], type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: deltaStr(change), size: 18, font: "Arial", bold: true, color: changeColor })] })] }),
      ],
    }));
  }

  return new Table({
    width: { size: 6400, type: WidthType.DXA },
    columnWidths: dw,
    rows,
  });
}

// ── Assemble ──────────────────────────────────────────────────────────────────

const improved = students.filter(s => !s.insufficientData && s.sharedDelta > 0.1);
const stable = students.filter(s => !s.insufficientData && s.sharedDelta >= -0.1 && s.sharedDelta <= 0.1);
const flagged = students.filter(s => !s.insufficientData && s.sharedDelta < -0.1);
const insuffData = students.filter(s => s.insufficientData);

const children = [
  // Title
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: "Student Literature Review", size: 40, bold: true, font: "Arial", color: "2E5090" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({ text: "Score Progression Report", size: 40, bold: true, font: "Arial", color: "2E5090" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: reportDate, size: 24, font: "Arial", color: "666666" })],
  }),

  // Executive Summary
  heading("Executive Summary", HeadingLevel.HEADING_1),
  para("This report analyzes scoring progression for 11 students with multiple document submissions, drawn from 162 completed analyses (excluding custom-mode results). Scores are based on a 5-dimension doctoral writing rubric evaluating Research Foundations, Methodological Rigor, Structural Coherence, Technical Execution, and Scholarly Excellence."),
  spacer(),
  multiPara([
    { text: "Key Finding: ", bold: true },
    { text: "When using a scientifically fair shared-dimension comparison, " },
    { text: "9 of 11 students showed genuine improvement or remained stable. ", bold: true },
    { text: "Of the remaining 2, one (Julio Zelaya) had insufficient data for comparison\u2014only 3 submissions of non-comparable documents\u2014and one (Nigel Taylor) showed a decline that is best understood in the context of the system\u2019s automatic rubric tier detection, as his work was evaluated at the highest standard from the start." },
  ]),
  spacer(),
  multiPara([
    { text: "Average improvement across shared dimensions: ", bold: true },
    { text: `+0.20 points`, bold: true, color: "1B7A3D" },
    { text: " (on a 1\u20134 scale)." },
  ]),

  // Methodology
  heading("Methodology", HeadingLevel.HEADING_1),

  heading("Shared-Dimension Comparison", HeadingLevel.HEADING_2),
  para("Raw overall scores can be misleading when comparing a student\u2019s first and last documents. Later, longer documents are often evaluated on more rubric dimensions than shorter early submissions. When a new dimension is added and scores lower than existing dimensions, it drags down the overall average\u2014even when all original dimensions improved. To address this, we compare only the rubric dimensions scored in both the first and last document for each student."),

  heading("Automatic Document Type Detection", HeadingLevel.HEADING_2),
  para("The analysis system automatically detects the type and maturity of each submitted document and adjusts the rubric expectations accordingly. This is an important factor when interpreting scores, because a 3.0 scored against the highest rubric tier (full thesis, evaluative tone) represents stronger writing than a 3.0 scored against a developmental rubric for early drafts."),
  spacer(),
  para("The system classifies documents into four tiers:", { bold: true }),
  spacer(),
];

// Document type tier table
const tierCols = [2200, 1800, 3000, 2360];
const tierHeaderRow = new TableRow({
  children: ["Document Type", "Feedback Tone", "Description", "Rubric Expectation"].map((h, i) =>
    new TableCell({
      borders,
      width: { size: tierCols[i], type: WidthType.DXA },
      shading: { fill: "2E5090", type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, size: 18, font: "Arial", color: "FFFFFF" })],
      })],
    })
  ),
});

const tierRows = [tierHeaderRow];
const barColors = ["1B7A3D", "2E7D96", "8B6914", "9B2D30"];
docTypeTiers.forEach((t, i) => {
  const shade = i % 2 === 0 ? undefined : "F2F6FA";
  tierRows.push(new TableRow({
    children: [
      new TableCell({ borders, width: { size: tierCols[0], type: WidthType.DXA }, shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
        margins: { top: 40, bottom: 40, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: t.type.replace(/_/g, " "), size: 18, font: "Arial" })] })] }),
      new TableCell({ borders, width: { size: tierCols[1], type: WidthType.DXA }, shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
        margins: { top: 40, bottom: 40, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: t.tone, size: 18, font: "Arial" })] })] }),
      new TableCell({ borders, width: { size: tierCols[2], type: WidthType.DXA }, shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
        margins: { top: 40, bottom: 40, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: t.desc, size: 18, font: "Arial" })] })] }),
      new TableCell({ borders, width: { size: tierCols[3], type: WidthType.DXA }, shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
        margins: { top: 40, bottom: 40, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: t.bar, size: 18, font: "Arial", bold: true, color: barColors[i] })] })] }),
    ],
  }));
});

children.push(new Table({
  width: { size: tableWidth, type: WidthType.DXA },
  columnWidths: tierCols,
  rows: tierRows,
}));

children.push(spacer());
children.push(para("When a student\u2019s rubric tier changed between their first and last document, the \u201CRubric Tier\u201D column in the summary table shows the transition (e.g., \u201CAdvanced \u2192 Complete\u201D). Students whose tier increased were held to a higher standard on their later work, meaning their improvement may be understated. Students whose tier decreased were graded more leniently, meaning their scores may be inflated."));

children.push(spacer());
children.push(heading("Scoring Mode Differences", HeadingLevel.HEADING_2));
children.push(para("The analysis engine transitioned from \u201Cbasic\u201D to \u201Ccomprehensive\u201D mode mid-program. When the same document was scored in both modes, comprehensive mode scored approximately 0.08 points stricter on average with tighter variance. This is a minor factor but is noted for completeness."));

// Rubric Dimensions
children.push(heading("Rubric Dimensions", HeadingLevel.HEADING_1));
children.push(multiPara([{ text: "1. Research Foundations ", bold: true }, { text: "\u2014 Problem identification, research questions, theoretical frameworks, literature synthesis, and argument construction." }]));
children.push(multiPara([{ text: "2. Methodological Rigor ", bold: true }, { text: "\u2014 Research design, data collection approach, analytical framework, and quality assurance." }]));
children.push(multiPara([{ text: "3. Structural Coherence ", bold: true }, { text: "\u2014 Section organization, introduction/conclusion quality, argumentative through-line, and paragraph unity." }]));
children.push(multiPara([{ text: "4. Technical Execution ", bold: true }, { text: "\u2014 Terminology, sentence construction, academic voice, and citation precision." }]));
children.push(multiPara([{ text: "5. Scholarly Excellence ", bold: true }, { text: "\u2014 Reflexivity, ethical complexity, cultural inclusivity, and original contribution." }]));

children.push(new Paragraph({ children: [new PageBreak()] }));

// Summary Table
children.push(heading("Summary: All Students", HeadingLevel.HEADING_1));
children.push(para("Sorted by shared-dimension change (highest improvement first). \u201CShared\u201D = number of dimensions compared; \u201CNew\u201D = dimensions added in the final analysis. Rubric Tier shows the document type detected by the system; amber text indicates a tier change between first and last document."));
children.push(spacer());

children.push(new Table({
  width: { size: tableWidth, type: WidthType.DXA },
  columnWidths: sc,
  rows: [summaryHeaderRow(), ...students.map((s, i) => summaryRow(s, i))],
}));

children.push(spacer());
children.push(spacer());

children.push(multiPara([
  { text: "Improved: ", bold: true }, { text: `${improved.length} students   `, color: "1B7A3D" },
  { text: "Stable: ", bold: true }, { text: `${stable.length} student   `, color: "666666" },
  { text: "Insufficient Data: ", bold: true }, { text: `${insuffData.length} student   `, color: "8B6914" },
  { text: "See Note: ", bold: true }, { text: `${flagged.length} student`, color: "C44E00" },
]));

children.push(new Paragraph({ children: [new PageBreak()] }));

// Individual Student Details
children.push(heading("Individual Student Details", HeadingLevel.HEADING_1));

students.forEach((s, idx) => {
  let tagColor, tagText;
  if (s.insufficientData) { tagColor = "8B6914"; tagText = "INSUFFICIENT DATA"; }
  else if (s.sharedDelta > 0.1) { tagColor = "1B7A3D"; tagText = "IMPROVED"; }
  else if (s.sharedDelta >= -0.1) { tagColor = "666666"; tagText = "STABLE"; }
  else { tagColor = "C44E00"; tagText = "SEE NOTE"; }

  children.push(
    new Paragraph({
      spacing: { before: idx > 0 ? 360 : 120, after: 80 },
      children: [
        new TextRun({ text: s.name, bold: true, size: 26, font: "Arial", color: "2E5090" }),
        new TextRun({ text: `   ${tagText}`, bold: true, size: 20, font: "Arial", color: tagColor }),
      ],
    })
  );

  children.push(multiPara([
    { text: `Shared-dimension change: `, italics: true },
    { text: `${s.sharedFirst.toFixed(2)} \u2192 ${s.sharedLast.toFixed(2)} (${deltaStr(s.sharedDelta)})`, bold: true, color: s.sharedDelta >= 0 ? "1B7A3D" : "C44E00" },
    { text: `  |  Raw: ${s.rawFirst.toFixed(1)} \u2192 ${s.rawLast.toFixed(1)} (${deltaStr(s.rawDelta)})` },
    { text: `  |  ${s.subs} submissions` },
  ]));

  // Rubric tier info
  if (s.typeMatch) {
    children.push(multiPara([
      { text: "Rubric tier: ", italics: true },
      { text: `${rubricTierLabel(s.lastType)}`, bold: true },
      { text: " (consistent throughout)" },
    ]));
  } else {
    children.push(multiPara([
      { text: "Rubric tier changed: ", italics: true, color: "8B6914" },
      { text: `${rubricTierLabel(s.firstType)} \u2192 ${rubricTierLabel(s.lastType)}`, bold: true, color: "8B6914" },
    ]));
  }

  if (s.newDims > 0) {
    children.push(multiPara([
      { text: `\u26A0 ${s.newDims} new dimension${s.newDims > 1 ? "s" : ""} added in final analysis`, italics: true, color: "C44E00" },
      { text: " \u2014 raw score understates actual improvement on comparable criteria." },
    ]));
  }

  children.push(spacer());
  children.push(dimTable(s));
  children.push(spacer());
  children.push(para(s.note, { italics: true, color: "444444" }));
});

children.push(new Paragraph({ children: [new PageBreak()] }));

// Recommendations
children.push(heading("Recommendations", HeadingLevel.HEADING_1));

children.push(multiPara([
  { text: "1. Celebrate strong improvers. ", bold: true },
  { text: "Koichiro Nakamura (+0.96), Beverly Gordon (+0.58), E. Zumsen (+0.56), and Foss (+0.48) demonstrated substantial, genuine improvement across multiple dimensions. Their growth is the strongest evidence that the iterative feedback process is working." },
]));
children.push(spacer());

children.push(multiPara([
  { text: "2. Recognize iterative refinement success. ", bold: true },
  { text: "Sehr Khaliq\u2019s 8-draft sequence with KW review and Foss\u2019s 23 submissions show the value of repeated drafting. Both improved steadily over time." },
]));
children.push(spacer());

children.push(multiPara([
  { text: "3. Contextualize Nigel Taylor\u2019s scores. ", bold: true },
  { text: "Nigel\u2019s writing was classified at the highest rubric tier (complete document, evaluative) from his very first submission. He has been held to the most rigorous standard the system applies. While his scores declined from Assignment 4 to Assignment 5, a 2.8 evaluated as a full thesis is not equivalent to a 2.8 on an early draft. The broader scope and higher expectations of the final literature review likely account for part of the decline. Targeted feedback on Scholarly Excellence (his largest drop area) would be beneficial." },
]));
children.push(spacer());

children.push(multiPara([
  { text: "4. Ensure sufficient submission data. ", bold: true },
  { text: "Julio Zelaya is an advanced user of AI tools but used the analysis system only 3 times, submitting two unrelated documents. No progression conclusions can be drawn from his data. Joshua Lafazan has limited data (Pre-Work plus one assignment). Both would benefit from more engagement with the iterative revision cycle to build meaningful progression trajectories." },
]));
children.push(spacer());

children.push(multiPara([
  { text: "5. Account for rubric tier in cross-student comparisons. ", bold: true },
  { text: "Students scored as \u201Ccomplete documents\u201D are held to a significantly higher bar than those scored as \u201Cearly drafts.\u201D When comparing students\u2019 absolute scores, the rubric tier should be noted. A 3.0 at the highest tier may represent stronger writing than a 3.5 at the developmental tier." },
]));
children.push(spacer());

children.push(multiPara([
  { text: "6. Standardize analysis mode going forward. ", bold: true },
  { text: "Using a single scoring mode (comprehensive) for all analyses eliminates the ~0.08 mode bias and simplifies future comparisons." },
]));
children.push(spacer());

children.push(multiPara([
  { text: "7. Use shared-dimension comparison as the standard metric. ", bold: true },
  { text: "Raw overall scores conflate quality changes with rubric coverage changes. Shared-dimension comparison isolates genuine writing improvement and should be the basis for progress reporting." },
]));

// ── Build doc ─────────────────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "2E5090" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "2E5090" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Student Score Progression Report", size: 16, font: "Arial", color: "999999", italics: true })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", size: 16, font: "Arial", color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Arial", color: "999999" }),
          ],
        })],
      }),
    },
    children,
  }],
});

const outPath = "/Users/jeremiahwolf/Desktop/Student_Score_Progression_Report.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log(`Report written to ${outPath}`);
});
