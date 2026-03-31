import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Check,
  Compass,
  Heart,
  Image as ImageIcon,
  Languages,
  Library,
  LoaderCircle,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";
import {
  archiveNote,
  createNote,
  fetchDashboard,
  toggleFavorite,
  updateNote,
} from "./api";
import { messages } from "./i18n";
import type {
  AppLanguage,
  AppView,
  DashboardResponse,
  Note,
  NoteDraft,
  NoteMood,
} from "./types";

const LANGUAGE_STORAGE_KEY = "litenote-language";

const navItems: Array<{
  id: AppView;
  icon: LucideIcon;
}> = [
  { id: "discover", icon: Compass },
  { id: "journal", icon: BookOpen },
  { id: "library", icon: Library },
  { id: "workshop", icon: Palette },
  { id: "settings", icon: Settings2 },
];

const moodValues: NoteMood[] = ["calm", "focused", "bright", "reflective"];

type ErrorKey = keyof (typeof messages)["en"]["errors"] | "";

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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
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

  const t = messages[language];

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const statusLabel = (status: Note["status"]) =>
    status === "draft" ? t.statuses.draft : t.statuses.published;

  const moodLabel = (mood: NoteMood) => t.moods[mood];

  const loadDashboard = async (preferredNoteId?: string) => {
    setLoading(true);
    setErrorKey("");

    try {
      const nextDashboard = await fetchDashboard();
      setDashboard(nextDashboard);

      const fallbackNoteId = nextDashboard.notes[0]?.id ?? "";
      const keepCurrent = preferredNoteId ?? selectedNoteId;
      const nextSelected =
        nextDashboard.notes.find((note) => note.id === keepCurrent)?.id ??
        fallbackNoteId;

      setSelectedNoteId(nextSelected);

      const note = nextDashboard.notes.find((item) => item.id === nextSelected);
      setDraft(note ? toDraft(note) : null);
    } catch {
      setErrorKey("apiUnavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

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

  const handleSelectNote = (note: Note) => {
    setView("journal");
    setSelectedNoteId(note.id);
    setDraft(toDraft(note));
  };

  const handleCreateNote = async () => {
    setSaving(true);

    try {
      const note = await createNote({
        title: language === "zh" ? "新的编辑笔记" : "New editorial entry",
        body: "",
        mood: "calm",
        status: "draft",
        templateId: dashboard?.templates[0]?.id,
      });
      await loadDashboard(note.id);
      setView("journal");
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="sidebar-kicker">{t.sidebarKicker}</p>
          <h1 className="sidebar-title">{t.sidebarTitle}</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-pill ${view === item.id ? "is-active" : ""}`}
                onClick={() => setView(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{t.nav[item.id]}</span>
              </button>
            );
          })}
        </nav>

        <button
          className="primary-button sidebar-compose"
          onClick={() => void handleCreateNote()}
          type="button"
        >
          <Plus size={18} />
          <span>{saving ? t.actions.working : t.actions.composeNew}</span>
        </button>
      </aside>

      <div className="main-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">{t.topbarEyebrow}</p>
            <h2>{t.viewTitles[view]}</h2>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
              />
            </label>

            <button
              className="ghost-button"
              onClick={() => void loadDashboard(selectedNoteId)}
              type="button"
            >
              <RefreshCw size={16} />
              {t.actions.refresh}
            </button>
          </div>
        </header>

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
          <main className="content-area">
            {view === "discover" ? (
              <section className="discover-grid">
                <div className="hero-card">
                  <div className="hero-copy">
                    <p className="eyebrow">{t.discover.spotlight}</p>
                    <h3>{dashboard.spotlight.title}</h3>
                    <p>{dashboard.spotlight.summary}</p>

                    <div className="hero-tags">
                      {dashboard.templates.map((template) => (
                        <span key={template.id}>{template.name}</span>
                      ))}
                    </div>
                  </div>

                  <img
                    alt={dashboard.spotlight.title}
                    className="hero-image"
                    src={dashboard.spotlight.image}
                  />
                </div>

                <div className="stats-grid">
                  <StatCard
                    label={t.discover.stats.savedNotes}
                    value={dashboard.stats.totalNotes}
                  />
                  <StatCard
                    label={t.discover.stats.publishedPieces}
                    value={dashboard.stats.publishedNotes}
                  />
                  <StatCard
                    label={t.discover.stats.templatesReady}
                    value={dashboard.stats.templates}
                  />
                  <StatCard
                    label={t.discover.stats.assetSources}
                    value={dashboard.stats.assets}
                  />
                </div>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">{t.discover.featuredLayouts}</p>
                      <h4>{t.discover.trendingStyles}</h4>
                    </div>
                    <button
                      className="ghost-button"
                      onClick={() => setView("library")}
                      type="button"
                    >
                      <ImageIcon size={16} />
                      {t.actions.browseLibrary}
                    </button>
                  </div>

                  <div className="template-grid">
                    {dashboard.templates.map((template) => (
                      <article key={template.id} className="template-card">
                        <img alt={template.name} src={template.previewImage} />
                        <div className="template-card-body">
                          <span style={{ color: template.accentColor }}>
                            {template.texture}
                          </span>
                          <h5>{template.name}</h5>
                          <p>{template.summary}</p>
                          <small>{template.uses} saved uses</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel tip-panel">
                  <div>
                    <p className="eyebrow">{t.discover.writingCue}</p>
                    <h4>{dashboard.user.name}</h4>
                    <p>{dashboard.writingTip}</p>
                  </div>
                  <Sparkles size={32} />
                </section>
              </section>
            ) : null}

            {view === "library" ? (
              <section className="library-layout">
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">{t.library.communityAssets}</p>
                      <h4>{t.library.visualIngredients}</h4>
                    </div>
                    <button className="ghost-button" type="button">
                      <Upload size={16} />
                      {t.actions.importSoon}
                    </button>
                  </div>

                  <div className="asset-grid">
                    {dashboard.assets.map((asset) => (
                      <article key={asset.id} className="asset-card">
                        <img alt={asset.name} src={asset.image} />
                        <div className="asset-card-body">
                          <span>{asset.category}</span>
                          <h5>{asset.name}</h5>
                          <p>{asset.description}</p>
                          <small>
                            {asset.creator} - {asset.likes} {t.library.likesSuffix}
                          </small>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">{t.library.readyTemplates}</p>
                      <h4>{t.library.applyVocabulary}</h4>
                    </div>
                  </div>

                  <div className="stack-list">
                    {dashboard.templates.map((template) => (
                      <button
                        key={template.id}
                        className="stack-item"
                        onClick={() => {
                          setView("journal");
                          if (draft) {
                            setDraft({ ...draft, templateId: template.id });
                          }
                        }}
                        type="button"
                      >
                        <div
                          className="stack-swatch"
                          style={{ background: template.accentColor }}
                        />
                        <div>
                          <strong>{template.name}</strong>
                          <p>{template.summary}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </section>
            ) : null}

            {view === "workshop" ? (
              <section className="workshop-layout">
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">{t.workshop.presetLab}</p>
                      <h4>{t.workshop.styleWorkshop}</h4>
                    </div>
                  </div>

                  <div className="workshop-list">
                    {dashboard.workshopPresets.map((preset) => (
                      <article key={preset.id} className="workshop-card">
                        <div>
                          <p className="eyebrow">{preset.tagline}</p>
                          <h5>{preset.name}</h5>
                          <p>{preset.summary}</p>
                        </div>
                        <pre>{preset.cssSnippet}</pre>
                        <blockquote>{preset.quote}</blockquote>
                      </article>
                    ))}
                  </div>
                </section>
              </section>
            ) : null}

            {view === "journal" ? (
              <section className="journal-layout">
                <aside className="panel note-list-panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">{t.journal.savedNotes}</p>
                      <h4>
                        {visibleNotes.length} {t.journal.entries}
                      </h4>
                    </div>
                    <button
                      className="ghost-button"
                      onClick={() => void handleCreateNote()}
                      type="button"
                    >
                      <Plus size={16} />
                      {t.actions.new}
                    </button>
                  </div>

                  <div className="note-list">
                    {visibleNotes.map((note) => (
                      <button
                        key={note.id}
                        className={`note-list-item ${
                          note.id === selectedNoteId ? "is-selected" : ""
                        }`}
                        onClick={() => handleSelectNote(note)}
                        type="button"
                      >
                        <div className="note-list-item-top">
                          <strong>{note.title}</strong>
                          {note.isFavorite ? <Star size={14} fill="currentColor" /> : null}
                        </div>
                        <p>{note.summary}</p>
                        <small>
                          {formatDate(note.updatedAt, language)} - {statusLabel(note.status)}
                        </small>
                      </button>
                    ))}
                  </div>
                </aside>

                <section className="panel editor-panel">
                  {draft && activeNote ? (
                    <>
                      <div className="panel-header">
                        <div>
                          <p className="eyebrow">{t.journal.editorialCanvas}</p>
                          <h4>{activeTemplate?.name ?? t.journal.untitledTemplate}</h4>
                        </div>

                        <div className="editor-actions">
                          <button
                            className="ghost-button"
                            onClick={() => void handleToggleFavorite()}
                            type="button"
                          >
                            <Heart
                              size={16}
                              fill={activeNote.isFavorite ? "currentColor" : "none"}
                            />
                            {t.actions.favorite}
                          </button>
                          <button
                            className="ghost-button"
                            onClick={() => void handleArchive()}
                            type="button"
                          >
                            {t.actions.archive}
                          </button>
                          <button
                            className="primary-button"
                            onClick={() => void handleSave()}
                            type="button"
                          >
                            <Save size={16} />
                            {saving ? t.actions.saving : t.actions.save}
                          </button>
                        </div>
                      </div>

                      <input
                        className="title-input"
                        value={draft.title}
                        onChange={(event) =>
                          setDraft({ ...draft, title: event.target.value })
                        }
                        placeholder={t.journal.entryTitle}
                      />

                      <textarea
                        className="body-input"
                        value={draft.body}
                        onChange={(event) =>
                          setDraft({ ...draft, body: event.target.value })
                        }
                        placeholder={t.journal.bodyPlaceholder}
                      />

                      <div className="editor-grid">
                        <label className="field">
                          <span>{t.journal.mood}</span>
                          <select
                            value={draft.mood}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                mood: event.target.value as NoteMood,
                              })
                            }
                          >
                            {moodValues.map((mood) => (
                              <option key={mood} value={mood}>
                                {moodLabel(mood)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field">
                          <span>{t.journal.template}</span>
                          <select
                            value={draft.templateId}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                templateId: event.target.value,
                              })
                            }
                          >
                            {dashboard.templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field">
                          <span>{t.journal.status}</span>
                          <select
                            value={draft.status}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                status: event.target.value as Note["status"],
                              })
                            }
                          >
                            <option value="draft">{t.statuses.draft}</option>
                            <option value="published">{t.statuses.published}</option>
                          </select>
                        </label>

                        <label className="field field-wide">
                          <span>{t.journal.tags}</span>
                          <input
                            value={draft.tags}
                            onChange={(event) =>
                              setDraft({ ...draft, tags: event.target.value })
                            }
                            placeholder="travel, product, ideas"
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="empty-state">
                      <BookOpen size={28} />
                      <p>{t.journal.empty}</p>
                    </div>
                  )}
                </section>

                <aside className="panel inspector-panel">
                  {activeNote ? (
                    <>
                      <img
                        alt={activeNote.title}
                        className="inspector-image"
                        src={activeNote.coverImage}
                      />

                      <div className="inspector-copy">
                        <p className="eyebrow">{t.journal.selectedEntry}</p>
                        <h4>{activeNote.title}</h4>
                        <p>{activeNote.summary}</p>
                      </div>

                      <div className="tag-row">
                        {activeNote.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>

                      <div className="meta-list">
                        <div>
                          <span>{t.journal.updated}</span>
                          <strong>{formatDate(activeNote.updatedAt, language)}</strong>
                        </div>
                        <div>
                          <span>{t.journal.template}</span>
                          <strong>{activeTemplate?.name ?? t.journal.unassigned}</strong>
                        </div>
                        <div>
                          <span>{t.journal.mood}</span>
                          <strong>{moodLabel(activeNote.mood)}</strong>
                        </div>
                      </div>
                    </>
                  ) : null}
                </aside>
              </section>
            ) : null}

            {view === "settings" ? (
              <section className="settings-layout">
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">{t.settings.eyebrow}</p>
                      <h4>{t.settings.title}</h4>
                    </div>
                    <div className="settings-badge">
                      <Languages size={16} />
                      {t.settings.currentValue}:{" "}
                      {language === "zh" ? t.settings.chinese : t.settings.english}
                    </div>
                  </div>

                  <p className="settings-copy">{t.settings.description}</p>

                  <div className="language-grid">
                    <button
                      className={`language-card ${language === "zh" ? "is-active" : ""}`}
                      onClick={() => setLanguage("zh")}
                      type="button"
                    >
                      <div className="language-card-top">
                        <strong>{t.settings.chinese}</strong>
                        {language === "zh" ? <Check size={18} /> : null}
                      </div>
                      <p>{t.settings.languageHint}</p>
                      <span>{language === "zh" ? t.actions.active : t.actions.selectLanguage}</span>
                    </button>

                    <button
                      className={`language-card ${language === "en" ? "is-active" : ""}`}
                      onClick={() => setLanguage("en")}
                      type="button"
                    >
                      <div className="language-card-top">
                        <strong>{t.settings.english}</strong>
                        {language === "en" ? <Check size={18} /> : null}
                      </div>
                      <p>{t.settings.languageHint}</p>
                      <span>{language === "en" ? t.actions.active : t.actions.selectLanguage}</span>
                    </button>
                  </div>
                </section>

                <section className="settings-side">
                  <article className="panel">
                    <div className="panel-header">
                      <div>
                        <p className="eyebrow">{t.settings.languageTitle}</p>
                        <h4>{t.settings.persistenceTitle}</h4>
                      </div>
                    </div>
                    <p className="settings-copy">{t.settings.persistenceBody}</p>
                  </article>

                  <article className="panel">
                    <div className="panel-header">
                      <div>
                        <p className="eyebrow">{t.nav.settings}</p>
                        <h4>{t.settings.architectureTitle}</h4>
                      </div>
                    </div>
                    <p className="settings-copy">{t.settings.architectureBody}</p>
                  </article>
                </section>
              </section>
            ) : null}
          </main>
        ) : null}
      </div>
    </div>
  );
}
