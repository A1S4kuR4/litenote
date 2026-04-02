import {
  AlignCenter,
  AlignLeft,
  Archive,
  BookOpen,
  Heart,
  Plus,
  Save,
  Settings2,
} from "lucide-react";
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { Messages } from "../i18n";
import { cn } from "../lib/utils";
import type {
  AppLanguage,
  Asset,
  JournalAlignMode,
  JournalDensityMode,
  JournalFontMode,
  JournalInspectorTab,
  Note,
  NoteDraft,
  NoteMood,
  NoteSummary,
  Template,
} from "../types";

type NoteBusyAction = "create" | "save" | "favorite" | "archive" | "apply-asset" | null;

interface JournalViewProps {
  activeNote: Note | null;
  activeTemplate: Template | null;
  assets: Asset[];
  currentCoverImage: string;
  draft: NoteDraft | null;
  formatDate: (value: string, language: AppLanguage) => string;
  isDirty: boolean;
  isSaveSuccessful: boolean;
  journalAlignMode: JournalAlignMode;
  journalDensityMode: JournalDensityMode;
  journalFontMode: JournalFontMode;
  journalInspectorTab: JournalInspectorTab;
  journalInspectorVisible: boolean;
  language: AppLanguage;
  moodLabel: (mood: NoteMood) => string;
  noteBusyAction: NoteBusyAction;
  selectedAssetId: string;
  setDraft: Dispatch<SetStateAction<NoteDraft | null>>;
  setJournalAlignMode: Dispatch<SetStateAction<JournalAlignMode>>;
  setJournalDensityMode: Dispatch<SetStateAction<JournalDensityMode>>;
  setJournalFontMode: Dispatch<SetStateAction<JournalFontMode>>;
  setJournalInspectorTab: Dispatch<SetStateAction<JournalInspectorTab>>;
  setJournalInspectorVisible: Dispatch<SetStateAction<boolean>>;
  spotlightImage: string;
  statusLabel: (status: Note["status"]) => string;
  t: Messages;
  templates: Template[];
  visibleNotes: NoteSummary[];
  onApplyAsset: (asset: Asset) => void;
  onArchive: () => void;
  onCreateNote: () => void;
  onSave: () => void;
  onSelectAsset: (assetId: string) => void;
  onSelectNote: (note: NoteSummary) => void;
  onToggleFavorite: () => void;
}

