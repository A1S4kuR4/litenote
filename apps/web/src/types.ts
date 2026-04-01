export type AppView =
  | "discover"
  | "journal"
  | "library"
  | "workshop"
  | "settings";
export type AppLanguage = "zh" | "en";
export type NoteMood = "calm" | "focused" | "bright" | "reflective";
export type NoteStatus = "draft" | "published";
export type JournalInspectorTab = "entry-info" | "visual-assets";
export type JournalFontMode = "editorial" | "modern";
export type JournalAlignMode = "left" | "center";
export type JournalDensityMode = "comfortable" | "immersive";
export type PreviewZoomLevel = 100 | 125 | 150;
export type WorkshopTab = "editor" | "history" | "variables";

export interface Note {
  id: string;
  title: string;
  body: string;
  summary: string;
  tags: string[];
  mood: NoteMood;
  templateId: string;
  coverImage: string;
  isFavorite: boolean;
  isArchived: boolean;
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  summary: string;
  accentColor: string;
  texture: string;
  uses: number;
  featured: boolean;
  previewImage: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  creator: string;
  likes: number;
  description: string;
  image: string;
}

export interface WorkshopPreset {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  cssSnippet: string;
  quote: string;
}

export interface DashboardResponse {
  user: {
    name: string;
    role: string;
    syncState: string;
  };
  spotlight: {
    title: string;
    summary: string;
    image: string;
    author: string;
  };
  writingTip: string;
  stats: {
    totalNotes: number;
    publishedNotes: number;
    favoriteNotes: number;
    templates: number;
    assets: number;
  };
  notes: Note[];
  templates: Template[];
  assets: Asset[];
  workshopPresets: WorkshopPreset[];
}

export interface NoteDraft {
  title: string;
  body: string;
  tags: string;
  mood: NoteMood;
  templateId: string;
  status: NoteStatus;
}
