import { Check, Languages } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { Messages } from "../i18n";
import type { AppLanguage } from "../types";

interface SettingsViewProps {
  language: AppLanguage;
  setLanguage: Dispatch<SetStateAction<AppLanguage>>;
  t: Messages;
}

export function SettingsView({
  language,
  setLanguage,
  t,
}: SettingsViewProps) {
  return (
    <section className="settings-layout">
      <section className="surface-card settings-main">
        <header className="p-10 px-12 pb-2">
          <div className="flex-1">
            <h3 className="studio-title">{t.settings.title}</h3>
            <p className="studio-lead">{t.settings.description}</p>
          </div>
          <div className="settings-badge">
            <Languages size={16} />
            <span>
              {t.settings.currentValue}:{" "}
              {language === "zh" ? t.settings.chinese : t.settings.english}
            </span>
          </div>
        </header>

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
        <article className="surface-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{t.settings.languageTitle}</p>
              <h4>{t.settings.persistenceTitle}</h4>
            </div>
          </div>
          <p className="settings-copy">{t.settings.persistenceBody}</p>
        </article>

        <article className="surface-card">
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
  );
}
