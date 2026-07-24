import { ExamPaper } from '../types/exam';

export function generateTypstCode(paper: ExamPaper): string {
  const { school, groups } = paper;

  const headerText = `
// Typst Document Template for Nepalese Secondary Examination Papers
// Created with Nepal School Exam Creator

#set page(
  paper: "a4",
  margin: (x: 1.5cm, top: 1.5cm, bottom: 1.5cm),
  header: align(right, text(8pt, fill: rgb("#71717a"))[${school.examTitle}]),
  footer: [
    #line(length: 100%, stroke: 0.5pt + rgb("#e4e4e7"))
    #align(center)[
      #text(8pt, fill: rgb("#71717a"))[Page #counter(page).display() of #counter(page).final().at(loc => loc.page)]
    ]
  ]
)

#set text(
  font: ("Playfair Display", "Noto Serif Devanagari", "Linux Libertine", "Times New Roman"),
  size: 10pt,
  lang: "en"
)

#set par(justify: true, leading: 0.65em)

// School Header
#align(center)[
  #text(16pt, weight: "bold")[${escapeTypst(school.name.toUpperCase())}] \\
  #v(-2pt)
  #text(10pt, style: "italic")[${escapeTypst(school.address)} ${school.estd ? `| ESTD. ${escapeTypst(school.estd)}` : ''}] \\
  #v(4pt)
  #text(12pt, weight: "bold")[#underline[${escapeTypst(school.examTitle)}]]
]

#v(8pt)

// Meta Information Bar
#table(
  columns: (1fr, 1fr),
  stroke: none,
  inset: (x: 0pt, y: 3pt),
  [*Subject:* ${escapeTypst(school.subject === 'Custom' ? (school.customSubject || 'General') : school.subject)}],
  [#align(right)[*Class / Level:* ${escapeTypst(school.grade)}]],
  [*Time:* ${escapeTypst(school.time)}],
  [#align(right)[*Full Marks:* ${school.fullMarks} | *Pass Marks:* ${school.passMarks}]]
)

#v(-4pt)
#line(length: 100%, stroke: 1.5pt + rgb("#18181b"))
#v(-2pt)
#line(length: 100%, stroke: 0.5pt + rgb("#18181b"))
#v(6pt)

${school.instructions ? `#block(
  fill: rgb("#f4f4f5"),
  inset: 8pt,
  radius: 2pt,
  width: 100%,
  text(8.5pt, style: "italic")[*Instructions:* ${escapeTypst(school.instructions)}]
)\n#v(8pt)` : ''}

// Questions Section
`;

  let bodyText = '';
  let questionCounter = 1;

  groups.forEach((group) => {
    bodyText += `\n// ${group.name}\n`;
    bodyText += `#v(10pt)\n`;
    bodyText += `#block(width: 100%, inset: (bottom: 4pt), stroke: (bottom: 0.8pt + rgb("#27272a")))[
  #text(11pt, weight: "bold", style: "italic")[${escapeTypst(group.name)} -- ${escapeTypst(group.description)}]
]\n#v(6pt)\n\n`;

    group.questions.forEach((q) => {
      bodyText += `#grid(\n  columns: (22pt, 1fr, 35pt),\n  column-gutter: 4pt,\n  align: (top + left, top + left, top + right),\n`;
      bodyText += `  [*${questionCounter}.*],\n`;

      // Question body content
      let content = `[${escapeTypst(q.text)}`;

      if (q.subQuestions && q.subQuestions.length > 0) {
        content += `\n    #enum(\n      indent: 4pt,\n      tight: true,\n` +
          q.subQuestions.map((sq) => `      [${escapeTypst(sq)}]`).join(',\n') +
          `\n    )`;
      }

      if (q.orQuestion) {
        content += `\n    #v(3pt)\n    #align(center)[*-- OR --*]\n    #v(3pt)\n    ${escapeTypst(q.orQuestion)}`;
      }

      if (q.hasDiagramBox) {
        content += `\n    #v(4pt)\n    #rect(width: 100%, stroke: 0.5pt + rgb("#a1a1aa"), inset: 12pt, radius: 2pt)[\n      #align(center)[#text(8pt, fill: rgb("#71717a"), style: "italic")[Diagram / Figure Box: ${escapeTypst(q.diagramTitle || 'Space for Diagram')}]]\n    ]`;
      }

      content += `]`;

      bodyText += `  ${content},\n`;
      bodyText += `  [#align(right)[*[${q.marks}]*]]\n)\n#v(6pt)\n\n`;

      questionCounter++;
    });
  });

  if (school.showSignatures) {
    bodyText += `\n#v(30pt)\n#grid(
  columns: (1fr, 1fr),
  align: (left, right),
  [
    #line(length: 130pt, stroke: 0.8pt + rgb("#27272a"))
    #text(9pt, weight: "bold")[${escapeTypst(school.teacherSignatureLabel || 'Subject Teacher Signature')}]
  ],
  [
    #line(length: 130pt, stroke: 0.8pt + rgb("#27272a"))
    #text(9pt, weight: "bold")[${escapeTypst(school.headmasterSignatureLabel || 'Headmaster / Exam Dept.')}]
  ]
)\n`;
  }

  return headerText + bodyText;
}

function escapeTypst(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\#/g, '\\#')
    .replace(/\$/g, '\\$')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\*/g, '\\*')
    .replace(/\_/g, '\\_');
}
