import { useMemo, useState } from "react";
import { LayoutGrid, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "../lib/utils";
import type { Messages } from "../i18n";
import type { Asset, Template } from "../types";

interface LibraryViewProps {
  assets: Asset[];
  currentCoverImage: string;
  isApplyingAsset: boolean;
  onApplyAsset: (asset: Asset) => void;
  onApplyTemplate: (templateId: string) => void;
  onSelectAsset: (assetId: string) => void;
  onSelectCategory: (category: string) => void;
  selectedAssetCategory: string;
  selectedAssetId: string;
  t: Messages;
  templates: Template[];
}

export function LibraryView({
  assets,
  currentCoverImage,
  isApplyingAsset,
  onApplyAsset,
  onApplyTemplate,
  onSelectAsset,
  onSelectCategory,
  selectedAssetCategory,
  selectedAssetId,
  t,
  templates,
}: LibraryViewProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const categories = useMemo(
    () => [t.library.allCategories, ...new Set(assets.map((asset) => asset.category))],
    [assets, t.library.allCategories],
  );

  const visibleAssets = useMemo(() => {
    if (selectedAssetCategory === "all") {
      return assets;
    }

    return assets.filter((asset) => asset.category === selectedAssetCategory);
  }, [assets, selectedAssetCategory]);

  return (
    <section className="w-full max-w-none gpu-surface contain-paint">
      <header className="library-template-toggle-header flex items-start justify-between gap-6 p-10 px-12 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="studio-title">{t.library.visualIngredients}</h3>
          <p className="studio-lead">{t.library.waterfallLead}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category, index) => {
              const value = index === 0 ? "all" : category;
              const isSelected = selectedAssetCategory === value;

              return (
                <button
                  key={value}
                  aria-pressed={isSelected}
                  className={cn(
                    "focus-ring rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                    isSelected
                      ? "is-selected border-primary/20 bg-primary/8 text-primary"
                      : "border-outline-variant/10 bg-surface-container-highest/50 text-on-surface-variant/60 hover:bg-primary/5 hover:text-primary",
                  )}
                  onClick={() => onSelectCategory(value)}
                  type="button"
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="focus-ring mt-1 shrink-0 self-start p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 vellum-shadow text-on-surface-variant hover:text-primary hover:scale-105 transition-all"
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          title={isSidebarVisible ? "Hide Templates" : "Show Templates"}
          type="button"
        >
          {isSidebarVisible ? (
            <PanelRightClose size={24} />
          ) : (
            <PanelRightOpen size={24} />
          )}
        </button>
      </header>

      <div className="flex w-full items-start gap-0 transition-all duration-700 ease-in-out">
        <div className="flex-1 min-w-0 transition-all duration-700">
          {visibleAssets.length ? (
            <div className="library-grid-tiled w-full">
              {visibleAssets.map((asset) => {
                const isSelected = selectedAssetId === asset.id;
                const isApplied = currentCoverImage === asset.image;

                return (
                  <article
                    className={cn(
                      "library-asset-card group relative overflow-hidden rounded-3xl",
                      isSelected && "is-selected",
                    )}
                    key={asset.id}
                  >
                    <button
                      aria-pressed={isSelected}
                      className="focus-ring absolute inset-0 z-10"
                      onClick={() => onSelectAsset(asset.id)}
                      type="button"
                    >
                      <span className="sr-only">{asset.name}</span>
                    </button>
                    <img
                      alt={asset.name}
                      className="w-full h-auto group-hover:scale-110 transition-transform duration-700"
                      src={asset.image}
                    />
                    <div className="library-asset-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent text-white">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        {asset.category}
                      </span>
                      <strong className="text-xl font-headline font-bold leading-tight mb-1">
                        {asset.name}
                      </strong>
                      <p className="text-xs text-white/70 italic line-clamp-2 mb-4 leading-relaxed">
                        {asset.description}
                      </p>
                      <div className="library-asset-actions flex items-center justify-between gap-3">
                        <button
                          className={cn(
                            "focus-ring relative z-20 px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all btn-nowrap",
                            isApplied
                              ? "is-success border-white/40 bg-white/90 text-on-surface"
                              : "bg-white/20 hover:bg-white/40 border-white/10 text-white",
                            isApplyingAsset && isSelected && "is-busy",
                          )}
                          disabled={isApplied || (isApplyingAsset && isSelected)}
                          onClick={() => onApplyAsset(asset)}
                          type="button"
                        >
                          {isApplied
                            ? t.actions.applied
                            : isApplyingAsset && isSelected
                              ? t.actions.working
                              : t.actions.applyAsCover}
                        </button>
                        <small className="text-[10px] text-white/50">
                          {asset.creator} · {asset.likes} {t.library.likesSuffix}
                        </small>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">{t.library.emptyFiltered}</div>
          )}
        </div>

        <aside
          className={cn(
            "surface-card flex flex-col gap-6 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) will-change-width gpu-surface flex-shrink-0",
            isSidebarVisible
              ? "w-[300px] p-6 opacity-100 ml-10"
              : "w-0 p-0 opacity-0 ml-0 border-0 overflow-hidden pointer-events-none sidebar-closing shadow-none",
          )}
        >
          <div
            className={cn(
              "transition-opacity duration-200",
              isSidebarVisible ? "opacity-100 delay-500" : "opacity-0",
            )}
          >
            <div className="panel-header library-panel-header">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <LayoutGrid size={18} className="text-primary/70 shrink-0" />
                  <p className="eyebrow m-0 text-[10px] tracking-[0.2em]">
                    {t.library.readyTemplates}
                  </p>
                </div>
                <h4 className="text-2xl font-headline font-bold text-on-surface leading-tight">
                  {t.library.applyVocabulary}
                </h4>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "library-template-stack grid gap-4 overflow-y-auto no-scrollbar max-h-[calc(100vh-320px)] transition-opacity duration-200",
              isSidebarVisible ? "opacity-100 delay-600" : "opacity-0",
            )}
          >
            {templates.map((template) => (
              <article className="library-template-card" key={template.id}>
                <img alt={template.name} src={template.previewImage} />
                <div className="library-template-copy">
                  <strong>{template.name}</strong>
                  <p>{template.summary}</p>
                  <button
                    className="btn btn-primary focus-ring"
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
