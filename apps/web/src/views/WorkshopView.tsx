import { RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import type { Messages } from "../i18n";
import type {
  PreviewZoomLevel,
  WorkshopPreset,
  WorkshopTab,
} from "../types";

interface WorkshopViewProps {
  activePreset: WorkshopPreset | null;
  isPreviewRefreshing: boolean;
  previewRefreshKey: number;
  previewZoom: PreviewZoomLevel;
  presets: WorkshopPreset[];
  selectedPresetId: string;
  setSelectedPresetId: (value: string) => void;
  onRefreshPreview: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  t: Messages;
}

const workshopTabs: WorkshopTab[] = ["editor", "history", "variables"];

export function WorkshopView({
  activePreset,
  isPreviewRefreshing,
  previewRefreshKey,
  previewZoom,
  presets,
  selectedPresetId,
  setSelectedPresetId,
  onRefreshPreview,
  onZoomIn,
  onZoomOut,
  t,
}: WorkshopViewProps) {
  if (!activePreset) {
    return null;
  }

  const snippetLines = activePreset.cssSnippet.split("\n");
  const canZoomOut = previewZoom > 100;
  const canZoomIn = previewZoom < 150;

  return (
    <section className="workshop-layout">
      <div className="workshop-column surface-card">
        <header className="p-10 px-12 pb-2">
          <div className="flex-1">
            <h3 className="studio-title">{activePreset.name}</h3>
          </div>

          <div className="workshop-tab-row">
            {workshopTabs.map((tab) => {
              const isEditor = tab === "editor";

              return (
                <button
                  key={tab}
                  aria-disabled={!isEditor}
                  className={`tab-button ${isEditor ? "is-active" : "is-disabled"}`}
                  disabled={!isEditor}
                  title={!isEditor ? t.workshop.comingSoon : undefined}
                  type="button"
                >
                  {t.workshop[tab]}
                </button>
              );
            })}
          </div>
        </header>

        <div className="workshop-code-panel">
          <div className="workshop-code-header">
            <span>style.css</span>
            <small>UTF-8 / CSS3</small>
          </div>

          <div className="workshop-code-body">
            {snippetLines.map((line, index) => (
              <div className="workshop-code-line" key={`${activePreset.id}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <code>{line || " "}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="workshop-column surface-card">
        <div className="workshop-preview-header">
          <div>
            <p className="eyebrow">{t.workshop.preview}</p>
            <h4>{activePreset.tagline}</h4>
          </div>

          <div className="workshop-preview-actions">
            <button
              className="icon-button focus-ring"
              disabled={!canZoomOut}
              onClick={onZoomOut}
              title={t.actions.zoomOut}
              type="button"
            >
              <ZoomOut size={16} />
            </button>
            <button
              className="icon-button focus-ring"
              disabled={!canZoomIn}
              onClick={onZoomIn}
              title={t.actions.zoomIn}
              type="button"
            >
              <ZoomIn size={16} />
            </button>
            <button
              className={`icon-button focus-ring ${isPreviewRefreshing ? "is-busy" : ""}`}
              disabled={isPreviewRefreshing}
              onClick={onRefreshPreview}
              title={t.actions.resetPreview}
              type="button"
            >
              <RefreshCw size={16} className={isPreviewRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="workshop-preview-stage">
          <div className="workshop-preview-scale">
            <div
              className="workshop-paper"
              key={`${activePreset.id}-${previewRefreshKey}`}
              style={{ transform: `scale(${previewZoom / 100})` }}
            >
              <div className="workshop-paper-grain" />
              <span className="workshop-paper-date">
                {t.workshop.zoom}: {previewZoom}%
              </span>
              <h5>{activePreset.name}</h5>
              <p>{activePreset.summary}</p>
              <blockquote>{activePreset.quote}</blockquote>
            </div>
          </div>
        </div>

        <div className="workshop-preset-strip">
          <p className="eyebrow">{t.workshop.quickTemplates}</p>
          <div className="workshop-preset-list">
            {presets.map((preset) => (
              <button
                key={preset.id}
                className={`workshop-preset-chip focus-ring ${
                  selectedPresetId === preset.id ? "is-active" : ""
                }`}
                onClick={() => setSelectedPresetId(preset.id)}
                type="button"
              >
                <strong>{preset.name}</strong>
                <span>{preset.tagline}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
