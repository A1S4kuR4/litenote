import { ArrowRight } from "lucide-react";
import type { Messages } from "../i18n";
import type { DashboardResponse } from "../types";

interface DiscoverViewProps {
  dashboard: DashboardResponse;
  onOpenLibrary: () => void;
  onOpenWorkshop: () => void;
  t: Messages;
}

export function DiscoverView({
  dashboard,
  onOpenLibrary,
  onOpenWorkshop,
  t,
}: DiscoverViewProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-surface-container-lowest rounded-[32px] overflow-hidden vellum-shadow border border-outline-variant/10">
        <div className="lg:col-span-6 p-12 lg:p-16 space-y-8">
          <div className="space-y-4">
            {/* Removed redundant spotlight label */}
            <h2 className="font-headline text-5xl md:text-6xl font-bold leading-[1.1] text-on-surface">
              {t.discover.heroHeadline}
            </h2>
            <p className="font-body text-lg text-on-surface-variant leading-relaxed max-w-lg">
              {t.discover.galleryLead}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {dashboard.templates.map((template) => (
              <span 
                key={template.id}
                className="px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-full font-label text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-surface-container-highest transition-all"
              >
                {template.name}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-label text-xs font-bold uppercase tracking-widest text-on-primary shadow-lg transition-all hover:scale-[1.02] active:scale-95"
              onClick={onOpenLibrary}
              type="button"
            >
              <span>{t.actions.browseLibrary}</span>
              <ArrowRight size={16} />
            </button>
            <button 
              className="flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface px-8 py-3.5 font-label text-xs font-bold uppercase tracking-widest text-on-surface transition-all hover:bg-surface-container-low"
              onClick={onOpenWorkshop}
              type="button"
            >
              <span>{t.actions.openWorkshop}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 relative h-[600px] group">
          <img
            alt={dashboard.spotlight.title}
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
            src={dashboard.spotlight.image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent opacity-60"></div>
          <div className="absolute bottom-8 right-8 max-w-sm p-6 bg-surface-container/60 backdrop-blur-xl rounded-2xl border border-white/10 text-white vellum-shadow">
            <span className="font-label text-[10px] font-bold text-primary-fixed uppercase tracking-[0.2em] mb-2 block">
              Curated by Litenote
            </span>
            <h4 className="font-headline text-2xl font-bold mb-2">
              {dashboard.spotlight.title}
            </h4>
            <p className="font-body text-sm text-white/80 leading-relaxed italic">
              {dashboard.spotlight.summary}
            </p>
          </div>
        </div>
      </section>

      {/* Grid Section for Templates (Secondary) */}
      <section className="space-y-8 pb-12">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="font-headline text-4xl font-bold tracking-tight">{t.discover.trendingStyles}</h3>
          </div>
          <button 
            className="font-label text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
            onClick={onOpenLibrary}
          >
            View Full Library
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dashboard.templates.slice(0, 3).map((template) => (
            <article 
              key={template.id}
              className="group bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 vellum-shadow hover:shadow-2xl transition-all duration-500 flex flex-col"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  alt={template.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src={template.previewImage} 
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-8 space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="font-label text-[10px] font-bold text-primary uppercase tracking-widest">
                    {template.texture}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <Sparkles size={16} />
                  </div>
                </div>
                <h4 className="font-headline text-2xl font-bold text-on-surface">
                  {template.name}
                </h4>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed flex-1">
                  {template.summary}
                </p>
                <button 
                  className="w-full mt-4 py-3 rounded-xl border border-outline-variant/20 font-label text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
                  onClick={() => onOpenWorkshop()}
                >
                  Try This Layout
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Sparkles({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
