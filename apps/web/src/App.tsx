import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  archiveNote,
  createNote,
  fetchAssets,
  fetchDashboard,
  fetchNote,
  fetchNotes,
  fetchTemplates,
  fetchWorkshopPresets,
  toggleFavorite,
  updateNote,
} from "./api";
import { messages } from "./i18n";
import type { Messages } from "./i18n";
import { AppShell } from "./components/AppShell";
import { DiscoverView } from "./views/DiscoverView";
import { JournalView } from "./views/JournalView";
import { LibraryView } from "./views/LibraryView";
import { SettingsView } from "./views/SettingsView";
import { WorkshopView } from "./views/WorkshopView";
import type {
  AppLanguage,
  AppView,
  Asset,
  DashboardResponse,
  JournalAlignMode,
  JournalDensityMode,
  JournalFontMode,
  JournalInspectorTab,
  Note,
  NoteDraft,
  NoteMood,
  NoteSummary,
  PreviewZoomLevel,
  Template,
  WorkshopPreset,
} from "./types";

const LANGUAGE_STORAGE_KEY = "litenote-language";

type ErrorKey = keyof Messages["errors"] | "";

function toDraft(note: Note): NoteDraft {
  return {
    title: note.title,
    body: note.body,
    tags: note.tags.join(", "),
    mood: note.mood,
    templateId: note.templateId,
    status: note.status,
  };
}

function formatDate(value: string, language: AppLanguage): string {
  const locale = language === "zh" ? "zh-CN" : "en";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function readInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return "zh";
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "en" ? "en" : "zh";
}

