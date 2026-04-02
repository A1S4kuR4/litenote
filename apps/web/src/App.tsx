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

type NoticeTone = "success" | "error" | "info";
type Notice = {
  tone: NoticeTone;
  message: string;
};
type NoteBusyAction = "create" | "save" | "favorite" | "archive" | "apply-asset";

function toDraft(note: Note): NoteDraft {
  return {
    title: note.title,
    body: note.body,
    tags: note.tags.join(", "),
    mood: note.mood,
    templateId: note.templateId,
    coverImage: note.coverImage,
    status: note.status,
  };
}

function normalizeTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function matchesDraftToNote(note: Note, draft: NoteDraft): boolean {
  const noteTags = [...note.tags].sort().join("|");
  const draftTags = [...normalizeTags(draft.tags)].sort().join("|");

  return (
    note.title === draft.title &&
    note.body === draft.body &&
    note.mood === draft.mood &&
    note.templateId === draft.templateId &&
    note.coverImage === draft.coverImage &&
    note.status === draft.status &&
    noteTags === draftTags
  );
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

function buildDefaultTitle(language: AppLanguage): string {
  return language === "zh" ? "新的编辑条目" : "New editorial entry";
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
  const [loading, setLoading] = useState(true);
  const [isRefreshingWorkspace, setIsRefreshingWorkspace] = useState(false);
  const [noteBusyAction, setNoteBusyAction] = useState<NoteBusyAction | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedAssetCategory, setSelectedAssetCategory] = useState("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSaveSuccessful, setIsSaveSuccessful] = useState(false);
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
  const [isPreviewRefreshing, setIsPreviewRefreshing] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const hasLoadedWorkspaceRef = useRef(false);
  const notesRequestRef = useRef(0);
  const noteRequestRef = useRef(0);
  const previewRefreshTimeoutRef = useRef<number | null>(null);

  const t = messages[language];

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setNotice(null);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!isSaveSuccessful) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsSaveSuccessful(false);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [isSaveSuccessful]);

  useEffect(
    () => () => {
      if (previewRefreshTimeoutRef.current) {
        window.clearTimeout(previewRefreshTimeoutRef.current);
      }
    },
    [],
  );

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

  const filteredAssets = useMemo(() => {
    if (selectedAssetCategory === "all") {
      return assets;
    }

    return assets.filter((asset) => asset.category === selectedAssetCategory);
  }, [assets, selectedAssetCategory]);

  const currentCoverImage =
    draft?.coverImage ??
    activeNote?.coverImage ??
    activeTemplate?.previewImage ??
    dashboard?.spotlight.image ??
    "";

  const isDirty = useMemo(() => {
    if (!activeNote || !draft) {
      return false;
    }

    return !matchesDraftToNote(activeNote, draft);
  }, [activeNote, draft]);

  useEffect(() => {
    if (isDirty) {
      setIsSaveSuccessful(false);
    }
  }, [isDirty]);

  useEffect(() => {
    if (!filteredAssets.some((asset) => asset.id === selectedAssetId)) {
      setSelectedAssetId("");
    }
  }, [filteredAssets, selectedAssetId]);

  const showNotice = (tone: NoticeTone, message: string) => {
    setNotice({ tone, message });
  };

  const clearActiveNote = () => {
    setSelectedNoteId("");
    setActiveNote(null);
    setDraft(null);
    setIsSaveSuccessful(false);
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
      return note;
    } catch {
      if (requestId === noteRequestRef.current) {
        showNotice("error", t.errors.apiUnavailable);
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
        showNotice("error", t.errors.apiUnavailable);
      }

      return [];
    }
  };

  const loadWorkspace = async (
    preferredNoteId?: string,
    options: { asRefresh?: boolean } = {},
  ) => {
    const isInitialLoad = !hasLoadedWorkspaceRef.current;

    if (isInitialLoad) {
      setLoading(true);
    }

    if (options.asRefresh) {
      setIsRefreshingWorkspace(true);
    }

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

      if (options.asRefresh) {
        showNotice("info", t.notices.workspaceRefreshed);
      }
    } catch {
      showNotice("error", t.errors.apiUnavailable);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }

      if (options.asRefresh) {
        setIsRefreshingWorkspace(false);
      }
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

  const statusLabel = (status: Note["status"]) =>
    status === "draft" ? t.statuses.draft : t.statuses.published;

  const moodLabel = (mood: NoteMood) => t.moods[mood];

  const isAnyNoteActionBusy = noteBusyAction !== null;

  const createNoteEntry = async (options: {
    templateId?: string;
    coverImage?: string;
    busyAction: NoteBusyAction;
    successNotice?: string;
    inspectorTab?: JournalInspectorTab;
  }) => {
    const template =
      templates.find((item) => item.id === options.templateId) ?? templates[0] ?? null;

    setNoteBusyAction(options.busyAction);

    try {
      const note = await createNote({
        title: buildDefaultTitle(language),
        body: "",
        mood: "calm",
        status: "draft",
        templateId: options.templateId ?? template?.id,
        coverImage: options.coverImage ?? template?.previewImage ?? "",
      });

      setSelectedNoteId(note.id);
      setActiveNote(note);
      setDraft(toDraft(note));
      setDashboard((current) => syncDashboardWithNote(current, note));
      await loadVisibleNotes(deferredSearch);
      setView("journal");
      setJournalInspectorVisible(true);
      setJournalInspectorTab(options.inspectorTab ?? "entry-info");
      setIsSaveSuccessful(false);

      if (options.successNotice) {
        showNotice("success", options.successNotice);
      }
    } catch {
      showNotice("error", t.errors.createFailed);
    } finally {
      setNoteBusyAction(null);
    }
  };

  const handleSelectNote = (note: NoteSummary) => {
    setView("journal");
    setSelectedNoteId(note.id);
    setActiveNote(null);
    setDraft(null);
    setIsSaveSuccessful(false);
    setJournalInspectorTab("entry-info");
    setJournalInspectorVisible(true);
    void loadNoteById(note.id);
  };

  const handleCreateNote = async (templateId?: string) => {
    const template =
      templates.find((item) => item.id === templateId) ?? templates[0] ?? null;

    await createNoteEntry({
      templateId: template?.id,
      coverImage: template?.previewImage ?? "",
      busyAction: "create",
      inspectorTab: "entry-info",
    });
  };

  const handleSave = async () => {
    if (!activeNote || !draft || !isDirty) {
      return;
    }

    setNoteBusyAction("save");

    try {
      const note = await updateNote(activeNote.id, draft);
      setActiveNote(note);
      setDraft(toDraft(note));
      setDashboard((current) => syncDashboardWithNote(current, note));
      await loadVisibleNotes(deferredSearch);
      setIsSaveSuccessful(true);
      showNotice("success", t.notices.noteSaved);
    } catch {
      showNotice("error", t.errors.saveFailed);
    } finally {
      setNoteBusyAction(null);
    }
  };

  const handleToggleFavorite = async () => {
    if (!activeNote) {
      return;
    }

    setNoteBusyAction("favorite");

    try {
      const note = await toggleFavorite(activeNote.id);
      setActiveNote(note);
      setDashboard((current) => syncDashboardWithNote(current, note));
      await loadVisibleNotes(deferredSearch);
    } catch {
      showNotice("error", t.errors.favoriteFailed);
    } finally {
      setNoteBusyAction(null);
    }
  };

  const handleArchive = async () => {
    if (!activeNote || isDirty) {
      return;
    }

    setNoteBusyAction("archive");

    try {
      const note = await archiveNote(activeNote.id);
      setDashboard((current) => syncDashboardWithNote(current, note));
      await loadVisibleNotes(deferredSearch, { syncSelection: true });
      setIsSaveSuccessful(false);
    } catch {
      showNotice("error", t.errors.archiveFailed);
    } finally {
      setNoteBusyAction(null);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    setView("journal");
    setJournalInspectorTab("entry-info");
    setJournalInspectorVisible(true);

    if (draft) {
      setDraft((current) =>
        current
          ? {
              ...current,
              templateId,
            }
          : current,
      );
      return;
    }

    await handleCreateNote(templateId);
  };

  const handleApplyAsset = async (asset: Asset) => {
    setSelectedAssetId(asset.id);
    setView("journal");
    setJournalInspectorVisible(true);
    setJournalInspectorTab("visual-assets");

    if (draft && activeNote) {
      setDraft((current) =>
        current
          ? {
              ...current,
              coverImage: asset.image,
            }
          : current,
      );
      showNotice("success", t.notices.coverUpdated);
      return;
    }

    await createNoteEntry({
      coverImage: asset.image,
      busyAction: "apply-asset",
      successNotice: t.notices.coverAppliedToNewNote,
      inspectorTab: "visual-assets",
    });
  };

  const handleRefreshPreview = () => {
    setPreviewRefreshKey((current) => current + 1);
    setIsPreviewRefreshing(true);

    if (previewRefreshTimeoutRef.current) {
      window.clearTimeout(previewRefreshTimeoutRef.current);
    }

    previewRefreshTimeoutRef.current = window.setTimeout(() => {
      setIsPreviewRefreshing(false);
    }, 700);
  };

  const handleZoomIn = () => {
    setPreviewZoom((current) => {
      if (current === 100) {
        return 125;
      }

      if (current === 125) {
        return 150;
      }

      return current;
    });
  };

  const handleZoomOut = () => {
    setPreviewZoom((current) => {
      if (current === 150) {
        return 125;
      }

      if (current === 125) {
        return 100;
      }

      return current;
    });
  };

  return (
    <AppShell
      composeDisabled={isAnyNoteActionBusy}
      composeLabel={
        noteBusyAction === "create" ? t.actions.working : t.actions.composeNew
      }
      isRefreshingWorkspace={isRefreshingWorkspace}
      navLabels={t.nav}
      onCreateNote={() => void handleCreateNote()}
      onRefresh={() => void loadWorkspace(selectedNoteId, { asRefresh: true })}
      onViewChange={setView}
      refreshDisabled={isRefreshingWorkspace || isAnyNoteActionBusy}
      refreshLabel={t.actions.refresh}
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
      {notice ? (
        <div className={`status-banner is-${notice.tone}`}>{notice.message}</div>
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
              onApplyTemplate={(templateId) => void handleApplyTemplate(templateId)}
              onOpenLibrary={() => setView("library")}
              onOpenWorkshop={() => setView("workshop")}
              t={t}
            />
          ) : null}

          {view === "library" ? (
            <LibraryView
              assets={assets}
              currentCoverImage={currentCoverImage}
              isApplyingAsset={noteBusyAction === "apply-asset"}
              onApplyAsset={(asset) => void handleApplyAsset(asset)}
              onApplyTemplate={(templateId) => void handleApplyTemplate(templateId)}
              onSelectAsset={setSelectedAssetId}
              onSelectCategory={setSelectedAssetCategory}
              selectedAssetCategory={selectedAssetCategory}
              selectedAssetId={selectedAssetId}
              t={t}
              templates={templates}
            />
          ) : null}

          {view === "workshop" ? (
            <WorkshopView
              activePreset={activePreset}
              isPreviewRefreshing={isPreviewRefreshing}
              onRefreshPreview={handleRefreshPreview}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              previewRefreshKey={previewRefreshKey}
              previewZoom={previewZoom}
              presets={workshopPresets}
              selectedPresetId={selectedPresetId}
              setSelectedPresetId={setSelectedPresetId}
              t={t}
            />
          ) : null}

          {view === "journal" ? (
            <JournalView
              activeNote={activeNote}
              activeTemplate={activeTemplate}
              assets={filteredAssets}
              currentCoverImage={currentCoverImage}
              draft={draft}
              formatDate={formatDate}
              isDirty={isDirty}
              isSaveSuccessful={isSaveSuccessful}
              journalAlignMode={journalAlignMode}
              journalDensityMode={journalDensityMode}
              journalFontMode={journalFontMode}
              journalInspectorTab={journalInspectorTab}
              journalInspectorVisible={journalInspectorVisible}
              language={language}
              moodLabel={moodLabel}
              noteBusyAction={noteBusyAction}
              selectedAssetId={selectedAssetId}
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
              onApplyAsset={(asset) => void handleApplyAsset(asset)}
              onArchive={() => void handleArchive()}
              onCreateNote={() => void handleCreateNote()}
              onSave={() => void handleSave()}
              onSelectAsset={setSelectedAssetId}
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
