import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Compass,
  Library,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Settings2,
} from "lucide-react";
import type { AppView } from "../types";
import { cn } from "../lib/utils";

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

interface AppShellProps {
  children: ReactNode;
  composeDisabled: boolean;
  composeLabel: string;
  isRefreshingWorkspace: boolean;
  onCreateNote: () => void;
  onRefresh: () => void;
  onViewChange: (view: AppView) => void;
  navLabels: Record<AppView, string>;
  refreshDisabled: boolean;
  refreshLabel: string;
  search: string;
  searchPlaceholder: string;
  setSearch: (value: string) => void;
  sidebarKicker: string;
  sidebarTitle: string;
  syncState?: string;
  title: string;
  topbarEyebrow: string;
  userName?: string;
  view: AppView;
}

export function AppShell({
  children,
  composeDisabled,
  composeLabel,
  isRefreshingWorkspace,
  navLabels,
  onCreateNote,
  onRefresh,
  onViewChange,
  refreshDisabled,
  refreshLabel,
  search,
  searchPlaceholder,
  setSearch,
  sidebarKicker,
  sidebarTitle,
  syncState,
  title,
  topbarEyebrow,
  userName,
  view,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-outline-variant/10 bg-surface-container p-6 space-y-8 z-50 md:flex">
        <div className="flex flex-col space-y-1">
          <span className="font-label text-[10px] font-semibold uppercase tracking-widest text-on-surface/50">
            {sidebarKicker}
          </span>
          <h1 className="font-headline text-2xl font-bold leading-tight text-on-surface">
            {sidebarTitle}
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;

            return (
              <button
                key={item.id}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "focus-ring flex w-full items-center gap-3 rounded-l-xl px-4 py-3 font-label text-[10px] font-semibold uppercase tracking-widest transition-all",
                  isActive
                    ? "bg-surface text-primary shadow-sm translate-x-1"
                    : "text-on-surface/50 hover:bg-surface/50 hover:text-on-surface",
                )}
                onClick={() => onViewChange(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{navLabels[item.id]}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-outline-variant/10">
          <button
            className={cn(
              "focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-label text-sm font-medium text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95",
              composeDisabled && "is-disabled",
            )}
            disabled={composeDisabled}
            onClick={onCreateNote}
            type="button"
          >
            <Plus size={18} />
            <span>{composeLabel}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 md:pl-64">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-outline-variant/5 bg-surface/80 px-8 py-4 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 leading-tight">
              {topbarEyebrow}
            </span>
            <h2 className="font-headline text-lg italic text-primary transition-all">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <div className="flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-1.5">
                <Search size={16} className="text-on-surface-variant" />
                <input
                  className="w-48 border-none bg-transparent font-label text-sm text-on-surface focus:ring-0"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className={cn(
                  "focus-ring rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary",
                  (isRefreshingWorkspace || refreshDisabled) && "is-disabled",
                )}
                disabled={refreshDisabled}
                onClick={onRefresh}
                title={refreshLabel}
                type="button"
              >
                <RefreshCw
                  size={20}
                  className={cn(isRefreshingWorkspace && "animate-spin")}
                />
              </button>

              <div className="flex flex-col items-end rounded-lg border border-outline-variant/10 bg-surface-container-lowest px-3 py-1">
                <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant/60">
                  {syncState || "Local Sync Active"}
                </span>
                <strong className="font-label text-[10px] font-bold text-on-surface">
                  {userName || "Studio Owner"}
                </strong>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-screen">
          <div
            className={cn(
              "px-8 py-8 transition-all duration-700",
              view === "workshop" || view === "journal" || view === "library"
                ? "max-w-none mx-0"
                : "max-w-7xl mx-auto",
            )}
          >
            {children}
          </div>
        </main>
      </div>

      <button
        className={cn(
          "focus-ring fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-transform hover:scale-110 active:scale-95 group",
          composeDisabled && "is-disabled",
        )}
        disabled={composeDisabled}
        onClick={onCreateNote}
        title={composeLabel}
        type="button"
      >
        <Plus size={24} />
        <div className="absolute right-full mr-4 whitespace-nowrap rounded-xl bg-on-surface px-4 py-2 font-label text-xs text-surface opacity-0 transition-opacity group-hover:opacity-100">
          {composeLabel}
        </div>
      </button>
    </div>
  );
}
