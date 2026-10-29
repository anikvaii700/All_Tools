import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

export async function exportToDocx(
  title: string,
  content: string,
  filename = 'Application.docx'
): Promise<void> {
  const lines = content.split('\n');

  const paragraphs: Paragraph[] = lines.map((line) => {
    const trimmed = line.trim();
    const isSubject =
      trimmed.startsWith('বিষয়:') ||
      trimmed.startsWith('বিষয়:') ||
      trimmed.startsWith('Subject:') ||
      trimmed.startsWith('SUBJECT:');
    const isSign =
      trimmed.startsWith('বিনীত নিবেদক') ||
      trimmed.startsWith('বিনীত,') ||
      trimmed.startsWith('Yours sincerely') ||
      trimmed.startsWith('Yours faithfully');

    return new Paragraph({
      spacing: {
        after: trimmed === '' ? 160 : 70,
        line: 300, // ~1.25 line height
      },
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: line || ' ',
          bold: isSubject || isSign,
          font: 'Segoe UI',
          size: 24, // 12pt
        }),
      ],
    });
  });

  const doc = new Document({
    title: title || 'MoSaFa Application',
    description: 'Generated with The MoSaFa Application Writer',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
