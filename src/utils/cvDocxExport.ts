import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { CVData } from '../types/cvMaker';

async function imageUrlToUint8Array(url: string): Promise<{ bytes: Uint8Array; type: 'png' | 'jpg' } | null> {
  if (!url) return null;
  try {
    if (url.startsWith('data:image/')) {
      const mimeMatch = url.match(/^data:image\/(png|jpeg|jpg|webp)/i);
      const ext = mimeMatch?.[1]?.toLowerCase() === 'png' ? 'png' : 'jpg';
      const base64 = url.split(',')[1];
      if (!base64) return null;
      const binStr = atob(base64);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) {
        bytes[i] = binStr.charCodeAt(i);
      }
      return { bytes, type: ext };
    }
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    const buf = await blob.arrayBuffer();
    const type = blob.type.includes('png') ? 'png' : 'jpg';
    return { bytes: new Uint8Array(buf), type };
  } catch {
    return null;
  }
}

function sectionHeader(title: string, accentHex = '1E3A8A'): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    border: {
      bottom: {
        color: accentHex,
        space: 3,
        style: BorderStyle.SINGLE,
        size: 8,
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22,
        color: accentHex,
      }),
    ],
  });
}

export async function exportCvToDocx(
  data: CVData,
  language: 'en' | 'bn' = 'en',
  accentColorHex = '#1e3a8a'
): Promise<void> {
  const accentHex = accentColorHex.replace('#', '').toUpperCase() || '1E3A8A';
  const isBn = language === 'bn';
  const { personal, summary, experience, education, skills, languages, projects, certifications, references, aiExtraSections } = data;

  const photoImg = personal.photoUrl ? await imageUrlToUint8Array(personal.photoUrl) : null;
  const sigImg = personal.signatureUrl ? await imageUrlToUint8Array(personal.signatureUrl) : null;

  const contactItems = [
    personal.phone,
    personal.email,
    personal.address || [personal.city, personal.country].filter(Boolean).join(', '),
    personal.linkedin,
    personal.portfolio,
    personal.github,
  ].filter(Boolean);

  const children: Array<Paragraph | Table> = [];

  // Header: Name + Title + optional Photo
  if (photoImg) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 78, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    heading: HeadingLevel.TITLE,
                    spacing: { after: 40 },
                    children: [
                      new TextRun({
                        text: personal.fullName || 'Applicant Name',
                        bold: true,
                        size: 36,
                        color: '0F172A',
                      }),
                    ],
                  }),
                  ...(personal.jobTitle
                    ? [
                        new Paragraph({
                          spacing: { after: 80 },
                          children: [
                            new TextRun({
                              text: personal.jobTitle,
                              bold: true,
                              size: 24,
                              color: accentHex,
                            }),
                          ],
                        }),
                      ]
                    : []),
                  new Paragraph({
                    spacing: { after: 60 },
                    children: [
                      new TextRun({
                        text: contactItems.join('  •  '),
                        size: 19,
                        color: '475569',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 22, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new ImageRun({
                        data: photoImg.bytes,
                        type: photoImg.type,
                        transformation: { width: 88, height: 108 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  } else {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: personal.fullName || 'Applicant Name',
            bold: true,
            size: 36,
            color: '0F172A',
          }),
        ],
      })
    );
    if (personal.jobTitle) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: personal.jobTitle,
              bold: true,
              size: 24,
              color: accentHex,
            }),
          ],
        })
      );
    }
    if (contactItems.length > 0) {
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: contactItems.join('  •  '),
              size: 19,
              color: '475569',
            }),
          ],
        })
      );
    }
  }

  // Summary / Objective
  if (summary && summary.trim()) {
    children.push(sectionHeader(isBn ? 'ক্যারিয়ার উদ্দেশ্য / সারসংক্ষেপ' : 'Career Objective & Professional Summary', accentHex));
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: summary.trim(), size: 20, color: '1E293B' })],
      })
    );
  }

  // Skills
  if (skills.length > 0) {
    children.push(sectionHeader(isBn ? 'মূল দক্ষতাসমূহ' : 'Core Skills & Competencies', accentHex));
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: skills.map((s) => (s.level ? `${s.name} (${s.level})` : s.name)).join('  •  '),
            size: 20,
            color: '1E293B',
          }),
        ],
      })
    );
  }

  // Work Experience
  if (experience.length > 0) {
    children.push(sectionHeader(isBn ? 'কর্মঅভিজ্ঞতা' : 'Work Experience', accentHex));
    for (const exp of experience) {
      const dateRange = [exp.startDate, exp.current ? (isBn ? 'বর্তমান' : 'Present') : exp.endDate]
        .filter(Boolean)
        .join(' – ');
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({ text: exp.jobTitle, bold: true, size: 21, color: '0F172A' }),
            new TextRun({ text: exp.employer ? ` — ${exp.employer}` : '', bold: true, size: 21, color: '334155' }),
            ...(dateRange ? [new TextRun({ text: `   (${dateRange})`, size: 19, color: '64748B' })] : []),
          ],
        })
      );
      if (exp.location) {
        children.push(
          new Paragraph({
            spacing: { after: 30 },
            children: [new TextRun({ text: exp.location, italics: true, size: 18, color: '64748B' })],
          })
        );
      }
      if (exp.description) {
        const lines = exp.description.split('\n').map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          children.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [new TextRun({ text: line.startsWith('•') || line.startsWith('-') ? line : `• ${line}`, size: 19, color: '1E293B' })],
            })
          );
        }
      }
      if (exp.achievements) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: isBn ? 'উল্লেখযোগ্য অর্জন: ' : 'Key Achievement: ', bold: true, size: 19, color: '0F172A' }),
              new TextRun({ text: exp.achievements, size: 19, color: '1E293B' }),
            ],
          })
        );
      }
    }
  }

  // Education
  if (education.length > 0) {
    children.push(sectionHeader(isBn ? 'শিক্ষাগত যোগ্যতা' : 'Educational Qualifications', accentHex));
    for (const edu of education) {
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 21, color: '0F172A' }),
            ...(edu.fieldOfStudy ? [new TextRun({ text: ` in ${edu.fieldOfStudy}`, size: 20, color: '334155' })] : []),
            ...(dates ? [new TextRun({ text: `  (${dates})`, size: 19, color: '64748B' })] : []),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: [edu.institution, edu.location, edu.gpa ? `Result/GPA: ${edu.gpa}` : ''].filter(Boolean).join('  •  '),
              size: 19,
              color: '475569',
            }),
          ],
        })
      );
      if (edu.details) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: edu.details, size: 18, color: '334155' })],
          })
        );
      }
    }
  }

  // Projects
  if (projects.length > 0) {
    children.push(sectionHeader(isBn ? 'প্রজেক্টসমূহ' : 'Projects', accentHex));
    for (const p of projects) {
      children.push(
        new Paragraph({
          spacing: { before: 70, after: 20 },
          children: [
            new TextRun({ text: p.name, bold: true, size: 20, color: '0F172A' }),
            ...(p.role ? [new TextRun({ text: ` — ${p.role}`, size: 19, color: '475569' })] : []),
          ],
        })
      );
      if (p.description) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: p.description, size: 19, color: '1E293B' })],
          })
        );
      }
    }
  }

  // Certifications
  if (certifications.length > 0) {
    children.push(sectionHeader(isBn ? 'প্রশিক্ষণ ও সার্টিফিকেশন' : 'Certifications & Training', accentHex));
    for (const c of certifications) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `• ${c.name}`, bold: true, size: 19, color: '0F172A' }),
            new TextRun({
              text: [c.issuer ? ` — ${c.issuer}` : '', c.date ? ` (${c.date})` : ''].join(''),
              size: 19,
              color: '475569',
            }),
          ],
        })
      );
    }
  }

  // Languages
  if (languages.length > 0) {
    children.push(sectionHeader(isBn ? 'ভাষাগত দক্ষতা' : 'Languages', accentHex));
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: languages.map((l) => `${l.language}: ${l.proficiency}`).join('   |   '),
            size: 19,
            color: '1E293B',
          }),
        ],
      })
    );
  }

  // Extra Sections
  if (aiExtraSections && aiExtraSections.length > 0) {
    for (const sec of aiExtraSections) {
      children.push(sectionHeader(sec.title, accentHex));
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: sec.content, size: 19, color: '1E293B' })],
        })
      );
    }
  }

  // Personal Information Bio Block
  if (
    personal.includePersonalDetailsBlock &&
    (personal.fatherName || personal.motherName || personal.dateOfBirth || personal.permanentAddress || personal.nationality)
  ) {
    children.push(sectionHeader(isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Information', accentHex));
    const bioLines: Array<[string, string | undefined]> = [
      [isBn ? 'পিতার নাম' : "Father's Name", personal.fatherName],
      [isBn ? 'মাতার নাম' : "Mother's Name", personal.motherName],
      [isBn ? 'জন্ম তারিখ' : 'Date of Birth', personal.dateOfBirth],
      [isBn ? 'জাতীয়তা' : 'Nationality', personal.nationality],
      [isBn ? 'স্থায়ী ঠিকানা' : 'Permanent Address', personal.permanentAddress],
    ];
    for (const [label, val] of bioLines) {
      if (val) {
        children.push(
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({ text: `${label}: `, bold: true, size: 19, color: '0F172A' }),
              new TextRun({ text: val, size: 19, color: '1E293B' }),
            ],
          })
        );
      }
    }
  }

  // References
  if (references.length > 0) {
    children.push(sectionHeader(isBn ? 'রেফারেন্স' : 'References', accentHex));
    for (const r of references) {
      children.push(
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: r.name, bold: true, size: 19, color: '0F172A' }),
            new TextRun({
              text: [
                r.jobTitle ? ` — ${r.jobTitle}` : '',
                r.company ? `, ${r.company}` : '',
                r.phone ? ` | ${r.phone}` : '',
                r.email ? ` | ${r.email}` : '',
              ].join(''),
              size: 18,
              color: '475569',
            }),
          ],
        })
      );
    }
  }

  // Signature
  if (sigImg) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 260, after: 40 },
        children: [
          new ImageRun({
            data: sigImg.bytes,
            type: sigImg.type,
            transformation: { width: 120, height: 42 },
          }),
        ],
      })
    );
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: `__________________________\n${personal.fullName || 'Applicant Signature'}`,
            size: 18,
            color: '334155',
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 780, right: 780 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (personal.fullName || 'Resume').replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
  a.href = url;
  a.download = `The_MoSaFa_CV_${safeName}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
