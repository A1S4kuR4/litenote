import { useState } from "react";
import { LayoutGrid, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "../lib/utils";
import type { Messages } from "../i18n";
import type { DashboardResponse } from "../types";

interface LibraryViewProps {
  dashboard: DashboardResponse;
  onApplyTemplate: (templateId: string) => void;
  onFocusAssets: () => void;
  t: Messages;
}

export function LibraryView({
  dashboard,
  onApplyTemplate,
  onFocusAssets,
  t,
}: LibraryViewProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const categories = Array.from(
    new Set(dashboard.assets.map((asset) => asset.category)),
  );

  return (
    <section className="w-full max-w-none gpu-surface contain-paint">
      <header className="p-10 px-12 pb-2">
        <div className="flex-1">
          <h3 className="studio-title">{t.library.visualIngredients}</h3>
          <p className="studio-lead">{t.library.waterfallLead}</p>
          
          <div className="mt-6 flex gap-2">
            {categories.map((category) => (
              <span key={category} className="px-4 py-1.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/10 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">
                {category}
              </span>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 vellum-shadow text-on-surface-variant hover:text-primary hover:scale-105 transition-all"
          title={isSidebarVisible ? "Hide Templates" : "Show Templates"}
        >
          {isSidebarVisible ? <PanelRightClose size={24} /> : <PanelRightOpen size={24} />}
        </button>
      </header>

      <div className="flex w-full items-start gap-0 transition-all duration-700 ease-in-out">
        <div className="flex-1 min-w-0 transition-all duration-700">
          <div className="library-grid-tiled w-full">
          {dashboard.assets.map((asset) => (
            <article className="library-asset-card group relative overflow-hidden rounded-3xl" key={asset.id}>
              <img alt={asset.name} src={asset.image} className="w-full h-auto group-hover:scale-110 transition-transform duration-700" />
              <div className="library-asset-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent text-white">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/60 mb-1">{asset.category}</span>
                <strong className="text-xl font-headline font-bold leading-tight mb-1">{asset.name}</strong>
                <p className="text-xs text-white/70 italic line-clamp-2 mb-4 leading-relaxed">{asset.description}</p>
                <div className="library-asset-actions flex items-center justify-between">
                  <button className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/40 border border-white/10 text-[9px] font-bold uppercase tracking-widest transition-all btn-nowrap" onClick={onFocusAssets} type="button">
                    {t.actions.openAssets}
                  </button>
                  <small className="text-[10px] text-white/50">
                    {asset.creator} · {asset.likes} {t.library.likesSuffix}
                  </small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <aside className={cn(
        "surface-card flex flex-col gap-6 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) will-change-width gpu-surface flex-shrink-0",
        isSidebarVisible ? "w-[300px] p-6 opacity-100 ml-10" : "w-0 p-0 opacity-0 ml-0 border-0 overflow-hidden pointer-events-none sidebar-closing shadow-none"
      )}>
          <div className={cn("transition-opacity duration-200", isSidebarVisible ? "opacity-100 delay-500" : "opacity-0")}>
            <div className="panel-header library-panel-header">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <LayoutGrid size={18} className="text-primary/70 shrink-0" />
                  <p className="eyebrow m-0 text-[10px] tracking-[0.2em]">{t.library.readyTemplates}</p>
                </div>
                <h4 className="text-2xl font-headline font-bold text-on-surface leading-tight">{t.library.applyVocabulary}</h4>
              </div>
            </div>
          </div>
          
          <div className={cn("library-template-stack grid gap-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-320px)] transition-opacity duration-200", isSidebarVisible ? "opacity-100 delay-600" : "opacity-0")}>
            {dashboard.templates.map((template) => (
              <article className="library-template-card" key={template.id}>
                <img alt={template.name} src={template.previewImage} />
                <div className="library-template-copy">
                  <strong>{template.name}</strong>
                  <p>{template.summary}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => onApplyTemplate(template.id)}
                    type="button"
                  >
                    {t.actions.useTemplate}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </aside>
    </div>
    </section>
  );
}
