export type NoteMood = "calm" | "focused" | "bright" | "reflective";
export type NoteStatus = "draft" | "published";

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

export interface NoteSummary {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  mood: NoteMood;
  templateId: string;
  coverImage: string;
  isFavorite: boolean;
  isArchived: boolean;
  status: NoteStatus;
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

export interface DatabaseShape {
  notes: Note[];
  templates: Template[];
  assets: Asset[];
  workshopPresets: WorkshopPreset[];
}

export interface CreateNoteInput {
  title?: string;
  body?: string;
  tags?: string[];
  mood?: NoteMood;
  templateId?: string;
  coverImage?: string;
  status?: NoteStatus;
}

export interface UpdateNoteInput extends CreateNoteInput {
  isFavorite?: boolean;
  isArchived?: boolean;
}

export interface NoteListQuery {
  query?: string;
  status?: NoteStatus;
  favorite?: boolean;
  archived?: boolean;
  tag?: string;
  templateId?: string;
  page?: number;
  limit?: number;
}

export interface TemplateListQuery {
  featured?: boolean;
  limit?: number;
}

export interface AssetListQuery {
  category?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface WorkshopPresetListQuery {
  limit?: number;
}
