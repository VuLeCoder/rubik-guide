"use client";

import Image from 'next/image';
import { Mail, Globe, BookOpen, Quote, Trophy, Phone, Video, Share2 } from 'lucide-react';
import { ABOUT_ME_CONTENT } from './constants';
import { useLanguage } from '@/app/context/LanguageContext';

const IconMap = {
  Phone,
  Mail,
  Share2,
  Video
};

export default function AboutMe() {
  const { language, t } = useLanguage();
  const { ava_img, name, socialLinks, videoLink } = ABOUT_ME_CONTENT;

  // Localize bio items dynamically
  const bio = [
    { label: t.aboutMe.bioLabels.location, value: t.aboutMe.bioValues.location },
    { label: t.aboutMe.bioLabels.chess, value: t.aboutMe.bioValues.chess },
    { label: t.aboutMe.bioLabels.robotics, value: t.aboutMe.bioValues.robotics },
    { label: t.aboutMe.bioLabels.highlights, value: t.aboutMe.bioValues.highlights }
  ];

  // Localize personal best
  const personalBest = [
    { label: "3x3x3", value: language === 'vi' ? '18 giây' : '18 seconds' }
  ];

  const story = t.aboutMe.story;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 px-4 sm:px-6">
      {/* Profile Header */}
      <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="h-32 bg-amber-400"></div>
        <div className="px-6 pb-8">
          <div className="relative flex justify-center -mt-16 mb-6">
            <div className="p-1 bg-white rounded-full shadow-lg">
              <div className="relative w-32 h-32 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center overflow-hidden">
                <Image 
                  src={`/about-me/${ava_img}`}
                  alt={name} 
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
            <p className="text-amber-600 font-semibold uppercase tracking-wider text-sm">{t.aboutMe.title}</p>
            <div className="flex justify-center gap-4 pt-4">
              {socialLinks.map((link) => {
                const Icon = IconMap[link.icon as keyof typeof IconMap] || Globe;

                let formattedHref = link.url;
                if (link.icon === "Phone") {
                  formattedHref = `tel:${link.url}`;
                } else if (link.icon === "Mail" && !link.url.startsWith("mailto:")) {
                  formattedHref = `mailto:${link.url}`;
                }

                return (
                  <a 
                    key={link.id}
                    href={formattedHref} 
                    className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-amber-100 hover:text-amber-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.icon === "Phone" ? (language === 'vi' ? `Gọi: ${link.url}` : `Call: ${link.url}`) : link.icon === "Mail" ? (language === 'vi' ? `Gửi mail: ${link.url}` : `Email: ${link.url}`) : link.id}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout (Grid 2 cột ở phía trên) */}
      <div className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Sidebar (Chỉ còn Tiểu sử và Kỷ lục) */}
        <div className="md:col-span-1 space-y-6 md:sticky md:top-16">
          
          {/* Short Bio */}
          <section className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <BookOpen size={20} className="text-amber-500" />
              {t.aboutMe.biography}
            </h2>
            <ul className="space-y-4 text-slate-600 text-sm">
              {bio.map((item, idx) => (
                <li key={idx} className="flex flex-col gap-1 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="font-bold text-slate-900">{item.label}:</span>
                  <span className="leading-relaxed">{item.value}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Personal Best */}
          <section className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <Trophy size={20} className="text-amber-500" />
              {t.aboutMe.personalBest}
            </h2>
            <ul className="space-y-4 text-slate-600 text-sm">
              {personalBest.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-900">{item.label}</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">{item.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right Column: Long Story */}
        <section className="md:col-span-2 h-full">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 relative min-h-full">
            <Quote size={48} className="absolute top-4 right-4 text-slate-100 pointer-events-none" />
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b-2 border-amber-400 inline-block pb-1">
              {t.aboutMe.myStory}
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-5 leading-relaxed text-sm sm:text-base">
              {story.map((para, idx) => (
                <p key={idx} className="text-justify">{para}</p>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-6">
          <Video size={24} className="text-amber-500" />
          {t.aboutMe.introVideo}
        </h2>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-slate-100 border border-slate-200">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={videoLink}
            title={t.aboutMe.introVideo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

    </div>
  );
}