export function JournalView({
  activeNote,
  activeTemplate,
  assets,
  currentCoverImage,
  draft,
  formatDate,
  isDirty,
  isSaveSuccessful,
  journalAlignMode,
  journalDensityMode,
  journalFontMode,
  journalInspectorTab,
  journalInspectorVisible,
  language,
  moodLabel,
  noteBusyAction,
  selectedAssetId,
  setDraft,
  setJournalAlignMode,
  setJournalDensityMode,
  setJournalFontMode,
  setJournalInspectorTab,
  setJournalInspectorVisible,
  spotlightImage,
  statusLabel,
  t,
  templates,
  visibleNotes,
  onApplyAsset,
  onArchive,
  onCreateNote,
  onSave,
  onSelectAsset,
  onSelectNote,
  onToggleFavorite,
}: JournalViewProps) {
  const titleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pageImage = currentCoverImage || activeTemplate?.previewImage || spotlightImage;
  const isBusy = noteBusyAction !== null;
  const isSaving = noteBusyAction === "save";
  const isFavoriting = noteBusyAction === "favorite";
  const isArchiving = noteBusyAction === "archive";
  const isApplyingAsset = noteBusyAction === "apply-asset";
  const canSave = Boolean(activeNote) && !isBusy && isDirty;
  const canFavorite = Boolean(activeNote) && !isBusy;
  const canArchive = Boolean(activeNote) && !isBusy && !isDirty;

  useEffect(() => {
    const titleField = titleInputRef.current;
    if (!titleField) {
      return;
    }

    titleField.style.height = "0px";
    titleField.style.height = `${titleField.scrollHeight}px`;
  }, [draft?.title]);

  return (
    <div className="flex min-h-screen animate-in fade-in duration-500">
      <aside className="fixed left-64 top-24 bottom-8 w-24 flex flex-col items-center gap-6 p-4 z-30">
        <button
          className={cn("focus-ring flex flex-col items-center gap-1 group", isBusy && "is-disabled")}
          disabled={isBusy}
          onClick={onCreateNote}
          type="button"
        >
          <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center text-primary vellum-shadow group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            {t.actions.new}
          </span>
        </button>

        <button
          className={cn(
            "focus-ring flex flex-col items-center gap-1 group",
            !canSave && !isSaveSuccessful && "is-disabled",
          )}
          disabled={!canSave}
          onClick={onSave}
          type="button"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center vellum-shadow transition-transform",
              canSave && "text-primary group-hover:scale-110",
              !canSave && !isSaveSuccessful && "text-on-surface-variant/50",
              isSaveSuccessful && "is-success text-primary",
            )}
          >
            <Save size={18} className={cn(isSaving && "animate-spin")} />
          </div>
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            {isSaving
              ? t.actions.working
              : isSaveSuccessful
                ? t.actions.saved
                : t.actions.save}
          </span>
        </button>

        <button
          aria-pressed={activeNote?.isFavorite ?? false}
          className={cn("focus-ring flex flex-col items-center gap-1 group", !canFavorite && "is-disabled")}
          disabled={!canFavorite}
          onClick={onToggleFavorite}
          type="button"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center vellum-shadow transition-transform",
              activeNote?.isFavorite ? "text-error" : "text-on-surface-variant",
              canFavorite && "group-hover:scale-110",
            )}
          >
            <Heart
              fill={activeNote?.isFavorite ? "currentColor" : "none"}
              size={18}
              className={cn(isFavoriting && "animate-pulse")}
            />
          </div>
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            {t.actions.favorite}
          </span>
        </button>

        <button
          className={cn("focus-ring flex flex-col items-center gap-1 group", !canArchive && "is-disabled")}
          disabled={!canArchive}
          onClick={onArchive}
          type="button"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center text-on-surface-variant vellum-shadow transition-transform",
              canArchive && "group-hover:scale-110",
            )}
          >
            <Archive size={18} className={cn(isArchiving && "animate-pulse")} />
          </div>
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            {t.actions.archive}
          </span>
        </button>

        <button
          aria-pressed={journalInspectorVisible}
          className="focus-ring mt-auto flex flex-col items-center gap-1 group"
          onClick={() => setJournalInspectorVisible(!journalInspectorVisible)}
          type="button"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center vellum-shadow group-hover:scale-110 transition-transform",
              journalInspectorVisible ? "text-primary" : "text-on-surface-variant",
            )}
          >
            <Settings2 size={18} />
          </div>
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 text-center">
            {journalInspectorVisible ? t.actions.closeInspector : t.actions.openInspector}
          </span>
        </button>
      </aside>

      <main className="flex-1 ml-24 mr-[360px] p-8 space-y-8">
        <div className="mx-auto max-w-3xl flex items-center justify-between bg-surface-container/40 backdrop-blur-md px-6 py-2 rounded-2xl border border-outline-variant/5">
          <div className="flex items-center gap-1">
            <button
              aria-pressed={journalFontMode === "editorial"}
              className={cn(
                "focus-ring px-4 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
                journalFontMode === "editorial"
                  ? "bg-white text-primary vellum-shadow"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
              onClick={() => setJournalFontMode("editorial")}
              type="button"
            >
              {t.journal.fontEditorial}
            </button>
            <button
              aria-pressed={journalFontMode === "modern"}
              className={cn(
                "focus-ring px-4 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
                journalFontMode === "modern"
                  ? "bg-white text-primary vellum-shadow"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
              onClick={() => setJournalFontMode("modern")}
              type="button"
            >
              {t.journal.fontModern}
            </button>
          </div>

          <div className="h-4 w-px bg-outline-variant/20 mx-4" />

          <div className="flex items-center gap-1 flex-1">
            <button
              aria-pressed={journalDensityMode === "comfortable"}
              className={cn(
                "focus-ring px-4 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
                journalDensityMode === "comfortable"
                  ? "bg-white text-primary vellum-shadow"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
              onClick={() => setJournalDensityMode("comfortable")}
              type="button"
            >
              {t.journal.sizeComfortable}
            </button>
            <button
              aria-pressed={journalDensityMode === "immersive"}
              className={cn(
                "focus-ring px-4 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
                journalDensityMode === "immersive"
                  ? "bg-white text-primary vellum-shadow"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
              onClick={() => setJournalDensityMode("immersive")}
              type="button"
            >
              {t.journal.sizeImmersive}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              aria-pressed={journalAlignMode === "left"}
              className={cn(
                "focus-ring p-2 rounded-lg transition-all",
                journalAlignMode === "left"
                  ? "bg-white text-primary vellum-shadow"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
              onClick={() => setJournalAlignMode("left")}
              type="button"
            >
              <AlignLeft size={16} />
            </button>
            <button
              aria-pressed={journalAlignMode === "center"}
              className={cn(
                "focus-ring p-2 rounded-lg transition-all",
                journalAlignMode === "center"
                  ? "bg-white text-primary vellum-shadow"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
              onClick={() => setJournalAlignMode("center")}
              type="button"
            >
              <AlignCenter size={16} />
            </button>
          </div>
        </div>

        {draft && activeNote ? (
          <article
            className={cn(
              "mx-auto max-w-3xl bg-surface-container-lowest rounded-sm vellum-shadow overflow-hidden relative group",
              journalAlignMode === "center" ? "text-center" : "text-left",
            )}
          >
            <div className="absolute inset-0 washi-texture opacity-20 pointer-events-none" />

            <div className="h-[400px] overflow-hidden relative">
              <img
                alt={activeNote.title}
                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000"
                src={pageImage}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
            </div>

            <div
              className={cn(
                "p-16 md:p-24 space-y-12 relative z-10",
                journalDensityMode === "immersive" ? "p-12 md:p-16" : "p-16 md:p-24",
                journalFontMode === "modern" && "journal-font-modern",
              )}
            >
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-8">
                <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {activeTemplate?.name ?? t.journal.untitledTemplate}
                </span>
                <span className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                  {formatDate(activeNote.updatedAt, language)}
                </span>
              </div>

              <textarea
                ref={titleInputRef}
                className={cn(
                  "journal-title-input w-full font-headline text-5xl font-bold leading-tight",
                  journalAlignMode === "center" ? "text-center" : "text-left",
                )}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          title: event.target.value,
                        }
                      : null,
                  )
                }
                onInput={(event) => {
                  event.currentTarget.style.height = "0px";
                  event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
                }}
                placeholder={t.journal.entryTitle}
                rows={1}
                value={draft.title}
              />

              <textarea
                className={cn(
                  "journal-body-input w-full h-[600px] font-body text-xl leading-relaxed text-on-surface-variant resize-none",
                  journalAlignMode === "center" ? "text-center" : "text-left",
                )}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          body: event.target.value,
                        }
                      : null,
                  )
                }
                placeholder={t.journal.bodyPlaceholder}
                value={draft.body}
              />

              <div className="pt-12 border-t border-outline-variant/10 grid grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      {t.journal.mood}
                    </span>
                    <select
                      className="focus-ring w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 font-label text-xs"
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                mood: event.target.value as NoteMood,
                              }
                            : null,
                        )
                      }
                      value={draft.mood}
                    >
                      <option value="calm">{t.moods.calm}</option>
                      <option value="focused">{t.moods.focused}</option>
                      <option value="bright">{t.moods.bright}</option>
                      <option value="reflective">{t.moods.reflective}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      {t.journal.template}
                    </span>
                    <select
                      className="focus-ring w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 font-label text-xs"
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                templateId: event.target.value,
                              }
                            : null,
                        )
                      }
                      value={draft.templateId}
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      {t.journal.status}
                    </span>
                    <select
                      className="focus-ring w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 font-label text-xs"
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                status: event.target.value as Note["status"],
                              }
                            : null,
                        )
                      }
                      value={draft.status}
                    >
                      <option value="draft">{t.statuses.draft}</option>
                      <option value="published">{t.statuses.published}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      {t.journal.tags}
                    </span>
                    <input
                      className="focus-ring w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 font-label text-xs"
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                tags: event.target.value,
                              }
                            : null,
                        )
                      }
                      placeholder="travel, art, thoughts"
                      value={draft.tags}
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 opacity-40">
              <BookOpen className="mx-auto" size={48} />
              <p className="font-body text-xl italic">{t.journal.empty}</p>
            </div>
          </div>
        )}
      </main>

      <aside
        className={cn(
          "fixed right-0 top-24 bottom-0 w-[360px] bg-surface-container border-l border-outline-variant/5 p-6 flex flex-col gap-8 transition-transform duration-500",
          !journalInspectorVisible && "translate-x-full",
        )}
      >
        <div className="flex p-1 bg-surface-container-highest rounded-xl">
          <button
            aria-pressed={journalInspectorTab === "entry-info"}
            className={cn(
              "focus-ring flex-1 py-2 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
              journalInspectorTab === "entry-info"
                ? "bg-white text-primary vellum-shadow"
                : "text-on-surface-variant hover:text-on-surface",
            )}
            onClick={() => setJournalInspectorTab("entry-info")}
            type="button"
          >
            {t.journal.entryInfo}
          </button>
          <button
            aria-pressed={journalInspectorTab === "visual-assets"}
            className={cn(
              "focus-ring flex-1 py-2 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
              journalInspectorTab === "visual-assets"
                ? "bg-white text-primary vellum-shadow"
                : "text-on-surface-variant hover:text-on-surface",
            )}
            onClick={() => setJournalInspectorTab("visual-assets")}
            type="button"
          >
            {t.journal.visualAssets}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-12">
          {journalInspectorTab === "entry-info" ? (
            <>
              <section className="space-y-6">
                <div className="space-y-1">
                  <span className="font-label uppercase tracking-widest text-[10px] font-bold text-primary">
                    {t.journal.notesShelf}
                  </span>
                  <h4 className="font-headline text-2xl font-bold">
                    {visibleNotes.length} {t.journal.entries}
                  </h4>
                </div>

                <div className="space-y-4">
                  {visibleNotes.map((note) => (
                    <button
                      key={note.id}
                      aria-pressed={note.id === activeNote?.id}
                      className={cn(
                        "focus-ring w-full text-left p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 vellum-shadow transition-all group",
                        note.id === activeNote?.id
                          ? "is-selected ring-2 ring-primary/20 border-primary/40"
                          : "hover:border-primary/20",
                      )}
                      onClick={() => onSelectNote(note)}
                      type="button"
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            alt={note.title}
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                            src={note.coverImage || spotlightImage}
                          />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">
                            {note.title}
                          </h5>
                          <p className="font-body text-xs text-on-surface-variant line-clamp-2 italic">
                            {note.summary}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {activeNote ? (
                <section className="p-6 bg-primary/5 rounded-3xl space-y-6">
                  <div className="space-y-2">
                    <span className="font-label uppercase tracking-widest text-[10px] font-bold text-primary">
                      {t.journal.selectedEntry}
                    </span>
                    <h4 className="font-headline text-xl font-bold italic">
                      "{activeNote.title}"
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/60 rounded-2xl">
                      <span className="block font-label text-[8px] uppercase text-on-surface-variant/60 mb-1">
                        {t.journal.mood}
                      </span>
                      <strong className="font-headline text-lg italic text-primary">
                        {moodLabel(activeNote.mood)}
                      </strong>
                    </div>
                    <div className="p-4 bg-white/60 rounded-2xl">
                      <span className="block font-label text-[8px] uppercase text-on-surface-variant/60 mb-1">
                        {t.journal.status}
                      </span>
                      <strong className="font-headline text-lg italic text-primary">
                        {statusLabel(activeNote.status)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/80 rounded-full font-label text-[8px] font-bold uppercase tracking-widest text-primary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <section className="space-y-8">
              <div className="space-y-2">
                <span className="font-label uppercase tracking-widest text-[10px] font-bold text-primary">
                  {t.journal.moodBoard}
                </span>
                <h4 className="font-headline text-2xl font-bold">
                  {t.journal.visualAssets}
                </h4>
                <p className="font-body text-sm text-on-surface-variant">
                  {t.journal.applyCoverHint}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {assets.length ? (
                  assets.map((asset) => {
                    const isSelected = selectedAssetId === asset.id;
                    const isApplied = currentCoverImage === asset.image;

                    return (
                      <article
                        key={asset.id}
                        className={cn(
                          "group relative rounded-3xl overflow-hidden vellum-shadow border border-outline-variant/10",
                          isSelected && "is-selected border-primary/30",
                        )}
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
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                          src={asset.image}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white z-20">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="font-label text-[8px] uppercase tracking-widest text-white/60">
                                {asset.category}
                              </span>
                              <h5 className="font-headline font-bold text-lg leading-tight">
                                {asset.name}
                              </h5>
                            </div>
                            <button
                              className={cn(
                                "focus-ring rounded-xl border px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-all",
                                isApplied
                                  ? "is-success border-white/50 bg-white/90 text-on-surface"
                                  : "bg-white/20 hover:bg-white/35 border-white/10 text-white",
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
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="empty-state">{t.library.emptyFiltered}</div>
                )}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
