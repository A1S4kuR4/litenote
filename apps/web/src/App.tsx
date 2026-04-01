import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  archiveNote,
  createNote,
  fetchDashboard,
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
  DashboardResponse,
  JournalAlignMode,
  JournalDensityMode,
  JournalFontMode,
  JournalInspectorTab,
  Note,
  NoteDraft,
  NoteMood,
  PreviewZoomLevel,
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

export default function App() {
  const [view, setView] = useState<AppView>("discover");
  const [language, setLanguage] = useState<AppLanguage>(readInitialLanguage);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
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

  const t = messages[language];

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const loadDashboard = async (preferredNoteId?: string) => {
    setLoading(true);
    setErrorKey("");

    try {
      const nextDashboard = await fetchDashboard();
      setDashboard(nextDashboard);

      const fallbackNoteId = nextDashboard.notes[0]?.id ?? "";
      const currentNoteId = preferredNoteId ?? selectedNoteId;
      const nextSelectedNoteId =
        nextDashboard.notes.find((note) => note.id === currentNoteId)?.id ??
        fallbackNoteId;

      setSelectedNoteId(nextSelectedNoteId);

      const selectedNote = nextDashboard.notes.find(
        (note) => note.id === nextSelectedNoteId,
      );
      setDraft(selectedNote ? toDraft(selectedNote) : null);
    } catch {
      setErrorKey("apiUnavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!dashboard?.workshopPresets.length) {
      setSelectedPresetId("");
      return;
    }

    setSelectedPresetId((current) =>
      dashboard.workshopPresets.some((preset) => preset.id === current)
        ? current
        : dashboard.workshopPresets[0].id,
    );
  }, [dashboard]);

  const activeNote = useMemo(
    () => dashboard?.notes.find((note) => note.id === selectedNoteId) ?? null,
    [dashboard, selectedNoteId],
  );

  const visibleNotes = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return dashboard.notes;
    }

    return dashboard.notes.filter((note) =>
      [note.title, note.summary, note.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [dashboard, search]);

  const activeTemplate = dashboard?.templates.find(
    (template) => template.id === (draft?.templateId ?? activeNote?.templateId),
  );

  const activePreset =
    dashboard?.workshopPresets.find((preset) => preset.id === selectedPresetId) ??
    dashboard?.workshopPresets[0] ??
    null;

  const statusLabel = (status: Note["status"]) =>
    status === "draft" ? t.statuses.draft : t.statuses.published;

  const moodLabel = (mood: NoteMood) => t.moods[mood];

  const handleSelectNote = (note: Note) => {
    setView("journal");
    setSelectedNoteId(note.id);
    setDraft(toDraft(note));
    setJournalInspectorTab("entry-info");
    setJournalInspectorVisible(true);
  };

  const handleCreateNote = async (templateId?: string) => {
    setSaving(true);

    try {
      const note = await createNote({
        title: language === "zh" ? "新的编辑条目" : "New editorial entry",
        body: "",
        mood: "calm",
        status: "draft",
        templateId: templateId ?? dashboard?.templates[0]?.id,
      });
      await loadDashboard(note.id);
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
      await updateNote(activeNote.id, draft);
      await loadDashboard(activeNote.id);
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
      await toggleFavorite(activeNote.id);
      await loadDashboard(activeNote.id);
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
      await archiveNote(activeNote.id);
      await loadDashboard();
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
      onRefresh={() => void loadDashboard(selectedNoteId)}
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
              dashboard={dashboard}
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
              presets={dashboard.workshopPresets}
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
              activeTemplate={activeTemplate ?? null}
              dashboard={dashboard}
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
              statusLabel={statusLabel}
              t={t}
              visibleNotes={visibleNotes}
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
