import React from 'react';
import { CVData, CVTemplate } from '../../types/cvMaker';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
} from 'lucide-react';

interface CVRendererProps {
  data: CVData;
  template: CVTemplate;
  isWatermarked?: boolean;
  scale?: number;
  printMode?: boolean;
  customId?: string;
}

export const CVRenderer: React.FC<CVRendererProps> = ({
  data,
  template,
  scale = 1,
  printMode = false,
  customId,
}) => {
  const { personal, summary, experience, education, skills, languages, projects, certifications, references } = data;

  const fontClass =
    template.fontFamily === 'serif'
      ? 'font-serif'
      : template.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const primary = template.primaryColor;
  const secondary = template.secondaryColor;
  const locationText = personal.address || [personal.city, personal.country].filter(Boolean).join(', ');
  const isEuropass = template.layoutStyle === 'europass' || Boolean(template.isEuropass);

  const renderSectionHeading = (title: string, borderHex = `${primary}35`, colorHex = primary) => (
    <h2
      className="text-[11.5px] font-bold uppercase tracking-wider pb-1 border-b"
      style={{ color: colorHex, borderColor: borderHex }}
    >
      {title}
    </h2>
  );

  const renderContactList = (compact = false) => (
    <div className={compact ? 'flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600' : 'space-y-1.5 text-[11.5px] text-slate-700'}>
      {personal.phone && (
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
          <span className="tabular-nums">{personal.phone}</span>
        </div>
      )}
      {personal.email && (
        <div className="flex items-center gap-1.5 break-all">
          <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
          <span>{personal.email}</span>
        </div>
      )}
      {locationText && (
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: primary }} />
          <span>{locationText}</span>
        </div>
      )}
      {personal.linkedin && (
        <div className="flex items-center gap-1.5 break-all">
          <Linkedin className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
          <span>{personal.linkedin}</span>
        </div>
      )}
      {personal.github && (
        <div className="flex items-center gap-1.5 break-all">
          <Github className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
          <span>{personal.github}</span>
        </div>
      )}
      {personal.portfolio && (
        <div className="flex items-center gap-1.5 break-all">
          <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
          <span>{personal.portfolio}</span>
        </div>
      )}
    </div>
  );

  const renderReferencesGrid = (cols: 1 | 2 = 2) =>
    references.length > 0 ? (
      <div className="space-y-2.5">
        {renderSectionHeading('References')}
        <div className={cols === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2.5'}>
          {references.map((ref) => (
            <div
              key={ref.id}
              className="cv-avoid-break text-[11.5px] space-y-0.5 border-l-2 pl-3 py-0.5"
              style={{ borderColor: `${primary}45` }}
            >
              <div className="font-bold text-slate-900">{ref.name}</div>
              {(ref.jobTitle || ref.company) && (
                <div className="text-slate-700">
                  {[ref.jobTitle, ref.company].filter(Boolean).join(', ')}
                </div>
              )}
              {(ref.email || ref.phone) && (
                <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3 pt-0.5">
                  {ref.email && <span>{ref.email}</span>}
                  {ref.phone && <span className="tabular-nums">{ref.phone}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div
      className={`relative bg-white text-slate-800 shadow-xl transition-all duration-200 overflow-visible mx-auto print:shadow-none print:m-0 ${fontClass}`}
      style={{
        width: printMode ? '100%' : '794px',
        minHeight: printMode ? 'auto' : '1122px',
        transform: !printMode && scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        backgroundColor: template.bgColor || '#ffffff',
      }}
      id={customId || (printMode ? 'cv-print-document' : 'cv-render-document')}
    >
      {/* ================= 1. SIDEBAR LEFT LAYOUT ================= */}
      {template.layoutStyle === 'sidebar-left' && !isEuropass && (
        <div className="flex flex-row items-stretch" style={{ minHeight: printMode ? 'auto' : '1122px' }}>
          {/* Left Sidebar */}
          <div
            className="w-[33%] p-6 flex flex-col gap-5 shrink-0 border-r border-slate-200"
            style={{ backgroundColor: template.sidebarBg || '#f8fafc' }}
          >
            {personal.photoUrl && (
              <div className="flex justify-center">
                <img
                  src={personal.photoUrl}
                  alt={personal.fullName || 'Applicant'}
                  className="w-28 h-32 rounded-lg object-cover border-2"
                  style={{ borderColor: primary }}
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Contact */}
            <div className="cv-avoid-break space-y-2">
              {renderSectionHeading('Contact', primary)}
              {renderContactList(false)}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="cv-avoid-break space-y-2">
                {renderSectionHeading('Skills', primary)}
                <div className="space-y-2">
                  {skills.map((sk) => (
                    <div key={sk.id} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-800 gap-2">
                        <span>{sk.name}</span>
                        {sk.level && <span className="text-[10px] text-slate-500 font-normal shrink-0">{sk.level}</span>}
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: sk.level === 'Beginner' ? '45%' : sk.level === 'Intermediate' ? '72%' : '90%',
                            backgroundColor: primary,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div className="cv-avoid-break space-y-2">
                {renderSectionHeading('Languages', primary)}
                <div className="space-y-1.5">
                  {languages.map((lg) => (
                    <div key={lg.id} className="flex justify-between items-baseline text-[11.5px] gap-2">
                      <span className="font-semibold text-slate-800">{lg.language}</span>
                      {lg.proficiency && <span className="text-slate-600 text-[10.5px]">{lg.proficiency}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications in Sidebar */}
            {certifications.length > 0 && (
              <div className="cv-avoid-break space-y-2">
                {renderSectionHeading('Certifications', primary)}
                <div className="space-y-2">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="text-[11px] space-y-0.5">
                      <div className="font-bold text-slate-900">{cert.name}</div>
                      <div className="text-slate-600">
                        {[cert.issuer, cert.date].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Main Content */}
          <div className="w-[67%] p-7 flex flex-col gap-5">
            {/* Header */}
            <div className="cv-avoid-break border-b-2 pb-3.5" style={{ borderColor: primary }}>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                {personal.fullName || 'Curriculum Vitae'}
              </h1>
              {personal.jobTitle && (
                <p className="text-[13px] font-semibold mt-1 tracking-wide" style={{ color: primary }}>
                  {personal.jobTitle}
                </p>
              )}
            </div>

            {/* Summary */}
            {summary && (
              <div className="cv-avoid-break space-y-1.5">
                {renderSectionHeading('Professional Summary')}
                <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="space-y-3">
                {renderSectionHeading('Work Experience')}
                <div className="space-y-3.5">
                  {experience.map((exp) => (
                    <div key={exp.id} className="cv-avoid-break space-y-1">
                      <div className="flex justify-between items-baseline gap-3">
                        <div className="text-[12.5px] font-bold text-slate-900">
                          {exp.jobTitle}
                          {exp.employer && <span className="font-semibold text-slate-700"> — {exp.employer}</span>}
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium tabular-nums shrink-0">
                          {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                        </span>
                      </div>
                      {exp.location && <div className="text-[10.5px] text-slate-500">{exp.location}</div>}
                      {exp.description && (
                        <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                      )}
                      {exp.achievements && (
                        <div className="text-[11px] text-slate-800 font-medium pl-2.5 border-l-2 mt-1" style={{ borderColor: secondary }}>
                          Key Achievement: {exp.achievements}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="space-y-2.5">
                {renderSectionHeading('Education')}
                <div className="space-y-2.5">
                  {education.map((edu) => (
                    <div key={edu.id} className="cv-avoid-break space-y-0.5">
                      <div className="flex justify-between items-baseline gap-3">
                        <div className="text-[12px] font-bold text-slate-900">
                          {edu.degree}
                          {edu.fieldOfStudy && <span className="font-medium text-slate-700"> ({edu.fieldOfStudy})</span>}
                        </div>
                        <span className="text-[11px] text-slate-600 tabular-nums shrink-0">
                          {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                        </span>
                      </div>
                      <div className="text-[11.5px] text-slate-700 flex justify-between gap-2">
                        <span>{edu.institution}</span>
                        {edu.gpa && <span className="font-semibold text-slate-800 shrink-0">GPA: {edu.gpa}</span>}
                      </div>
                      {edu.details && <div className="text-[11px] text-slate-600">{edu.details}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="space-y-2.5">
                {renderSectionHeading('Projects')}
                <div className="space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="cv-avoid-break text-[11.5px] space-y-0.5">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-slate-900">
                          {proj.name}
                          {proj.role && <span className="font-medium text-slate-600"> — {proj.role}</span>}
                        </span>
                        {proj.link && <span className="text-[10.5px] text-slate-600 shrink-0">{proj.link}</span>}
                      </div>
                      {proj.description && <p className="text-slate-700 leading-relaxed">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {renderReferencesGrid(2)}
          </div>
        </div>
      )}

      {/* ================= 2. SIDEBAR RIGHT LAYOUT ================= */}
      {template.layoutStyle === 'sidebar-right' && !isEuropass && (
        <div className="flex flex-row items-stretch" style={{ minHeight: printMode ? 'auto' : '1122px' }}>
          {/* Left Main Column (67%) */}
          <div className="w-[67%] p-7 flex flex-col gap-5">
            <div className="cv-avoid-break border-b-2 pb-3.5" style={{ borderColor: primary }}>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                {personal.fullName || 'Curriculum Vitae'}
              </h1>
              {personal.jobTitle && (
                <p className="text-[13px] font-semibold mt-1 tracking-wide" style={{ color: primary }}>
                  {personal.jobTitle}
                </p>
              )}
            </div>

            {summary && (
              <div className="cv-avoid-break space-y-1.5">
                {renderSectionHeading('Professional Summary')}
                <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{summary}</p>
              </div>
            )}

            {experience.length > 0 && (
              <div className="space-y-3">
                {renderSectionHeading('Work Experience')}
                <div className="space-y-3.5">
                  {experience.map((exp) => (
                    <div key={exp.id} className="cv-avoid-break space-y-1">
                      <div className="flex justify-between items-baseline gap-3">
                        <div className="text-[12.5px] font-bold text-slate-900">
                          {exp.jobTitle}
                          {exp.employer && <span className="font-semibold text-slate-700"> — {exp.employer}</span>}
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 tabular-nums shrink-0">
                          {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                        </span>
                      </div>
                      {exp.location && <div className="text-[10.5px] text-slate-500">{exp.location}</div>}
                      {exp.description && (
                        <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                      )}
                      {exp.achievements && (
                        <div className="text-[11px] text-slate-800 font-medium pl-2.5 border-l-2 mt-1" style={{ borderColor: secondary }}>
                          Key Achievement: {exp.achievements}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div className="space-y-2.5">
                {renderSectionHeading('Key Projects')}
                <div className="space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="cv-avoid-break text-[11.5px] space-y-0.5">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-slate-900">
                          {proj.name}
                          {proj.role && <span className="font-medium text-slate-600"> — {proj.role}</span>}
                        </span>
                        {proj.link && <span className="text-[10.5px] text-slate-600 shrink-0">{proj.link}</span>}
                      </div>
                      {proj.description && <p className="text-slate-700 leading-relaxed">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {renderReferencesGrid(2)}
          </div>

          {/* Right Sidebar (33%) */}
          <div
            className="w-[33%] p-6 flex flex-col gap-5 shrink-0 border-l border-slate-200"
            style={{ backgroundColor: template.sidebarBg || '#f1f5f9' }}
          >
            {personal.photoUrl && (
              <div className="flex justify-center">
                <img
                  src={personal.photoUrl}
                  alt={personal.fullName || 'Applicant'}
                  className="w-28 h-32 rounded-lg object-cover border-2"
                  style={{ borderColor: primary }}
                  crossOrigin="anonymous"
                />
              </div>
            )}

            <div className="cv-avoid-break space-y-2">
              {renderSectionHeading('Contact', primary)}
              {renderContactList(false)}
            </div>

            {education.length > 0 && (
              <div className="cv-avoid-break space-y-2.5">
                {renderSectionHeading('Education', primary)}
                <div className="space-y-2.5">
                  {education.map((edu) => (
                    <div key={edu.id} className="text-[11.5px] space-y-0.5">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-[11px] text-slate-700">{edu.institution}</div>
                      <div className="text-[10.5px] text-slate-500 flex justify-between gap-2 tabular-nums">
                        <span>{[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}</span>
                        {edu.gpa && <span className="font-semibold text-slate-700">GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div className="cv-avoid-break space-y-2">
                {renderSectionHeading('Skills', primary)}
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((sk) => (
                    <span
                      key={sk.id}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-slate-200 text-slate-800"
                    >
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div className="cv-avoid-break space-y-1.5">
                {renderSectionHeading('Languages', primary)}
                <div className="space-y-1 text-[11.5px]">
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between items-baseline gap-2">
                      <span className="font-semibold text-slate-800">{l.language}</span>
                      {l.proficiency && <span className="text-[10.5px] text-slate-600">{l.proficiency}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div className="cv-avoid-break space-y-1.5">
                {renderSectionHeading('Certifications', primary)}
                <div className="space-y-1.5">
                  {certifications.map((c) => (
                    <div key={c.id} className="text-[11px]">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[10.5px] text-slate-600">
                        {[c.issuer, c.date].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 3. ONE-COLUMN CLASSIC LAYOUT ================= */}
      {template.layoutStyle === 'one-column' && !isEuropass && (
        <div className="p-9 flex flex-col gap-5">
          {/* Header */}
          <div className="cv-avoid-break pb-4 border-b-2 flex items-center justify-between gap-6" style={{ borderColor: primary }}>
            <div className={personal.photoUrl ? 'flex-1 text-left' : 'w-full text-center'}>
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">
                {personal.fullName || 'Curriculum Vitae'}
              </h1>
              {personal.jobTitle && (
                <p className="text-[13px] font-semibold mt-1 tracking-wide" style={{ color: primary }}>
                  {personal.jobTitle}
                </p>
              )}
              <div className={`mt-2.5 pt-2 border-t border-slate-100 ${personal.photoUrl ? '' : 'flex justify-center'}`}>
                {renderContactList(true)}
              </div>
            </div>

            {personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName || 'Applicant'}
                className="w-22 h-26 rounded-lg object-cover border border-slate-300 shrink-0"
                crossOrigin="anonymous"
              />
            )}
          </div>

          {summary && (
            <div className="cv-avoid-break space-y-1.5">
              {renderSectionHeading('Professional Summary')}
              <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="space-y-3">
              {renderSectionHeading('Work Experience')}
              <div className="space-y-3.5">
                {experience.map((exp) => (
                  <div key={exp.id} className="cv-avoid-break space-y-1">
                    <div className="flex justify-between items-baseline gap-3">
                      <span className="text-[12.5px] font-bold text-slate-900">
                        {exp.jobTitle}
                        {exp.employer && <span className="font-semibold text-slate-700"> — {exp.employer}</span>}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 tabular-nums shrink-0">
                        {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                      </span>
                    </div>
                    {exp.location && <div className="text-[10.5px] text-slate-500">{exp.location}</div>}
                    {exp.description && (
                      <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line pl-3 border-l-2" style={{ borderColor: `${primary}55` }}>
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && (
                      <div className="text-[11px] text-slate-800 font-medium pl-3">
                        Key Achievement: {exp.achievements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div className="space-y-2.5">
              {renderSectionHeading('Education')}
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id} className="cv-avoid-break flex justify-between items-baseline gap-4 text-[11.5px]">
                    <div>
                      <div className="font-bold text-slate-900">
                        {edu.degree}
                        {edu.fieldOfStudy && <span className="font-medium text-slate-700"> ({edu.fieldOfStudy})</span>}
                      </div>
                      <div className="text-slate-600">
                        {edu.institution}
                        {edu.gpa && <span className="font-semibold text-slate-800"> · GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-600 tabular-nums shrink-0">
                      {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div className="space-y-2">
              {renderSectionHeading('Projects')}
              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.id} className="cv-avoid-break text-[11.5px]">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-slate-900">
                        {p.name}
                        {p.role && <span className="font-medium text-slate-600"> — {p.role}</span>}
                      </span>
                      {p.link && <span className="text-[10.5px] text-slate-600 shrink-0">{p.link}</span>}
                    </div>
                    {p.description && <p className="text-slate-700 leading-relaxed">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(skills.length > 0 || languages.length > 0) && (
            <div className="cv-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-6">
              {skills.length > 0 && (
                <div className="space-y-1.5">
                  {renderSectionHeading('Key Skills')}
                  <p className="text-[11.5px] text-slate-700 leading-relaxed">
                    {skills.map((sk) => sk.name).join(' · ')}
                  </p>
                </div>
              )}

              {languages.length > 0 && (
                <div className="space-y-1.5">
                  {renderSectionHeading('Languages')}
                  <div className="space-y-1 text-[11.5px]">
                    {languages.map((l) => (
                      <div key={l.id} className="flex justify-between">
                        <span className="font-semibold text-slate-800">{l.language}</span>
                        <span className="text-slate-600">{l.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {certifications.length > 0 && (
            <div className="cv-avoid-break space-y-1.5">
              {renderSectionHeading('Certifications & Training')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                {certifications.map((c) => (
                  <div key={c.id}>
                    <span className="font-semibold text-slate-900">{c.name}</span>
                    <span className="text-slate-600">
                      {[c.issuer ? ` — ${c.issuer}` : '', c.date ? ` (${c.date})` : ''].join('')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renderReferencesGrid(2)}
        </div>
      )}

      {/* ================= 4. COMPACT ATS LAYOUT ================= */}
      {template.layoutStyle === 'compact-ats' && !isEuropass && (
        <div className="p-8 sm:p-9 flex flex-col gap-4 text-[11.5px]">
          <div className="cv-avoid-break text-center border-b-2 pb-3 space-y-1" style={{ borderColor: primary }}>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {personal.fullName || 'Curriculum Vitae'}
            </h1>
            {personal.jobTitle && (
              <p className="text-[12.5px] font-semibold tracking-wide text-slate-700">
                {personal.jobTitle}
              </p>
            )}
            <div className="text-[11px] text-slate-600 pt-0.5">
              {[personal.phone, personal.email, locationText, personal.linkedin, personal.github]
                .filter(Boolean)
                .join('  |  ')}
            </div>
          </div>

          {summary && (
            <div className="cv-avoid-break space-y-1">
              {renderSectionHeading('Professional Summary', primary)}
              <p className="text-[11.5px] text-slate-800 leading-relaxed">{summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="space-y-2.5">
              {renderSectionHeading('Work Experience', primary)}
              <div className="space-y-3">
                {experience.map((exp) => (
                  <div key={exp.id} className="cv-avoid-break space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-900 gap-3">
                      <span>
                        {exp.jobTitle}
                        {exp.employer ? ` — ${exp.employer}` : ''}
                      </span>
                      <span className="font-normal text-slate-600 tabular-nums shrink-0">
                        {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                      </span>
                    </div>
                    {exp.location && <div className="text-[10.5px] text-slate-500">{exp.location}</div>}
                    {exp.description && (
                      <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                    )}
                    {exp.achievements && (
                      <div className="text-[11px] text-slate-900 font-medium pl-2">
                        • Key Achievement: {exp.achievements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div className="space-y-1.5">
              {renderSectionHeading('Education', primary)}
              <div className="space-y-1.5">
                {education.map((edu) => (
                  <div key={edu.id} className="cv-avoid-break flex justify-between items-baseline gap-3">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree}</span>
                      {edu.institution && <span> — {edu.institution}</span>}
                    </div>
                    <div className="text-[11px] text-slate-600 tabular-nums shrink-0">
                      {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')} {edu.gpa && `(GPA: ${edu.gpa})`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div className="cv-avoid-break space-y-1">
              {renderSectionHeading('Technical & Professional Skills', primary)}
              <p className="text-[11.5px] text-slate-800 leading-relaxed">
                {skills.map((s) => s.name).join(' · ')}
              </p>
            </div>
          )}

          {projects.length > 0 && (
            <div className="space-y-1.5">
              {renderSectionHeading('Projects', primary)}
              <div className="space-y-1.5">
                {projects.map((p) => (
                  <div key={p.id} className="cv-avoid-break">
                    <div className="font-bold text-slate-900">
                      {p.name}
                      {p.role && <span className="font-normal text-slate-600"> — {p.role}</span>}
                    </div>
                    {p.description && <p className="text-slate-700">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(certifications.length > 0 || languages.length > 0) && (
            <div className="cv-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.length > 0 && (
                <div className="space-y-1">
                  {renderSectionHeading('Certifications', primary)}
                  <div className="space-y-0.5 text-[11.5px]">
                    {certifications.map((c) => (
                      <div key={c.id}>• {c.name}{c.issuer ? ` (${c.issuer})` : ''}</div>
                    ))}
                  </div>
                </div>
              )}

              {languages.length > 0 && (
                <div className="space-y-1">
                  {renderSectionHeading('Languages', primary)}
                  <div className="space-y-0.5 text-[11.5px]">
                    {languages.map((l) => (
                      <div key={l.id}>• {l.language}{l.proficiency ? `: ${l.proficiency}` : ''}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {renderReferencesGrid(2)}
        </div>
      )}

      {/* ================= 5. EUROPASS STANDARD LAYOUT ================= */}
      {isEuropass && (
        <div className="flex flex-col p-8 sm:p-9 gap-5">
          <div className="cv-avoid-break flex items-start justify-between border-b-2 pb-4 gap-5" style={{ borderColor: '#0e4194' }}>
            <div className="space-y-1.5 flex-1">
              <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
                {personal.fullName || 'Curriculum Vitae'}
              </h1>
              {personal.jobTitle && (
                <p className="text-[13px] font-semibold text-[#0e4194] tracking-wide">
                  {personal.jobTitle}
                </p>
              )}
              <div className="pt-1.5">{renderContactList(true)}</div>
            </div>

            {personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName || 'Applicant'}
                className="w-24 h-28 object-cover rounded border-2 border-[#0e4194] shrink-0"
                crossOrigin="anonymous"
              />
            )}
          </div>

          <div className="space-y-5">
            {summary && (
              <div className="cv-avoid-break flex gap-4">
                <div className="w-[26%] shrink-0 text-[11px] font-bold uppercase text-[#0e4194] pt-0.5">
                  Profile Summary
                </div>
                <div className="w-[74%] text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">
                  {summary}
                </div>
              </div>
            )}

            {experience.length > 0 && (
              <div className="space-y-3">
                {renderSectionHeading('Work Experience', '#0e4194', '#0e4194')}
                <div className="space-y-3.5">
                  {experience.map((exp) => (
                    <div key={exp.id} className="cv-avoid-break flex gap-4 text-[11.5px]">
                      <div className="w-[26%] shrink-0 text-[11px] font-semibold text-slate-700 tabular-nums">
                        {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                        {exp.location && <div className="text-slate-500 font-normal mt-0.5">{exp.location}</div>}
                      </div>
                      <div className="w-[74%] space-y-1">
                        <div className="font-bold text-slate-900 text-[12px]">{exp.jobTitle}</div>
                        {exp.employer && <div className="text-[11px] font-semibold text-[#0e4194]">{exp.employer}</div>}
                        {exp.description && (
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        )}
                        {exp.achievements && (
                          <div className="text-[11px] text-slate-800 pl-2.5 border-l-2 border-[#0e4194]">
                            Key Achievement: {exp.achievements}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education.length > 0 && (
              <div className="space-y-3">
                {renderSectionHeading('Education & Training', '#0e4194', '#0e4194')}
                <div className="space-y-2.5">
                  {education.map((edu) => (
                    <div key={edu.id} className="cv-avoid-break flex gap-4 text-[11.5px]">
                      <div className="w-[26%] shrink-0 text-[11px] font-semibold text-slate-700 tabular-nums">
                        {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                      </div>
                      <div className="w-[74%] space-y-0.5">
                        <div className="font-bold text-slate-900">{edu.degree}</div>
                        <div className="text-[11px] text-[#0e4194]">{edu.institution}</div>
                        {edu.gpa && <div className="text-[10.5px] text-slate-600">Grade / GPA: {edu.gpa}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div className="space-y-2.5">
                {renderSectionHeading('Projects', '#0e4194', '#0e4194')}
                <div className="space-y-2">
                  {projects.map((p) => (
                    <div key={p.id} className="cv-avoid-break flex gap-4 text-[11.5px]">
                      <div className="w-[26%] shrink-0 text-[11px] font-semibold text-slate-700">
                        {p.role || 'Project'}
                      </div>
                      <div className="w-[74%] space-y-0.5">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        {p.description && <p className="text-slate-700">{p.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div className="cv-avoid-break space-y-2">
                {renderSectionHeading('Language Skills', '#0e4194', '#0e4194')}
                <div className="grid grid-cols-2 gap-3 text-[11.5px]">
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between items-baseline border-b border-slate-100 pb-1">
                      <span className="font-semibold text-slate-900">{l.language}</span>
                      <span className="text-[#0e4194] text-[11px] font-medium">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div className="cv-avoid-break space-y-1.5">
                {renderSectionHeading('Digital & Professional Skills', '#0e4194', '#0e4194')}
                <p className="text-[11.5px] text-slate-700 leading-relaxed">
                  {skills.map((sk) => sk.name).join(' · ')}
                </p>
              </div>
            )}

            {certifications.length > 0 && (
              <div className="cv-avoid-break space-y-1.5">
                {renderSectionHeading('Certifications', '#0e4194', '#0e4194')}
                <div className="space-y-1 text-[11.5px]">
                  {certifications.map((c) => (
                    <div key={c.id}>
                      <span className="font-semibold text-slate-900">{c.name}</span>
                      <span className="text-slate-600">{[c.issuer ? ` — ${c.issuer}` : '', c.date ? ` (${c.date})` : ''].join('')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {references.length > 0 && (
              <div className="space-y-2.5">
                {renderSectionHeading('References', '#0e4194', '#0e4194')}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px]">
                  {references.map((ref) => (
                    <div key={ref.id} className="cv-avoid-break space-y-0.5">
                      <div className="font-bold text-slate-900">{ref.name}</div>
                      <div className="text-[#0e4194]">{[ref.jobTitle, ref.company].filter(Boolean).join(', ')}</div>
                      <div className="text-[10.5px] text-slate-600">
                        {[ref.email, ref.phone].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 6. HEADER ACCENT BANNER LAYOUT ================= */}
      {template.layoutStyle === 'header-accent' && !isEuropass && (
        <div className="flex flex-col">
          {/* Top Header */}
          <div
            className="cv-avoid-break px-8 py-6 text-white flex items-center justify-between gap-6"
            style={{ backgroundColor: primary }}
          >
            <div className="space-y-1.5 flex-1">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                {personal.fullName || 'Curriculum Vitae'}
              </h1>
              {personal.jobTitle && (
                <p className="text-[13px] font-medium tracking-wide text-white/90">
                  {personal.jobTitle}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/90 pt-1">
                {personal.phone && (
                  <span className="flex items-center gap-1 tabular-nums">
                    <Phone className="w-3 h-3" /> {personal.phone}
                  </span>
                )}
                {personal.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {personal.email}
                  </span>
                )}
                {locationText && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {locationText}
                  </span>
                )}
                {personal.linkedin && (
                  <span className="flex items-center gap-1">
                    <Linkedin className="w-3 h-3" /> {personal.linkedin}
                  </span>
                )}
              </div>
            </div>

            {personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName || 'Applicant'}
                className="w-22 h-26 rounded-lg object-cover border-2 border-white/80 shrink-0"
                crossOrigin="anonymous"
              />
            )}
          </div>

          {/* 2-Column Body */}
          <div className="p-7 flex flex-row gap-6 flex-1">
            {/* Left Dominant Column (64%) */}
            <div className="w-[64%] flex flex-col gap-5">
              {summary && (
                <div className="cv-avoid-break space-y-1.5">
                  {renderSectionHeading('Professional Summary')}
                  <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{summary}</p>
                </div>
              )}

              {experience.length > 0 && (
                <div className="space-y-3">
                  {renderSectionHeading('Work Experience')}
                  <div className="space-y-3.5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="cv-avoid-break space-y-1 text-[11.5px]">
                        <div className="flex justify-between items-baseline gap-2 font-bold text-slate-900">
                          <span>
                            {exp.jobTitle}
                            {exp.employer ? ` — ${exp.employer}` : ''}
                          </span>
                          <span className="text-[10.5px] text-slate-600 font-medium tabular-nums shrink-0">
                            {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        )}
                        {exp.achievements && (
                          <div className="text-[11px] text-slate-800 font-medium pl-2.5 border-l-2" style={{ borderColor: secondary }}>
                            Key Achievement: {exp.achievements}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="space-y-2">
                  {renderSectionHeading('Projects')}
                  <div className="space-y-2 text-[11.5px]">
                    {projects.map((p) => (
                      <div key={p.id} className="cv-avoid-break">
                        <div className="font-bold text-slate-900">
                          {p.name}
                          {p.role && <span className="font-medium text-slate-600"> — {p.role}</span>}
                        </div>
                        {p.description && <p className="text-slate-700 mt-0.5">{p.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {renderReferencesGrid(2)}
            </div>

            {/* Right Column (36%) */}
            <div className="w-[36%] flex flex-col gap-5 border-l border-slate-200 pl-5">
              {education.length > 0 && (
                <div className="cv-avoid-break space-y-2.5">
                  {renderSectionHeading('Education')}
                  {education.map((edu) => (
                    <div key={edu.id} className="text-[11.5px] space-y-0.5">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-[11px] text-slate-700">{edu.institution}</div>
                      <div className="text-[10.5px] text-slate-500 tabular-nums">
                        {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                        {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {skills.length > 0 && (
                <div className="cv-avoid-break space-y-2">
                  {renderSectionHeading('Skills')}
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((sk) => (
                      <span key={sk.id} className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-800 font-medium border border-slate-200">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {languages.length > 0 && (
                <div className="cv-avoid-break space-y-1.5 text-[11.5px]">
                  {renderSectionHeading('Languages')}
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between">
                      <span className="font-semibold text-slate-800">{l.language}</span>
                      <span className="text-slate-600">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              )}

              {certifications.length > 0 && (
                <div className="cv-avoid-break space-y-1.5 text-[11.5px]">
                  {renderSectionHeading('Certifications')}
                  {certifications.map((c) => (
                    <div key={c.id} className="space-y-0.5">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[10.5px] text-slate-600">
                        {[c.issuer, c.date].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. CREATIVE BANNER LAYOUT ================= */}
      {template.layoutStyle === 'creative-banner' && !isEuropass && (
        <div className="flex flex-col">
          {/* Clean Accent Header */}
          <div className="cv-avoid-break px-8 py-6 text-white flex items-center justify-between gap-6" style={{ backgroundColor: primary }}>
            <div className="space-y-1.5 flex-1">
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white">
                {personal.fullName || 'Curriculum Vitae'}
              </h1>
              {personal.jobTitle && (
                <p className="text-[13px] font-semibold tracking-wide text-white/90">
                  {personal.jobTitle}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/90 pt-1">
                {personal.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {personal.email}
                  </span>
                )}
                {personal.phone && (
                  <span className="flex items-center gap-1 tabular-nums">
                    <Phone className="w-3 h-3" /> {personal.phone}
                  </span>
                )}
                {locationText && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {locationText}
                  </span>
                )}
                {personal.portfolio && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {personal.portfolio}
                  </span>
                )}
              </div>
            </div>

            {personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName || 'Applicant'}
                className="w-24 h-24 rounded-full object-cover border-3 border-white shrink-0"
                crossOrigin="anonymous"
              />
            )}
          </div>

          <div className="p-8 flex flex-col gap-5">
            {summary && (
              <div className="cv-avoid-break pl-3.5 border-l-3 py-0.5 text-[11.5px] text-slate-700 leading-relaxed" style={{ borderColor: primary }}>
                {summary}
              </div>
            )}

            {experience.length > 0 && (
              <div className="space-y-3">
                {renderSectionHeading('Experience')}
                <div className="space-y-3.5 pl-4 border-l-2" style={{ borderColor: `${primary}45` }}>
                  {experience.map((exp) => (
                    <div key={exp.id} className="cv-avoid-break space-y-1">
                      <div className="flex justify-between items-baseline gap-3">
                        <span className="font-bold text-[12.5px] text-slate-900">
                          {exp.jobTitle}
                          {exp.employer && <span className="font-semibold text-slate-700"> — {exp.employer}</span>}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 tabular-nums shrink-0">
                          {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div className="cv-avoid-break space-y-2">
                {renderSectionHeading('Skills')}
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((sk) => (
                    <span
                      key={sk.id}
                      className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-800"
                    >
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(projects.length > 0 || education.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projects.length > 0 && (
                  <div className="space-y-2">
                    {renderSectionHeading('Projects')}
                    <div className="space-y-2 text-[11.5px]">
                      {projects.map((p) => (
                        <div key={p.id} className="cv-avoid-break">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          {p.description && <p className="text-slate-700">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {education.length > 0 && (
                  <div className="space-y-2">
                    {renderSectionHeading('Education')}
                    <div className="space-y-2 text-[11.5px]">
                      {education.map((edu) => (
                        <div key={edu.id} className="cv-avoid-break">
                          <div className="font-bold text-slate-900">{edu.degree}</div>
                          <div className="text-slate-600">
                            {edu.institution}
                            {edu.endDate ? ` · ${edu.endDate}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(certifications.length > 0 || languages.length > 0) && (
              <div className="cv-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-6">
                {certifications.length > 0 && (
                  <div className="space-y-1.5">
                    {renderSectionHeading('Certifications')}
                    <div className="space-y-1 text-[11.5px]">
                      {certifications.map((c) => (
                        <div key={c.id}>
                          <span className="font-semibold text-slate-900">{c.name}</span>
                          {c.issuer && <span className="text-slate-600"> — {c.issuer}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {languages.length > 0 && (
                  <div className="space-y-1.5">
                    {renderSectionHeading('Languages')}
                    <div className="space-y-1 text-[11.5px]">
                      {languages.map((l) => (
                        <div key={l.id} className="flex justify-between">
                          <span className="font-semibold text-slate-800">{l.language}</span>
                          <span className="text-slate-600">{l.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {renderReferencesGrid(2)}
          </div>
        </div>
      )}

      {/* ================= 8. MODERN STRUCTURED GRID LAYOUT ================= */}
      {template.layoutStyle === 'modern-grid' && !isEuropass && (
        <div className="p-8 flex flex-col gap-5">
          <div
            className="cv-avoid-break p-5 rounded-xl border border-slate-200 flex items-center justify-between gap-6"
            style={{ backgroundColor: template.sidebarBg || '#f8fafc' }}
          >
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
                {personal.fullName || 'Curriculum Vitae'}
              </h1>
              {personal.jobTitle && (
                <p className="text-[13px] font-semibold tracking-wide" style={{ color: primary }}>
                  {personal.jobTitle}
                </p>
              )}
              <div className="pt-1">{renderContactList(true)}</div>
            </div>

            {personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName || 'Applicant'}
                className="w-22 h-26 rounded-lg object-cover border-2 shrink-0"
                style={{ borderColor: primary }}
                crossOrigin="anonymous"
              />
            )}
          </div>

          {summary && (
            <div className="cv-avoid-break space-y-1.5">
              {renderSectionHeading('Executive Summary')}
              <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Experience & Projects (2 columns) */}
            <div className="md:col-span-2 flex flex-col gap-5">
              {experience.length > 0 && (
                <div className="space-y-3">
                  {renderSectionHeading('Work Experience')}
                  <div className="space-y-3.5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="cv-avoid-break space-y-1 text-[11.5px]">
                        <div className="flex justify-between font-bold text-slate-900 gap-2">
                          <span>
                            {exp.jobTitle}
                            {exp.employer ? ` — ${exp.employer}` : ''}
                          </span>
                          <span className="text-[10.5px] text-slate-600 font-medium tabular-nums shrink-0">
                            {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="space-y-2">
                  {renderSectionHeading('Projects')}
                  <div className="space-y-2 text-[11.5px]">
                    {projects.map((p) => (
                      <div key={p.id} className="cv-avoid-break">
                        <div className="font-bold text-slate-900">
                          {p.name}
                          {p.role && <span className="font-medium text-slate-600"> — {p.role}</span>}
                        </div>
                        {p.description && <p className="text-slate-700">{p.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skills, Education, Certs, Languages (1 column) */}
            <div className="flex flex-col gap-5 border-l border-slate-200 pl-5">
              {skills.length > 0 && (
                <div className="cv-avoid-break space-y-2">
                  {renderSectionHeading('Skills')}
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((sk) => (
                      <span key={sk.id} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 border border-slate-200 text-slate-800">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {education.length > 0 && (
                <div className="cv-avoid-break space-y-2">
                  {renderSectionHeading('Education')}
                  {education.map((edu) => (
                    <div key={edu.id} className="text-[11.5px] space-y-0.5">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-[11px] text-slate-600">{edu.institution}</div>
                      {edu.endDate && <div className="text-[10.5px] text-slate-500 tabular-nums">{edu.endDate}</div>}
                    </div>
                  ))}
                </div>
              )}

              {certifications.length > 0 && (
                <div className="cv-avoid-break space-y-1.5">
                  {renderSectionHeading('Certifications')}
                  {certifications.map((c) => (
                    <div key={c.id} className="text-[11px]">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      {c.issuer && <div className="text-slate-600">{c.issuer}</div>}
                    </div>
                  ))}
                </div>
              )}

              {languages.length > 0 && (
                <div className="cv-avoid-break space-y-1.5">
                  {renderSectionHeading('Languages')}
                  {languages.map((l) => (
                    <div key={l.id} className="text-[11px] text-slate-700 flex justify-between gap-2">
                      <span className="font-medium">{l.language}</span>
                      <span className="text-slate-500">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {renderReferencesGrid(2)}
        </div>
      )}

      {/* ================= OPTIONAL EXTRA SECTIONS, BIO DETAILS & SIGNATURE ================= */}
      {((data.aiExtraSections && data.aiExtraSections.length > 0) ||
        (personal.includePersonalDetailsBlock &&
          Boolean(
            personal.fatherName ||
              personal.motherName ||
              personal.dateOfBirth ||
              personal.permanentAddress ||
              personal.nationality
          )) ||
        Boolean(personal.signatureUrl)) && (
        <div className="px-8 pb-8 pt-4 space-y-4 border-t border-slate-200 bg-transparent">
          {data.aiExtraSections &&
            data.aiExtraSections.map((sec) => (
              <div key={sec.id} className="cv-avoid-break space-y-1.5">
                {renderSectionHeading(sec.title)}
                <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line">{sec.content}</p>
              </div>
            ))}

          {personal.includePersonalDetailsBlock &&
            (personal.fatherName ||
              personal.motherName ||
              personal.dateOfBirth ||
              personal.permanentAddress ||
              personal.nationality) && (
              <div className="cv-avoid-break space-y-2">
                {renderSectionHeading('Personal Information')}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11.5px] text-slate-700">
                  {personal.fatherName && (
                    <div>
                      <span className="font-semibold text-slate-900">Father's Name: </span>
                      <span>{personal.fatherName}</span>
                    </div>
                  )}
                  {personal.motherName && (
                    <div>
                      <span className="font-semibold text-slate-900">Mother's Name: </span>
                      <span>{personal.motherName}</span>
                    </div>
                  )}
                  {personal.dateOfBirth && (
                    <div>
                      <span className="font-semibold text-slate-900">Date of Birth: </span>
                      <span>{personal.dateOfBirth}</span>
                    </div>
                  )}
                  {personal.nationality && (
                    <div>
                      <span className="font-semibold text-slate-900">Nationality: </span>
                      <span>{personal.nationality}</span>
                    </div>
                  )}
                  {personal.permanentAddress && (
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-slate-900">Permanent Address: </span>
                      <span>{personal.permanentAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {personal.signatureUrl && (
            <div className="cv-avoid-break pt-4 flex justify-end">
              <div className="text-center min-w-[160px]">
                <img
                  src={personal.signatureUrl}
                  alt="Signature"
                  className="h-12 max-w-[180px] object-contain mx-auto mb-1"
                  crossOrigin="anonymous"
                />
                <div className="border-t border-slate-500 pt-1 text-[11px] font-semibold text-slate-700">
                  {personal.fullName || 'Applicant Signature'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
