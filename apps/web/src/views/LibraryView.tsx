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
  const categories = Array.from(
    new Set(dashboard.assets.map((asset) => asset.category)),
  );

  return (
    <section className="library-layout">
      <header className="library-header surface-card">
        <div>
          <p className="eyebrow">{t.library.waterfallEyebrow}</p>
          <h3>{t.library.visualIngredients}</h3>
          <p>{t.library.waterfallLead}</p>
        </div>

        <div className="discover-tag-row">
          {categories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
      </header>

      <div className="library-main">
        <div className="masonry-grid">
          {dashboard.assets.map((asset) => (
            <article className="library-asset-card" key={asset.id}>
              <img alt={asset.name} src={asset.image} />
              <div className="library-asset-overlay">
                <span>{asset.category}</span>
                <strong>{asset.name}</strong>
                <p>{asset.description}</p>
                <div className="library-asset-actions">
                  <button className="btn btn-ghost" onClick={onFocusAssets} type="button">
                    {t.actions.openAssets}
                  </button>
                  <small>
                    {asset.creator} · {asset.likes} {t.library.likesSuffix}
                  </small>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="surface-card library-template-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{t.library.readyTemplates}</p>
              <h4>{t.library.applyVocabulary}</h4>
            </div>
          </div>

          <div className="library-template-stack">
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
