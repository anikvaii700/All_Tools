import React from 'react';
import { CVData, CVTemplate } from '../../types/cvMaker';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle,
  FolderGit2,
  Users,
  Star,
  Sparkles,
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
  isWatermarked = false,
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

  return (
    <div
      className={`relative bg-white text-slate-800 shadow-2xl transition-all duration-200 overflow-visible mx-auto print:shadow-none print:m-0 ${fontClass}`}
      style={{
        width: printMode ? '100%' : '794px', // standard 96dpi A4 width (210mm ~ 794px)
        minHeight: printMode ? 'auto' : '1123px', // standard 96dpi A4 height (297mm ~ 1123px)
        transform: !printMode && scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        backgroundColor: template.bgColor || '#ffffff',
      }}
      id={customId || (printMode ? 'cv-print-document' : 'cv-render-document')}
    >
      {/* ================= WATERMARK LAYER (FOR UNPAID PREMIUM) ================= */}
      {/* Faint, elegant watermark (opacity 4.5% - gentle & non-intrusive) */}
      {isWatermarked && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none flex flex-col justify-around py-16 opacity-[0.045]">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="text-center font-bold tracking-widest text-slate-400 text-3xl sm:text-4xl transform -rotate-25 whitespace-nowrap select-none"
              style={{ letterSpacing: '0.35em' }}
            >
              THE MoSaFa • THE MoSaFa • THE MoSaFa
            </div>
          ))}
        </div>
      )}

      {/* ================= EUROPASS DISCLAIMER (IF EUROPASS STYLE) ================= */}
      {template.isEuropass && (
        <div className="bg-slate-100 text-slate-600 px-6 py-1.5 text-[10px] flex items-center justify-between border-b border-slate-200 print:hidden">
          <span>🇪🇺 ইউরোপীয় কারিকুলাম ভিটা (Europass-Inspired Format)</span>
          <span className="text-[9px] text-slate-500">অনানুষ্ঠানিক ডিজাইন • অফিশিয়াল সাইট: europass.europa.eu</span>
        </div>
      )}

      {/* ================= 1. SIDEBAR LEFT LAYOUT ================= */}
      {template.layoutStyle === 'sidebar-left' && (
        <div className="flex flex-row min-h-full">
          {/* Left Sidebar */}
          <div
            className="w-[34%] p-6 flex flex-col gap-5 shrink-0 border-r border-slate-200/80"
            style={{ backgroundColor: template.sidebarBg || '#f8fafc' }}
          >
            {/* Photo */}
            {personal.photoUrl && (
              <div className="flex justify-center mb-1">
                <img
                  src={personal.photoUrl}
                  alt={personal.fullName}
                  className="w-28 h-28 rounded-2xl object-cover shadow-md border-3"
                  style={{ borderColor: primary }}
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Contact Details */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ borderColor: primary, color: primary }}>
                যোগাযোগ / Contact
              </h3>
              {personal.email && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{personal.email}</span>
                </div>
              )}
              {personal.phone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{personal.phone}</span>
                </div>
              )}
              {(personal.city || personal.country) && (
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{[personal.city, personal.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {personal.linkedin && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Linkedin className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{personal.linkedin}</span>
                </div>
              )}
              {personal.github && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Github className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{personal.github}</span>
                </div>
              )}
              {personal.portfolio && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{personal.portfolio}</span>
                </div>
              )}
            </div>

            {/* Skills with modern rating bars */}
            {skills.length > 0 && (
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ borderColor: primary, color: primary }}>
                  দক্ষতাসমূহ / Skills
                </h3>
                <div className="space-y-2">
                  {skills.map((sk) => (
                    <div key={sk.id} className="space-y-0.5">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-800">
                        <span>{sk.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{sk.level || 'Expert'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: sk.level === 'Beginner' ? '40%' : sk.level === 'Intermediate' ? '70%' : '90%',
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
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ borderColor: primary, color: primary }}>
                  ভাষা / Languages
                </h3>
                <div className="space-y-1.5">
                  {languages.map((lg) => (
                    <div key={lg.id} className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-800">{lg.language}</span>
                      <span className="text-slate-500 text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">{lg.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education in sidebar */}
            {education.length > 0 && (
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ borderColor: primary, color: primary }}>
                  শিক্ষা / Education
                </h3>
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-0.5 bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                    <div className="font-bold text-slate-900 text-xs">{edu.degree}</div>
                    <div className="text-[11px] text-slate-600">{edu.institution}</div>
                    <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                      <span>{[edu.startDate, edu.endDate].filter(Boolean).join(' - ')}</span>
                      {edu.gpa && <span className="font-bold text-slate-700">GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Main Content */}
          <div className="w-[66%] p-8 flex flex-col gap-6">
            {/* Header / Name */}
            <div className="border-b pb-4" style={{ borderColor: secondary }}>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: primary }}>
                {personal.fullName || 'আপনার পূর্ণ নাম'}
              </h1>
              <p className="text-sm font-bold text-slate-600 mt-1 uppercase tracking-wide">
                {personal.jobTitle || 'প্রফেশনাল পদবী ও বিশেষজ্ঞতা'}
              </p>
            </div>

            {/* Summary */}
            {summary && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: primary }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }}></span>
                  প্রফেশনাল সামারি / Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line text-justify">{summary}</p>
              </div>
            )}

            {/* Experience with Timeline styling */}
            {experience.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b" style={{ color: primary }}>
                  <Briefcase className="w-3.5 h-3.5" />
                  কাজের অভিজ্ঞতা / Work Experience
                </h2>
                <div className="relative pl-3 space-y-4 border-l-2" style={{ borderColor: `${primary}30` }}>
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative space-y-1">
                      {/* Timeline dot */}
                      <div
                        className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white"
                        style={{ borderColor: primary }}
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-xs text-slate-900">{exp.jobTitle}</span>
                          <span className="text-xs text-slate-600"> • {exp.employer}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded-md bg-slate-100">
                          {[exp.startDate, exp.current ? 'বর্তমান' : exp.endDate].filter(Boolean).join(' – ')}
                        </span>
                      </div>
                      {exp.location && <div className="text-[10px] text-slate-500">{exp.location}</div>}
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                      {exp.achievements && (
                        <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50/70 p-1.5 rounded mt-1 border border-emerald-100">
                          ⭐ অর্জন: {exp.achievements}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b" style={{ color: primary }}>
                  <FolderGit2 className="w-3.5 h-3.5" />
                  প্রজেক্টসমূহ / Key Projects
                </h2>
                <div className="grid grid-cols-1 gap-2.5">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{proj.name}</span>
                        {proj.link && <span className="text-[10px] font-normal text-sky-600">{proj.link}</span>}
                      </div>
                      {proj.role && <div className="text-[11px] font-medium text-slate-600">রোল: {proj.role}</div>}
                      <p className="text-[11px] text-slate-700 mt-1">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b" style={{ color: primary }}>
                  <Award className="w-3.5 h-3.5" />
                  সার্টিফিকেশন / Certifications
                </h2>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-800 text-[11px]">{cert.name}</div>
                      <div className="text-[10px] text-slate-500">{cert.issuer} • {cert.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {references.length > 0 && (
              <div className="space-y-2 mt-auto pt-2 border-t border-slate-200">
                <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: primary }}>
                  <Users className="w-3.5 h-3.5" />
                  রেফারেন্স / References
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {references.map((ref) => (
                    <div key={ref.id} className="p-2 rounded-xl bg-slate-50/90 border border-slate-200/90 text-[11px] space-y-0.5 shadow-2xs">
                      <div className="font-bold text-slate-900 text-xs">{ref.name}</div>
                      <div className="text-slate-700 font-medium">{ref.jobTitle}{ref.company ? `, ${ref.company}` : ''}</div>
                      <div className="text-slate-600 text-[10px] flex flex-wrap gap-x-2.5 pt-0.5">
                        {ref.email && <span>✉️ {ref.email}</span>}
                        {ref.phone && <span>📞 {ref.phone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. SIDEBAR RIGHT LAYOUT ================= */}
      {template.layoutStyle === 'sidebar-right' && (
        <div className="flex flex-row min-h-full">
          {/* Left Main Column (66%) */}
          <div className="w-[66%] p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="border-b-2 pb-4" style={{ borderColor: primary }}>
              <div className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: secondary }}>
                Curriculum Vitae
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {personal.fullName || 'আপনার পূর্ণ নাম'}
              </h1>
              <p className="text-sm font-bold text-slate-700 mt-1 uppercase tracking-wide">
                {personal.jobTitle || 'প্রফেশনাল পদবী ও বিশেষজ্ঞতা'}
              </p>
            </div>

            {/* Professional Profile */}
            {summary && (
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: primary }}>
                  <span className="w-3 h-1 rounded-full" style={{ backgroundColor: primary }}></span>
                  প্রোফাইল সারাংশ / Executive Profile
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed text-justify">{summary}</p>
              </div>
            )}

            {/* Experience Section */}
            {experience.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 pb-1 border-b" style={{ color: primary }}>
                  <Briefcase className="w-4 h-4" />
                  কাজের অভিজ্ঞতা / Professional Experience
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-xs text-slate-900">{exp.jobTitle}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                          {[exp.startDate, exp.current ? 'বর্তমান' : exp.endDate].filter(Boolean).join(' – ')}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600">
                        {exp.employer} {exp.location && `• ${exp.location}`}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                      {exp.achievements && (
                        <div className="text-[11px] text-slate-800 font-medium pl-2 border-l-2 border-amber-400 mt-1">
                          ✨ {exp.achievements}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Projects */}
            {projects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 pb-1 border-b" style={{ color: primary }}>
                  <FolderGit2 className="w-4 h-4" />
                  প্রধান প্রজেক্টসমূহ / Key Projects
                </h2>
                <div className="space-y-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-xs p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{proj.name}</span>
                        {proj.link && <span className="text-[10px] text-sky-600 font-mono">{proj.link}</span>}
                      </div>
                      {proj.role && <div className="text-[11px] text-slate-500">দায়িত্ব: {proj.role}</div>}
                      <p className="text-[11px] text-slate-700 mt-1">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {references.length > 0 && (
              <div className="space-y-2 mt-auto pt-2 border-t border-slate-200">
                <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: primary }}>
                  <Users className="w-3.5 h-3.5" />
                  রেফারেন্স / References
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {references.map((ref) => (
                    <div key={ref.id} className="p-2 rounded-xl bg-slate-50/90 border border-slate-200/90 text-[11px] space-y-0.5 shadow-2xs">
                      <div className="font-bold text-slate-900 text-xs">{ref.name}</div>
                      <div className="text-slate-700 font-medium">{ref.jobTitle}{ref.company ? `, ${ref.company}` : ''}</div>
                      <div className="text-slate-600 text-[10px] flex flex-wrap gap-x-2.5 pt-0.5">
                        {ref.email && <span>✉️ {ref.email}</span>}
                        {ref.phone && <span>📞 {ref.phone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar (34%) */}
          <div
            className="w-[34%] p-6 flex flex-col gap-6 shrink-0 border-l border-slate-200/80"
            style={{ backgroundColor: template.sidebarBg || '#f1f5f9' }}
          >
            {/* Photo with right badge frame */}
            {personal.photoUrl && (
              <div className="flex justify-center">
                <img
                  src={personal.photoUrl}
                  alt={personal.fullName}
                  className="w-28 h-28 rounded-full object-cover shadow-lg border-4"
                  style={{ borderColor: primary }}
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Contact details */}
            <div className="space-y-2.5 text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ borderColor: primary, color: primary }}>
                যোগাযোগের তথ্য
              </h3>
              {personal.email && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{personal.email}</span>
                </div>
              )}
              {personal.phone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{personal.phone}</span>
                </div>
              )}
              {(personal.city || personal.country) && (
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{[personal.city, personal.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {personal.linkedin && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Linkedin className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{personal.linkedin}</span>
                </div>
              )}
              {personal.github && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Github className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                  <span>{personal.github}</span>
                </div>
              )}
            </div>

            {/* Education in Right Sidebar */}
            {education.length > 0 && (
              <div className="space-y-2.5 text-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ borderColor: primary, color: primary }}>
                  শিক্ষাগত যোগ্যতা
                </h3>
                {education.map((edu) => (
                  <div key={edu.id} className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="font-bold text-slate-900 text-xs">{edu.degree}</div>
                    <div className="text-[11px] text-slate-600">{edu.institution}</div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>{[edu.startDate, edu.endDate].filter(Boolean).join(' - ')}</span>
                      {edu.gpa && <span className="font-bold text-slate-800">CGPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills Pills */}
            {skills.length > 0 && (
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ borderColor: primary, color: primary }}>
                  দক্ষতাসমূহ / Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((sk) => (
                    <span
                      key={sk.id}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200/90 text-slate-800 shadow-2xs"
                    >
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ borderColor: primary, color: primary }}>
                  ভাষা দক্ষতা
                </h3>
                <div className="space-y-1 text-[11px]">
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between items-center bg-white/70 px-2 py-1 rounded border border-slate-200/60">
                      <span className="font-bold text-slate-800">{l.language}</span>
                      <span className="text-[10px] text-slate-600">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ borderColor: primary, color: primary }}>
                  সার্টিফিকেশন
                </h3>
                <div className="space-y-1.5">
                  {certifications.map((c) => (
                    <div key={c.id} className="p-2 rounded bg-white border border-slate-200 text-[11px]">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.issuer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 3. ONE-COLUMN CLASSIC LAYOUT ================= */}
      {template.layoutStyle === 'one-column' && (
        <div className="p-10 flex flex-col gap-6">
          {/* Header */}
          <div className="text-center pb-5 border-b-2" style={{ borderColor: primary }}>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {personal.fullName || 'আপনার পূর্ণ নাম'}
            </h1>
            <p className="text-sm font-bold mt-1 tracking-wider uppercase" style={{ color: primary }}>
              {personal.jobTitle || 'প্রফেশনাল পদবী ও বিশেষজ্ঞতা'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
              {personal.phone && <span>📞 {personal.phone}</span>}
              {personal.email && <span>✉️ {personal.email}</span>}
              {(personal.city || personal.country) && <span>📍 {[personal.city, personal.country].filter(Boolean).join(', ')}</span>}
              {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
              {personal.github && <span>💻 {personal.github}</span>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider pb-0.5 border-b" style={{ color: primary, borderColor: secondary }}>
                পেশাদার সারাংশ / Professional Summary
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">{summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {experience.length > 0 && (
            <div className="space-y-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider pb-0.5 border-b" style={{ color: primary, borderColor: secondary }}>
                কাজের অভিজ্ঞতা / Work Experience
              </h2>
              <div className="space-y-3.5">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                      <span>{exp.jobTitle} — <span className="font-semibold text-slate-700">{exp.employer}</span></span>
                      <span className="text-[11px] font-normal text-slate-500">
                        {[exp.startDate, exp.current ? 'বর্তমান' : exp.endDate].filter(Boolean).join(' – ')}
                      </span>
                    </div>
                    {exp.location && <div className="text-[10px] text-slate-500">{exp.location}</div>}
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-3 border-l-2" style={{ borderColor: primary }}>
                      {exp.description}
                    </p>
                    {exp.achievements && (
                      <div className="text-[11px] text-slate-800 font-medium pl-3 mt-1">
                        • প্রধান অর্জন: {exp.achievements}
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
              <h2 className="text-xs font-bold uppercase tracking-wider pb-0.5 border-b" style={{ color: primary, borderColor: secondary }}>
                শিক্ষাগত যোগ্যতা / Education
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {education.map((edu) => (
                  <div key={edu.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-[11px] text-slate-600">{edu.institution}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                      <span>{[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}</span>
                      {edu.gpa && <span className="font-bold text-slate-700">CGPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills & Certifications Split */}
          <div className="grid grid-cols-2 gap-6">
            {skills.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider pb-0.5 border-b" style={{ color: primary, borderColor: secondary }}>
                  দক্ষতাসমূহ / Key Skills
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((sk) => (
                    <span key={sk.id} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider pb-0.5 border-b" style={{ color: primary, borderColor: secondary }}>
                  ভাষা / Languages
                </h3>
                <div className="space-y-1 text-xs pt-1">
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{l.language}</span>
                      <span className="text-slate-500">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* References */}
          {references.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-0.5 border-b" style={{ color: primary, borderColor: secondary }}>
                <Users className="w-3.5 h-3.5" />
                রেফারেন্স / References
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {references.map((ref) => (
                  <div key={ref.id} className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 text-[11px] space-y-0.5 shadow-2xs">
                    <div className="font-bold text-slate-900 text-xs">{ref.name}</div>
                    <div className="text-slate-700 font-medium">{ref.jobTitle}{ref.company ? `, ${ref.company}` : ''}</div>
                    <div className="text-slate-600 text-[10px] flex flex-wrap gap-x-2.5 pt-0.5">
                      {ref.email && <span>✉️ {ref.email}</span>}
                      {ref.phone && <span>📞 {ref.phone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 4. COMPACT ATS LAYOUT ================= */}
      {template.layoutStyle === 'compact-ats' && (
        <div className="p-8 sm:p-10 flex flex-col gap-4 font-mono text-xs">
          {/* Header */}
          <div className="text-center border-b-2 pb-3 space-y-1" style={{ borderColor: primary }}>
            <h1 className="text-2xl font-black tracking-wider text-slate-900 uppercase">
              {personal.fullName || 'আপনার পূর্ণ নাম'}
            </h1>
            <p className="text-xs font-bold tracking-widest uppercase text-slate-700">
              {personal.jobTitle || 'পেশাগত পদবী'}
            </p>
            <div className="text-[11px] text-slate-600 pt-1">
              {[personal.phone, personal.email, [personal.city, personal.country].filter(Boolean).join(', '), personal.linkedin]
                .filter(Boolean)
                .join(' | ')}
            </div>
          </div>

          {/* Professional Summary */}
          {summary && (
            <div className="space-y-1">
              <h2 className="text-[11px] font-black uppercase tracking-wider border-b pb-0.5" style={{ color: primary, borderColor: primary }}>
                PROFESSIONAL SUMMARY
              </h2>
              <p className="text-[11px] text-slate-800 leading-relaxed text-justify font-sans">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-[11px] font-black uppercase tracking-wider border-b pb-0.5" style={{ color: primary, borderColor: primary }}>
                WORK EXPERIENCE
              </h2>
              <div className="space-y-3">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{exp.jobTitle.toUpperCase()} — {exp.employer}</span>
                      <span className="font-normal text-slate-600">
                        {[exp.startDate, exp.current ? 'PRESENT' : exp.endDate].filter(Boolean).join(' - ')}
                      </span>
                    </div>
                    {exp.location && <div className="text-[10px] text-slate-500 italic">{exp.location}</div>}
                    <p className="text-[11px] text-slate-700 leading-relaxed font-sans">{exp.description}</p>
                    {exp.achievements && (
                      <div className="text-[11px] text-slate-900 font-sans font-medium pl-2">
                        • Key Achievement: {exp.achievements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-black uppercase tracking-wider border-b pb-0.5" style={{ color: primary, borderColor: primary }}>
                EDUCATION
              </h2>
              <div className="space-y-1.5">
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.institution}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {[edu.startDate, edu.endDate].filter(Boolean).join(' - ')} {edu.gpa && `(GPA: ${edu.gpa})`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Skills (ATS Optimized Keyword Density) */}
          {skills.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-[11px] font-black uppercase tracking-wider border-b pb-0.5" style={{ color: primary, borderColor: primary }}>
                TECHNICAL & PROFESSIONAL SKILLS
              </h2>
              <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
                {skills.map((s) => s.name).join(' • ')}
              </p>
            </div>
          )}

          {/* Certifications & Languages */}
          <div className="grid grid-cols-2 gap-4">
            {certifications.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-[11px] font-black uppercase tracking-wider border-b pb-0.5" style={{ color: primary, borderColor: primary }}>
                  CERTIFICATIONS
                </h3>
                <div className="space-y-0.5 text-[11px] font-sans">
                  {certifications.map((c) => (
                    <div key={c.id}>• {c.name} ({c.issuer})</div>
                  ))}
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-[11px] font-black uppercase tracking-wider border-b pb-0.5" style={{ color: primary, borderColor: primary }}>
                  LANGUAGES
                </h3>
                <div className="space-y-0.5 text-[11px] font-sans">
                  {languages.map((l) => (
                    <div key={l.id}>• {l.language}: {l.proficiency}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* References */}
          {references.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-[11px] font-black uppercase tracking-wider border-b pb-0.5" style={{ color: primary, borderColor: primary }}>
                REFERENCES
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
                {references.map((ref) => (
                  <div key={ref.id} className="space-y-0.5">
                    <div className="font-bold text-slate-900">{ref.name}</div>
                    <div className="text-slate-700">{ref.jobTitle}{ref.company ? `, ${ref.company}` : ''}</div>
                    <div className="text-slate-600 text-[10px]">
                      {[ref.email && `Email: ${ref.email}`, ref.phone && `Phone: ${ref.phone}`].filter(Boolean).join(' | ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 5. EUROPASS STANDARD LAYOUT ================= */}
      {(template.layoutStyle === 'europass' || template.isEuropass) && (
        <div className="min-h-full flex flex-col p-8 sm:p-10 gap-6">
          {/* Europass Header */}
          <div className="flex items-start justify-between border-b-2 pb-5" style={{ borderColor: '#0e4194' }}>
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#0e4194] text-[11px] font-black tracking-wider uppercase">
                🇪🇺 EUROPASS CURRICULUM VITAE
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {personal.fullName || 'আপনার পূর্ণ নাম'}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-[#0e4194] tracking-wide uppercase">
                {personal.jobTitle || 'পেশাদার পদবী'}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700 pt-2">
                {personal.email && <div>✉️ {personal.email}</div>}
                {personal.phone && <div>📞 {personal.phone}</div>}
                {(personal.city || personal.country) && <div>📍 {[personal.city, personal.country].filter(Boolean).join(', ')}</div>}
                {personal.linkedin && <div>🔗 {personal.linkedin}</div>}
              </div>
            </div>

            {personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                className="w-24 h-28 object-cover rounded shadow border-2 border-[#0e4194] shrink-0"
                crossOrigin="anonymous"
              />
            )}
          </div>

          {/* Europass 2-Column Asymmetric Layout */}
          <div className="space-y-6">
            {/* Summary */}
            {summary && (
              <div className="flex gap-4">
                <div className="w-[28%] shrink-0 text-xs font-bold uppercase text-[#0e4194]">
                  WORK PREFERENCE / ABOUT
                </div>
                <div className="w-[72%] text-xs text-slate-700 leading-relaxed text-justify">
                  {summary}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-[#0e4194] border-b pb-1">
                  WORK EXPERIENCE
                </div>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="flex gap-4 text-xs">
                      <div className="w-[28%] shrink-0 text-[11px] font-bold text-slate-700">
                        {[exp.startDate, exp.current ? 'Current' : exp.endDate].filter(Boolean).join(' – ')}
                        {exp.location && <div className="text-slate-500 font-normal">{exp.location}</div>}
                      </div>
                      <div className="w-[72%] space-y-1">
                        <div className="font-bold text-slate-900 text-xs">
                          {exp.jobTitle}
                        </div>
                        <div className="text-[11px] font-semibold text-[#0e4194]">
                          {exp.employer}
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        {exp.achievements && (
                          <div className="text-[11px] text-slate-800 bg-blue-50/70 p-1.5 rounded border border-blue-100">
                            Achievement: {exp.achievements}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education and Training */}
            {education.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-[#0e4194] border-b pb-1">
                  EDUCATION AND TRAINING
                </div>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex gap-4 text-xs">
                      <div className="w-[28%] shrink-0 text-[11px] font-bold text-slate-700">
                        {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                      </div>
                      <div className="w-[72%] space-y-0.5">
                        <div className="font-bold text-slate-900">{edu.degree}</div>
                        <div className="text-[11px] text-[#0e4194]">{edu.institution}</div>
                        {edu.gpa && <div className="text-[10px] text-slate-600">Final Grade: {edu.gpa}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Europass Language Grid */}
            {languages.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-[#0e4194] border-b pb-1">
                  LANGUAGE SKILLS (CEFR Standard)
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {languages.map((l) => (
                    <div key={l.id} className="p-2.5 rounded border border-slate-200 bg-slate-50 flex justify-between items-center">
                      <span className="font-bold text-slate-900">{l.language}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0e4194] text-[10px] font-bold">
                        {l.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Digital Skills */}
            {skills.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-[#0e4194] border-b pb-1">
                  DIGITAL & PROFESSIONAL SKILLS
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((sk) => (
                    <span key={sk.id} className="px-2 py-1 rounded text-[11px] bg-slate-100 border border-slate-200 font-medium text-slate-800">
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Europass References */}
            {references.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-[#0e4194] border-b pb-1">
                  REFERENCES / REFEREES
                </div>
                <div className="space-y-3">
                  {references.map((ref) => (
                    <div key={ref.id} className="flex gap-4 text-xs">
                      <div className="w-[28%] shrink-0 text-[11px] font-bold text-slate-700">
                        Referee
                      </div>
                      <div className="w-[72%] space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs">{ref.name}</div>
                        <div className="text-[11px] text-[#0e4194]">{ref.jobTitle}{ref.company ? `, ${ref.company}` : ''}</div>
                        <div className="text-[10px] text-slate-600 flex flex-wrap gap-x-3 pt-0.5">
                          {ref.email && <span>✉️ {ref.email}</span>}
                          {ref.phone && <span>📞 {ref.phone}</span>}
                        </div>
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
      {template.layoutStyle === 'header-accent' && (
        <div className="min-h-full flex flex-col">
          {/* Top Hero Banner */}
          <div
            className="p-8 text-white flex items-center justify-between gap-6 shadow-md"
            style={{ backgroundColor: primary }}
          >
            <div className="space-y-2 flex-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{personal.fullName || 'আপনার পূর্ণ নাম'}</h1>
              <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase opacity-95 text-white/90">
                {personal.jobTitle || 'প্রফেশনাল পদবী ও বিশেষজ্ঞতা'}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                {personal.email && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {personal.email}
                  </span>
                )}
                {personal.phone && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {personal.phone}
                  </span>
                )}
                {(personal.city || personal.country) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {[personal.city, personal.country].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>

            {personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-3 border-white shadow-lg shrink-0"
                crossOrigin="anonymous"
              />
            )}
          </div>

          {/* Body Content in 2 Columns */}
          <div className="p-8 flex flex-row gap-6 flex-1">
            {/* Left Dominant Column (62%) */}
            <div className="w-[62%] flex flex-col gap-5">
              {summary && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed shadow-2xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: primary }}>
                    পেশাদার সামারি / Profile
                  </h3>
                  {summary}
                </div>
              )}

              {experience.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b" style={{ color: primary }}>
                    <Briefcase className="w-3.5 h-3.5" />
                    কাজের অভিজ্ঞতা / Experience
                  </h2>
                  <div className="space-y-3.5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.jobTitle} • {exp.employer}</span>
                          <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded bg-slate-100">
                            {[exp.startDate, exp.current ? 'বর্তমান' : exp.endDate].filter(Boolean).join(' – ')}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        {exp.achievements && (
                          <div className="text-[11px] text-emerald-800 font-medium pl-2 border-l-2 border-emerald-500">
                            {exp.achievements}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b" style={{ color: primary }}>
                    <FolderGit2 className="w-3.5 h-3.5" />
                    প্রজেক্টসমূহ / Projects
                  </h2>
                  <div className="space-y-2 text-xs">
                    {projects.map((p) => (
                      <div key={p.id} className="p-2.5 rounded-xl border border-slate-200">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {references.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b" style={{ color: primary }}>
                    <Users className="w-3.5 h-3.5" />
                    রেফারেন্স / References
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {references.map((ref) => (
                      <div key={ref.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5 shadow-2xs">
                        <div className="font-bold text-slate-900 text-xs">{ref.name}</div>
                        <div className="text-slate-700 font-medium">{ref.jobTitle}{ref.company ? `, ${ref.company}` : ''}</div>
                        <div className="text-slate-600 text-[10px] flex flex-wrap gap-x-2.5 pt-0.5">
                          {ref.email && <span>✉️ {ref.email}</span>}
                          {ref.phone && <span>📞 {ref.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (38%) */}
            <div className="w-[38%] flex flex-col gap-5 border-l border-slate-100 pl-6">
              {education.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b" style={{ color: primary }}>
                    <GraduationCap className="w-3.5 h-3.5" />
                    শিক্ষা / Education
                  </h3>
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-[11px] text-slate-600">{edu.institution}</div>
                      <div className="text-[10px] text-slate-500">{[edu.startDate, edu.endDate].filter(Boolean).join(' - ')}</div>
                    </div>
                  ))}
                </div>
              )}

              {skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b" style={{ color: primary }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    দক্ষতা / Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((sk) => (
                      <span key={sk.id} className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {languages.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider pb-1 border-b" style={{ color: primary }}>
                    ভাষা / Languages
                  </h3>
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{l.language}</span>
                      <span className="text-slate-500">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. CREATIVE BANNER LAYOUT ================= */}
      {template.layoutStyle === 'creative-banner' && (
        <div className="min-h-full flex flex-col">
          {/* Creative Top Split Banner */}
          <div className="relative p-8 pb-10 text-white overflow-hidden shadow-lg" style={{ backgroundColor: primary }}>
            {/* Background geometric design accent */}
            <div
              className="absolute -right-12 -top-12 w-64 h-64 rounded-full opacity-20 pointer-events-none"
              style={{ backgroundColor: secondary }}
            />
            <div className="relative z-10 flex items-center justify-between gap-6">
              <div className="space-y-2">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white shadow-xs"
                >
                  Creative Portfolio
                </span>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-xs">
                  {personal.fullName || 'আপনার পূর্ণ নাম'}
                </h1>
                <p className="text-sm sm:text-base font-bold tracking-wider uppercase text-white/90">
                  {personal.jobTitle || 'ক্রিয়েটিভ প্রফেশনাল'}
                </p>
                <div className="flex flex-wrap gap-3 text-xs opacity-95 pt-2">
                  {personal.email && <span>✉️ {personal.email}</span>}
                  {personal.phone && <span>📞 {personal.phone}</span>}
                  {personal.portfolio && <span>🌐 {personal.portfolio}</span>}
                </div>
              </div>

              {personal.photoUrl && (
                <img
                  src={personal.photoUrl}
                  alt={personal.fullName}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl shrink-0"
                  crossOrigin="anonymous"
                />
              )}
            </div>
          </div>

          {/* Creative Body */}
          <div className="p-8 flex flex-col gap-6 flex-1">
            {summary && (
              <div className="relative pl-4 border-l-4 py-1 text-xs text-slate-700 leading-relaxed font-medium" style={{ borderColor: primary }}>
                {summary}
              </div>
            )}

            {/* Experience with creative vertical line & pills */}
            {experience.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: primary }} />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    অভিজ্ঞতার যাত্রা / Experience Timeline
                  </h2>
                </div>
                <div className="relative pl-5 space-y-4 border-l-2" style={{ borderColor: primary }}>
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative space-y-1">
                      <div
                        className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-3 bg-white shadow-xs"
                        style={{ borderColor: primary }}
                      />
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-xs text-slate-900">{exp.jobTitle}</span>
                        <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md" style={{ backgroundColor: secondary }}>
                          {[exp.startDate, exp.current ? 'বর্তমান' : exp.endDate].filter(Boolean).join(' – ')}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600">{exp.employer}</div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creative Skills Pills with Colored Dots */}
            {skills.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  দক্ষতা ও কারিগরি পারদর্শিতা / Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((sk) => (
                    <span
                      key={sk.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 border border-slate-200/80 text-slate-800 shadow-2xs"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }}></span>
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects & Education 2-Column Grid */}
            <div className="grid grid-cols-2 gap-5 mt-auto pt-4 border-t border-slate-100">
              {projects.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    ফিচার্ড প্রজেক্টসমূহ
                  </h3>
                  <div className="space-y-2 text-xs">
                    {projects.map((p) => (
                      <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <p className="text-[11px] text-slate-600">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {education.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    শিক্ষা ও ডিগ্রি
                  </h3>
                  <div className="space-y-2 text-xs">
                    {education.map((edu) => (
                      <div key={edu.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="font-bold text-slate-900">{edu.degree}</div>
                        <div className="text-[11px] text-slate-600">{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Creative References */}
            {references.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" style={{ color: primary }} />
                  <span>রেফারেন্স / References</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {references.map((ref) => (
                    <div key={ref.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-0.5">
                      <div className="font-bold text-slate-900">{ref.name}</div>
                      <div className="text-slate-700 font-medium">{ref.jobTitle}{ref.company ? `, ${ref.company}` : ''}</div>
                      <div className="text-slate-600 text-[10px] flex flex-wrap gap-x-2.5 pt-0.5">
                        {ref.email && <span>✉️ {ref.email}</span>}
                        {ref.phone && <span>📞 {ref.phone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 8. MODERN BENTO GRID LAYOUT (DEFAULT FALLBACK) ================= */}
      {template.layoutStyle === 'modern-grid' && (
        <div className="p-8 sm:p-10 flex flex-col gap-5 min-h-full">
          {/* Top Identity Card */}
          <div
            className="p-6 rounded-3xl border border-slate-200/80 flex items-center justify-between gap-6 shadow-sm"
            style={{ backgroundColor: template.sidebarBg || '#f8fafc' }}
          >
            <div className="space-y-1.5">
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white border border-slate-200" style={{ color: primary }}>
                Executive Bento Profile
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {personal.fullName || 'আপনার পূর্ণ নাম'}
              </h1>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600">
                {personal.jobTitle || 'পেশাদার পদবী'}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                {personal.email && <span>✉️ {personal.email}</span>}
                {personal.phone && <span>📞 {personal.phone}</span>}
                {(personal.city || personal.country) && <span>📍 {[personal.city, personal.country].filter(Boolean).join(', ')}</span>}
              </div>
            </div>

            {personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-3 shadow-md shrink-0"
                style={{ borderColor: primary }}
                crossOrigin="anonymous"
              />
            )}
          </div>

          {/* Summary Box */}
          {summary && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-2xs">
              <h3 className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: primary }}>
                পেশাদার সারাংশ / Executive Summary
              </h3>
              {summary}
            </div>
          )}

          {/* 2-Column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
            {/* Experience Card (Spans 2 columns) */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider pb-1 border-b flex items-center gap-1.5" style={{ color: primary }}>
                <Briefcase className="w-3.5 h-3.5" />
                কাজের অভিজ্ঞতা / Work Experience
              </h3>
              <div className="space-y-3.5">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{exp.jobTitle} • {exp.employer}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {[exp.startDate, exp.current ? 'বর্তমান' : exp.endDate].filter(Boolean).join(' – ')}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Education Card (Spans 1 column) */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-2xs flex flex-col gap-4">
              {/* Skills */}
              {skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider pb-1 border-b" style={{ color: primary }}>
                    দক্ষতাসমূহ / Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((sk) => (
                      <span key={sk.id} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider pb-1 border-b" style={{ color: primary }}>
                    শিক্ষা / Education
                  </h4>
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-[11px] text-slate-600">{edu.institution}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <div className="space-y-1 text-xs mt-auto pt-2 border-t border-slate-200">
                  <h4 className="font-bold text-slate-800 text-[11px]">ভাষা:</h4>
                  {languages.map((l) => (
                    <div key={l.id} className="text-[11px] text-slate-600 flex justify-between">
                      <span>{l.language}</span>
                      <span>{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* References Bento Card */}
          {references.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider pb-1 border-b flex items-center gap-1.5" style={{ color: primary }}>
                <Users className="w-3.5 h-3.5" />
                <span>রেফারেন্স / References</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {references.map((ref) => (
                  <div key={ref.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-0.5">
                    <div className="font-bold text-slate-900">{ref.name}</div>
                    <div className="text-slate-700 font-medium">{ref.jobTitle}{ref.company ? `, ${ref.company}` : ''}</div>
                    <div className="text-slate-600 text-[10px] flex flex-wrap gap-x-2.5 pt-0.5">
                      {ref.email && <span>✉️ {ref.email}</span>}
                      {ref.phone && <span>📞 {ref.phone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
