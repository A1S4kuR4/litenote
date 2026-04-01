import {
  AlignCenter,
  AlignLeft,
  Archive,
  BookOpen,
  Heart,
  Image as ImageIcon,
  Plus,
  Save,
  Settings2,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { Messages } from "../i18n";
import { cn } from "../lib/utils";
import type {
  AppLanguage,
  DashboardResponse,
  JournalAlignMode,
  JournalDensityMode,
  JournalFontMode,
  JournalInspectorTab,
  Note,
  NoteDraft,
  NoteMood,
  Template,
} from "../types";

interface JournalViewProps {
  activeNote: Note | null;
  activeTemplate: Template | null;
  dashboard: DashboardResponse;
  draft: NoteDraft | null;
  formatDate: (value: string, language: AppLanguage) => string;
  journalAlignMode: JournalAlignMode;
  journalDensityMode: JournalDensityMode;
  journalFontMode: JournalFontMode;
  journalInspectorTab: JournalInspectorTab;
  journalInspectorVisible: boolean;
  language: AppLanguage;
  moodLabel: (mood: NoteMood) => string;
  saving: boolean;
  setDraft: Dispatch<SetStateAction<NoteDraft | null>>;
  setJournalAlignMode: Dispatch<SetStateAction<JournalAlignMode>>;
  setJournalDensityMode: Dispatch<SetStateAction<JournalDensityMode>>;
  setJournalFontMode: Dispatch<SetStateAction<JournalFontMode>>;
  setJournalInspectorTab: Dispatch<SetStateAction<JournalInspectorTab>>;
  setJournalInspectorVisible: Dispatch<SetStateAction<boolean>>;
  statusLabel: (status: Note["status"]) => string;
  t: Messages;
  visibleNotes: Note[];
  onArchive: () => void;
  onCreateNote: () => void;
  onSave: () => void;
  onSelectNote: (note: Note) => void;
  onToggleFavorite: () => void;
}

export function JournalView({
  activeNote,
  activeTemplate,
  dashboard,
  draft,
  formatDate,
  journalAlignMode,
  journalDensityMode,
  journalFontMode,
  journalInspectorTab,
  journalInspectorVisible,
  language,
  moodLabel,
  saving,
  setDraft,
  setJournalAlignMode,
  setJournalDensityMode,
  setJournalFontMode,
  setJournalInspectorTab,
  setJournalInspectorVisible,
  statusLabel,
  t,
  visibleNotes,
  onArchive,
  onCreateNote,
  onSave,
  onSelectNote,
  onToggleFavorite,
}: JournalViewProps) {
  const pageImage =
    activeNote?.coverImage ?? activeTemplate?.previewImage ?? dashboard.spotlight.image;

  return (
    <div className="flex min-h-screen animate-in fade-in duration-500">
      {/* 1. Action Rail */}
      <aside className="fixed left-64 top-24 bottom-8 w-24 flex flex-col items-center gap-6 p-4 z-30">
        <button 
          className="flex flex-col items-center gap-1 group"
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
          className="flex flex-col items-center gap-1 group"
          onClick={onSave}
          type="button"
        >
          <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center text-on-surface-variant vellum-shadow group-hover:scale-110 transition-transform">
            <Save size={18} className={cn(saving && "animate-spin")} />
          </div>
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            {saving ? t.actions.working : t.actions.save}
          </span>
        </button>

        <button 
          className="flex flex-col items-center gap-1 group"
          onClick={onToggleFavorite}
          type="button"
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center vellum-shadow group-hover:scale-110 transition-transform",
            activeNote?.isFavorite ? "text-error" : "text-on-surface-variant"
          )}>
            <Heart size={18} fill={activeNote?.isFavorite ? "currentColor" : "none"} />
          </div>
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            {t.actions.favorite}
          </span>
        </button>

        <button 
          className="flex flex-col items-center gap-1 group"
          onClick={onArchive}
          type="button"
        >
          <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center text-on-surface-variant vellum-shadow group-hover:scale-110 transition-transform">
            <Archive size={18} />
          </div>
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            {t.actions.archive}
          </span>
        </button>

        <button 
          className="mt-auto flex flex-col items-center gap-1 group"
          onClick={() => setJournalInspectorVisible(!journalInspectorVisible)}
          type="button"
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center vellum-shadow group-hover:scale-110 transition-transform",
            journalInspectorVisible ? "text-primary" : "text-on-surface-variant"
          )}>
            <Settings2 size={18} />
          </div>
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 text-center">
            {journalInspectorVisible ? "关闭面板" : "展开面板"}
          </span>
        </button>
      </aside>

      {/* 2. Editor Stage */}
      <main className="flex-1 ml-24 mr-[360px] p-8 space-y-8">
        {/* Editor Toolbar */}
        <div className="mx-auto max-w-3xl flex items-center justify-between bg-surface-container/40 backdrop-blur-md px-6 py-2 rounded-2xl border border-outline-variant/5">
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "px-4 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
                journalFontMode === "editorial" ? "bg-white text-primary vellum-shadow" : "text-on-surface-variant hover:text-on-surface"
              )}
              onClick={() => setJournalFontMode("editorial")}
            >
              {t.journal.fontEditorial}
            </button>
            <button
              className={cn(
                "px-4 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
                journalFontMode === "modern" ? "bg-white text-primary vellum-shadow" : "text-on-surface-variant hover:text-on-surface"
              )}
              onClick={() => setJournalFontMode("modern")}
            >
              {t.journal.fontModern}
            </button>
          </div>

          <div className="h-4 w-px bg-outline-variant/20 mx-4" />

          <div className="flex items-center gap-1 flex-1">
            <button
              className={cn(
                "px-4 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
                journalDensityMode === "comfortable" ? "bg-white text-primary vellum-shadow" : "text-on-surface-variant hover:text-on-surface"
              )}
              onClick={() => setJournalDensityMode("comfortable")}
            >
              {t.journal.sizeComfortable}
            </button>
            <button
              className={cn(
                "px-4 py-1.5 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
                journalDensityMode === "immersive" ? "bg-white text-primary vellum-shadow" : "text-on-surface-variant hover:text-on-surface"
              )}
              onClick={() => setJournalDensityMode("immersive")}
            >
              {t.journal.sizeImmersive}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              className={cn(
                "p-2 rounded-lg transition-all",
                journalAlignMode === "left" ? "bg-white text-primary vellum-shadow" : "text-on-surface-variant"
              )}
              onClick={() => setJournalAlignMode("left")}
            >
              <AlignLeft size={16} />
            </button>
            <button
              className={cn(
                "p-2 rounded-lg transition-all",
                journalAlignMode === "center" ? "bg-white text-primary vellum-shadow" : "text-on-surface-variant"
              )}
              onClick={() => setJournalAlignMode("center")}
            >
              <AlignCenter size={16} />
            </button>
          </div>
        </div>

        {/* Paper Editor */}
        {draft && activeNote ? (
          <article className={cn(
            "mx-auto max-w-3xl bg-surface-container-lowest rounded-sm vellum-shadow overflow-hidden relative group",
            journalFontMode === 'editorial' ? 'font-headline' : 'font-label',
            journalAlignMode === 'center' ? 'text-center' : 'text-left'
          )}>
            <div className="absolute inset-0 washi-texture opacity-20 pointer-events-none"></div>
            
            {/* Paper Header Image */}
            <div className="h-[400px] overflow-hidden relative">
              <img 
                alt={activeNote.title} 
                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000" 
                src={pageImage} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
            </div>

            <div className={cn(
              "p-16 md:p-24 space-y-12 relative z-10",
              journalDensityMode === 'immersive' ? 'p-12 md:p-16' : 'p-16 md:p-24'
            )}>
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-8">
                <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {activeTemplate?.name ?? "Monochrome Focus"}
                </span>
                <span className="font-label text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                  {formatDate(activeNote.updatedAt, language)}
                </span>
              </div>

              <input
                className={cn(
                  "w-full bg-transparent border-none focus:ring-0 font-headline text-5xl font-bold leading-tight placeholder:text-on-surface-variant/20",
                  journalAlignMode === 'center' ? 'text-center' : 'text-left'
                )}
                value={draft.title}
                onChange={(e) => setDraft(current => current ? {...current, title: e.target.value} : null)}
                placeholder={t.journal.entryTitle}
              />

              <textarea
                className={cn(
                  "w-full h-[600px] bg-transparent border-none focus:ring-0 font-body text-xl leading-relaxed text-on-surface-variant placeholder:text-on-surface-variant/10 resize-none",
                  journalAlignMode === 'center' ? 'text-center' : 'text-left'
                )}
                value={draft.body}
                onChange={(e) => setDraft(current => current ? {...current, body: e.target.value} : null)}
                placeholder={t.journal.bodyPlaceholder}
              />

              {/* Metadata Form */}
              <div className="pt-12 border-t border-outline-variant/10 grid grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      {t.journal.mood}
                    </span>
                    <select 
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 font-label text-xs focus:ring-primary/20"
                      value={draft.mood}
                      onChange={(e) => setDraft(current => current ? {...current, mood: e.target.value as NoteMood} : null)}
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
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 font-label text-xs focus:ring-primary/20"
                      value={draft.templateId}
                      onChange={(e) => setDraft(current => current ? {...current, templateId: e.target.value} : null)}
                    >
                      {dashboard.templates.map(tmp => <option key={tmp.id} value={tmp.id}>{tmp.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      {t.journal.status}
                    </span>
                    <select 
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 font-label text-xs focus:ring-primary/20"
                      value={draft.status}
                      onChange={(e) => setDraft(current => current ? {...current, status: e.target.value as Note['status']} : null)}
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
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-2 font-label text-xs focus:ring-primary/20"
                      value={draft.tags}
                      onChange={(e) => setDraft(current => current ? {...current, tags: e.target.value} : null)}
                      placeholder="travel, art, thoughts"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 opacity-40">
              <BookOpen size={48} className="mx-auto" />
              <p className="font-body text-xl italic">{t.journal.empty}</p>
            </div>
          </div>
        )}
      </main>

      {/* 3. Inspector Panel */}
      <aside className={cn(
        "fixed right-0 top-24 bottom-0 w-[360px] bg-surface-container border-l border-outline-variant/5 p-6 flex flex-col gap-8 transition-transform duration-500",
        !journalInspectorVisible && "translate-x-full"
      )}>
        <div className="flex p-1 bg-surface-container-highest rounded-xl">
          <button 
            className={cn(
              "flex-1 py-2 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
              journalInspectorTab === 'entry-info' ? "bg-white text-primary vellum-shadow" : "text-on-surface-variant hover:text-on-surface"
            )}
            onClick={() => setJournalInspectorTab('entry-info')}
          >
            {t.journal.entryInfo}
          </button>
          <button 
            className={cn(
              "flex-1 py-2 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all",
              journalInspectorTab === 'visual-assets' ? "bg-white text-primary vellum-shadow" : "text-on-surface-variant hover:text-on-surface"
            )}
            onClick={() => setJournalInspectorTab('visual-assets')}
          >
            {t.journal.visualAssets}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-12">
          {journalInspectorTab === 'entry-info' ? (
            <>
              <section className="space-y-6">
                <div className="space-y-1">
                  <span className="font-label uppercase tracking-widest text-[10px] font-bold text-primary">
                    {t.journal.notesShelf}
                  </span>
                  <h4 className="font-headline text-2xl font-bold">{visibleNotes.length} {t.journal.entries}</h4>
                </div>

                <div className="space-y-4">
                  {visibleNotes.map((note) => (
                    <button
                      key={note.id}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 vellum-shadow transition-all group",
                        note.id === activeNote?.id ? "ring-2 ring-primary/20 border-primary/40" : "hover:border-primary/20"
                      )}
                      onClick={() => onSelectNote(note)}
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img alt={note.title} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" src={note.coverImage || dashboard.spotlight.image} />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{note.title}</h5>
                          <p className="font-body text-xs text-on-surface-variant line-clamp-2 italic">{note.summary}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {activeNote && (
                <section className="p-6 bg-primary/5 rounded-3xl space-y-6">
                  <div className="space-y-2">
                    <span className="font-label uppercase tracking-widest text-[10px] font-bold text-primary">
                      {t.journal.selectedEntry}
                    </span>
                    <h4 className="font-headline text-xl font-bold italic">"{activeNote.title}"</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/60 rounded-2xl">
                      <span className="block font-label text-[8px] uppercase text-on-surface-variant/60 mb-1">{t.journal.mood}</span>
                      <strong className="font-headline text-lg italic text-primary">{moodLabel(activeNote.mood)}</strong>
                    </div>
                    <div className="p-4 bg-white/60 rounded-2xl">
                      <span className="block font-label text-[8px] uppercase text-on-surface-variant/60 mb-1">{t.journal.status}</span>
                      <strong className="font-headline text-lg italic text-primary">{statusLabel(activeNote.status)}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeNote.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/80 rounded-full font-label text-[8px] font-bold uppercase tracking-widest text-primary">#{tag}</span>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <section className="space-y-8">
              <div className="space-y-1">
                <span className="font-label uppercase tracking-widest text-[10px] font-bold text-primary">
                  {t.journal.moodBoard}
                </span>
                <h4 className="font-headline text-2xl font-bold">{t.journal.visualAssets}</h4>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {dashboard.assets.map(asset => (
                  <article key={asset.id} className="group relative rounded-3xl overflow-hidden vellum-shadow border border-outline-variant/10">
                    <img alt={asset.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" src={asset.image} />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                      <span className="font-label text-[8px] uppercase tracking-widest text-white/60">{asset.category}</span>
                      <h5 className="font-headline font-bold text-lg leading-tight">{asset.name}</h5>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