function sortDashboardNotes(notes: Note[]): Note[] {
  return [...notes].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function buildDashboardStats(
  notes: Note[],
  templateCount: number,
  assetCount: number,
) {
  return {
    totalNotes: notes.length,
    publishedNotes: notes.filter((note) => note.status === "published").length,
    favoriteNotes: notes.filter((note) => note.isFavorite).length,
    templates: templateCount,
    assets: assetCount,
  };
}

function syncDashboardWithNote(
  current: DashboardResponse | null,
  note: Note,
): DashboardResponse | null {
  if (!current) {
    return current;
  }

  const existingNotes = current.notes.filter((currentNote) => currentNote.id !== note.id);
  const nextNotes = note.isArchived
    ? existingNotes
    : sortDashboardNotes([note, ...existingNotes]);

  return {
    ...current,
    notes: nextNotes,
    stats: buildDashboardStats(
      nextNotes,
      current.templates.length,
      current.assets.length,
    ),
  };
}

export default function App() {
  const [view, setView] = useState<AppView>("discover");
  const [language, setLanguage] = useState<AppLanguage>(readInitialLanguage);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [workshopPresets, setWorkshopPresets] = useState<WorkshopPreset[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<ErrorKey>("");
  const [journalInspectorTab, setJournalInspectorTab] =
    useState<JournalInspectorTab>("entry-info");
  const [journalInspectorVisible, setJournalInspectorVisible] = useState(true);
  const [journalFontMode, setJournalFontMode] =
    useState<JournalFontMode>("editorial");
  const [journalAlignMode, setJournalAlignMode] =
    useState<JournalAlignMode>("left");
  const [journalDensityMode, setJournalDensityMode] =
    useState<JournalDensityMode>("comfortable");
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [previewZoom, setPreviewZoom] = useState<PreviewZoomLevel>(100);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const deferredSearch = useDeferredValue(search);
  const hasLoadedWorkspaceRef = useRef(false);
  const notesRequestRef = useRef(0);
  const noteRequestRef = useRef(0);

  const t = messages[language];

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const clearActiveNote = () => {
    setSelectedNoteId("");
    setActiveNote(null);
    setDraft(null);
  };

  const loadNoteById = async (noteId: string) => {
    if (!noteId) {
      clearActiveNote();
      return null;
    }

    const requestId = ++noteRequestRef.current;

    try {
      const note = await fetchNote(noteId);

      if (requestId !== noteRequestRef.current) {
        return note;
      }

      setSelectedNoteId(note.id);
      setActiveNote(note);
      setDraft(toDraft(note));
      setErrorKey("");
      return note;
    } catch {
      if (requestId === noteRequestRef.current) {
        setErrorKey("apiUnavailable");
      }

      return null;
    }
  };

  const loadVisibleNotes = async (
    query: string,
    options: {
      preferredNoteId?: string;
      syncSelection?: boolean;
    } = {},
  ) => {
    const requestId = ++notesRequestRef.current;

    try {
      const nextNotes = await fetchNotes({
        query: query.trim() || undefined,
      });

      if (requestId !== notesRequestRef.current) {
        return nextNotes;
      }

      setNotes(nextNotes);
      setErrorKey("");

      if (!options.syncSelection) {
        return nextNotes;
      }

      const candidateId = options.preferredNoteId ?? selectedNoteId;
      if (candidateId && nextNotes.some((note) => note.id === candidateId)) {
        if (activeNote?.id !== candidateId) {
          await loadNoteById(candidateId);
        } else {
          setSelectedNoteId(candidateId);
        }

        return nextNotes;
      }

      const fallbackNoteId = nextNotes[0]?.id ?? "";
      if (fallbackNoteId) {
        await loadNoteById(fallbackNoteId);
      } else {
        clearActiveNote();
      }

      return nextNotes;
    } catch {
      if (requestId === notesRequestRef.current) {
        setErrorKey("apiUnavailable");
      }

      return [];
    }
  };

  const loadWorkspace = async (preferredNoteId?: string) => {
    setLoading(true);
    setErrorKey("");

    try {
      const [
        nextDashboard,
        nextTemplates,
        nextAssets,
        nextWorkshopPresets,
        nextNotes,
      ] = await Promise.all([
        fetchDashboard(),
        fetchTemplates(),
        fetchAssets(),
        fetchWorkshopPresets(),
        fetchNotes({
          query: deferredSearch.trim() || undefined,
        }),
      ]);

      setDashboard(nextDashboard);
      setTemplates(nextTemplates);
      setAssets(nextAssets);
      setWorkshopPresets(nextWorkshopPresets);
      setNotes(nextNotes);
      hasLoadedWorkspaceRef.current = true;

      const currentNoteId = preferredNoteId ?? selectedNoteId;
      const fallbackNoteId =
        nextNotes.find((note) => note.id === currentNoteId)?.id ??
        nextNotes[0]?.id ??
        "";

      if (fallbackNoteId) {
        await loadNoteById(fallbackNoteId);
      } else {
        clearActiveNote();
      }
    } catch {
      setErrorKey("apiUnavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkspace();
  }, []);

  useEffect(() => {
    if (!hasLoadedWorkspaceRef.current) {
      return;
    }

    void loadVisibleNotes(deferredSearch);
  }, [deferredSearch]);

  useEffect(() => {
    if (!workshopPresets.length) {
      setSelectedPresetId("");
      return;
    }

    setSelectedPresetId((current) =>
      workshopPresets.some((preset) => preset.id === current)
        ? current
        : workshopPresets[0].id,
    );
  }, [workshopPresets]);

  const activeTemplate = useMemo(
    () =>
      templates.find(
        (template) => template.id === (draft?.templateId ?? activeNote?.templateId),
      ) ?? null,
    [activeNote, draft, templates],
  );

  const activePreset =
    workshopPresets.find((preset) => preset.id === selectedPresetId) ??
    workshopPresets[0] ??
    null;

  const statusLabel = (status: Note["status"]) =>
    status === "draft" ? t.statuses.draft : t.statuses.published;

  const moodLabel = (mood: NoteMood) => t.moods[mood];

  const handleSelectNote = (note: NoteSummary) => {
    setView("journal");
    setSelectedNoteId(note.id);
    setActiveNote(null);
    setDraft(null);
    setJournalInspectorTab("entry-info");
    setJournalInspectorVisible(true);
    void loadNoteById(note.id);
  };

  const handleCreateNote = async (templateId?: string) => {
    setSaving(true);

    try {
      const note = await createNote({
        title: language === "zh" ? "新的编辑条目" : "New editorial entry",
        body: "",
        mood: "calm",
        status: "draft",
        templateId: templateId ?? templates[0]?.id,
      });

      setSelectedNoteId(note.id);
      setActiveNote(note);
      setDraft(toDraft(note));
      setDashboard((current) => syncDashboardWithNote(current, note));
      await loadVisibleNotes(deferredSearch);
      setView("journal");
      setJournalInspectorTab("entry-info");
      setJournalInspectorVisible(true);
    } catch {
      setErrorKey("createFailed");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!activeNote || !draft) {
      return;
    }

    setSaving(true);
    setErrorKey("");

    try {
      const note = await updateNote(activeNote.id, draft);
      setActiveNote(note);
      setDraft(toDraft(note));
      setDashboard((current) => syncDashboardWithNote(current, note));
      await loadVisibleNotes(deferredSearch);
    } catch {
      setErrorKey("saveFailed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!activeNote) {
      return;
    }

    setSaving(true);

    try {
      const note = await toggleFavorite(activeNote.id);
      setActiveNote(note);
      setDraft(toDraft(note));
      setDashboard((current) => syncDashboardWithNote(current, note));
      await loadVisibleNotes(deferredSearch);
    } catch {
      setErrorKey("favoriteFailed");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!activeNote) {
      return;
    }

    setSaving(true);

    try {
      const note = await archiveNote(activeNote.id);
      setDashboard((current) => syncDashboardWithNote(current, note));
      await loadVisibleNotes(deferredSearch, { syncSelection: true });
    } catch {
      setErrorKey("archiveFailed");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    setView("journal");
    setJournalInspectorTab("entry-info");
    setJournalInspectorVisible(true);

    if (draft) {
      setDraft({ ...draft, templateId });
      return;
    }

    await handleCreateNote(templateId);
  };

  const handleFocusAssets = () => {
    setView("journal");
    setJournalInspectorVisible(true);
    setJournalInspectorTab("visual-assets");
  };

  const handleZoomIn = () => {
    setPreviewZoom((current) => {
      if (current === 100) {
        return 125;
      }
      return 150;
    });
  };

  const handleZoomOut = () => {
    setPreviewZoom((current) => {
      if (current === 150) {
        return 125;
      }
      return 100;
    });
  };

  return (
    <AppShell
      composeLabel={saving ? t.actions.working : t.actions.composeNew}
      navLabels={t.nav}
      onCreateNote={() => void handleCreateNote()}
      onRefresh={() => void loadWorkspace(selectedNoteId)}
      onViewChange={setView}
      refreshLabel={t.actions.refresh}
      saving={saving}
      search={search}
      searchPlaceholder={t.searchPlaceholder}
      setSearch={setSearch}
      sidebarKicker={t.sidebarKicker}
      sidebarTitle={t.sidebarTitle}
      syncState={dashboard?.user.syncState}
      title={t.viewTitles[view]}
      topbarEyebrow={t.topbarEyebrow}
      userName={dashboard?.user.name}
      view={view}
    >
      {errorKey ? (
        <div className="status-banner is-error">{t.errors[errorKey]}</div>
      ) : null}

      {loading && !dashboard ? (
        <div className="loading-state">
          <LoaderCircle className="spin" size={32} />
          <p>{t.loadingWorkspace}</p>
        </div>
      ) : null}

      {dashboard ? (
        <div className="view-stage" key={view}>
          {view === "discover" ? (
            <DiscoverView
              dashboard={dashboard}
              onOpenLibrary={() => setView("library")}
              onOpenWorkshop={() => setView("workshop")}
              t={t}
            />
          ) : null}

          {view === "library" ? (
            <LibraryView
              assets={assets}
              templates={templates}
              onApplyTemplate={(templateId) => void handleApplyTemplate(templateId)}
              onFocusAssets={handleFocusAssets}
              t={t}
            />
          ) : null}

          {view === "workshop" ? (
            <WorkshopView
              activePreset={activePreset}
              previewRefreshKey={previewRefreshKey}
              previewZoom={previewZoom}
              presets={workshopPresets}
              selectedPresetId={selectedPresetId}
              setSelectedPresetId={setSelectedPresetId}
              onRefreshPreview={() =>
                setPreviewRefreshKey((current) => current + 1)
              }
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              t={t}
            />
          ) : null}

          {view === "journal" ? (
            <JournalView
              activeNote={activeNote}
              activeTemplate={activeTemplate}
              assets={assets}
              draft={draft}
              formatDate={formatDate}
              journalAlignMode={journalAlignMode}
              journalDensityMode={journalDensityMode}
              journalFontMode={journalFontMode}
              journalInspectorTab={journalInspectorTab}
              journalInspectorVisible={journalInspectorVisible}
              language={language}
              moodLabel={moodLabel}
              saving={saving}
              setDraft={setDraft}
              setJournalAlignMode={setJournalAlignMode}
              setJournalDensityMode={setJournalDensityMode}
              setJournalFontMode={setJournalFontMode}
              setJournalInspectorTab={setJournalInspectorTab}
              setJournalInspectorVisible={setJournalInspectorVisible}
              spotlightImage={dashboard.spotlight.image}
              statusLabel={statusLabel}
              t={t}
              templates={templates}
              visibleNotes={notes}
              onArchive={() => void handleArchive()}
              onCreateNote={() => void handleCreateNote()}
              onSave={() => void handleSave()}
              onSelectNote={handleSelectNote}
              onToggleFavorite={() => void handleToggleFavorite()}
            />
          ) : null}

          {view === "settings" ? (
            <SettingsView
              language={language}
              setLanguage={setLanguage}
              t={t}
            />
          ) : null}
        </div>
      ) : null}
    </AppShell>
  );
}
