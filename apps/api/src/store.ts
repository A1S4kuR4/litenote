import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSeedDatabase } from "./data.js";
import type {
  Asset,
  AssetListQuery,
  CreateNoteInput,
  DatabaseShape,
  DashboardResponse,
  Note,
  NoteListQuery,
  NoteSummary,
  Template,
  TemplateListQuery,
  UpdateNoteInput,
  WorkshopPreset,
  WorkshopPresetListQuery,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");
const databasePath = path.resolve(dataDir, "litenote-db.json");

const summarize = (body: string): string => {
  const compact = body.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "Capture an idea, a plan, or a fragment before it slips away.";
  }
  return compact.length > 88 ? `${compact.slice(0, 85)}...` : compact;
};

const createId = (): string =>
  `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const sortNotes = (notes: Note[]) =>
  [...notes].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

const normalizeKeyword = (value: string) => value.trim().toLowerCase();

const paginate = <T>(items: T[], page?: number, limit?: number): T[] => {
  if (!limit || limit < 1) {
    return items;
  }

  const safePage = page && page > 0 ? page : 1;
  const start = (safePage - 1) * limit;
  return items.slice(start, start + limit);
};

const toNoteSummary = (note: Note): NoteSummary => ({
  id: note.id,
  title: note.title,
  summary: note.summary,
  tags: note.tags,
  mood: note.mood,
  templateId: note.templateId,
  coverImage: note.coverImage,
  isFavorite: note.isFavorite,
  isArchived: note.isArchived,
  status: note.status,
  updatedAt: note.updatedAt,
});

const matchesNoteQuery = (note: Note, query?: string) => {
  if (!query) {
    return true;
  }

  const keyword = normalizeKeyword(query);
  return [note.title, note.summary, note.tags.join(" ")]
    .join(" ")
    .toLowerCase()
    .includes(keyword);
};

const matchesTextQuery = (values: string[], query?: string) => {
  if (!query) {
    return true;
  }

  return values.join(" ").toLowerCase().includes(normalizeKeyword(query));
};

const writeDatabase = async (db: DatabaseShape) => {
  await mkdir(dataDir, { recursive: true });
  await writeFile(databasePath, JSON.stringify(db, null, 2), "utf8");
};

export const readDatabase = async (): Promise<DatabaseShape> => {
  try {
    const content = await readFile(databasePath, "utf8");
    return JSON.parse(content) as DatabaseShape;
  } catch {
    const seeded = createSeedDatabase();
    await writeDatabase(seeded);
    return seeded;
  }
};

export const buildDashboard = (db: DatabaseShape): DashboardResponse => {
  const notes = sortNotes(db.notes).filter((note) => !note.isArchived);
  const spotlightTemplate =
    db.templates.find((template) => template.featured) ?? db.templates[0];

  return {
    user: {
      name: "Studio Owner",
      role: "Editor in residence",
      syncState: "Local sync active",
    },
    spotlight: {
      title: spotlightTemplate.name,
      summary: spotlightTemplate.summary,
      image: spotlightTemplate.previewImage,
      author: "Curated by LiteNote",
    },
    writingTip:
      "Start with a sensory detail first, then capture the decision or feeling that followed it.",
    stats: {
      totalNotes: notes.length,
      publishedNotes: notes.filter((note) => note.status === "published").length,
      favoriteNotes: notes.filter((note) => note.isFavorite).length,
      templates: db.templates.length,
      assets: db.assets.length,
    },
    notes,
    templates: db.templates,
    assets: db.assets,
    workshopPresets: db.workshopPresets,
  };
};

export const listNotes = async (
  query: NoteListQuery = {},
): Promise<NoteSummary[]> => {
  const db = await readDatabase();
  const filtered = sortNotes(db.notes)
    .filter((note) =>
      query.archived === undefined ? !note.isArchived : note.isArchived === query.archived,
    )
    .filter((note) =>
      query.status ? note.status === query.status : true,
    )
    .filter((note) =>
      query.favorite === undefined ? true : note.isFavorite === query.favorite,
    )
    .filter((note) =>
      query.tag
        ? note.tags.some(
            (tag) => normalizeKeyword(tag) === normalizeKeyword(query.tag ?? ""),
          )
        : true,
    )
    .filter((note) =>
      query.templateId ? note.templateId === query.templateId : true,
    )
    .filter((note) => matchesNoteQuery(note, query.query));

  return paginate(filtered, query.page, query.limit).map(toNoteSummary);
};

export const getNote = async (id: string): Promise<Note | null> => {
  const db = await readDatabase();
  return db.notes.find((note) => note.id === id) ?? null;
};

export const listTemplates = async (
  query: TemplateListQuery = {},
): Promise<Template[]> => {
  const db = await readDatabase();
  const filtered = db.templates.filter((template) =>
    query.featured === undefined ? true : template.featured === query.featured,
  );

  return query.limit && query.limit > 0
    ? filtered.slice(0, query.limit)
    : filtered;
};

export const listAssets = async (
  query: AssetListQuery = {},
): Promise<Asset[]> => {
  const db = await readDatabase();
  const filtered = db.assets
    .filter((asset) =>
      query.category
        ? normalizeKeyword(asset.category) === normalizeKeyword(query.category)
        : true,
    )
    .filter((asset) =>
      matchesTextQuery(
        [asset.name, asset.category, asset.creator, asset.description],
        query.query,
      ),
    );

  return paginate(filtered, query.page, query.limit);
};

export const listWorkshopPresets = async (
  query: WorkshopPresetListQuery = {},
): Promise<WorkshopPreset[]> => {
  const db = await readDatabase();
  return query.limit && query.limit > 0
    ? db.workshopPresets.slice(0, query.limit)
    : db.workshopPresets;
};

export const createNote = async (input: CreateNoteInput): Promise<Note> => {
  const db = await readDatabase();
  const now = new Date().toISOString();

  const note: Note = {
    id: createId(),
    title: input.title?.trim() || "Untitled entry",
    body: input.body?.trim() || "",
    summary: summarize(input.body ?? ""),
    tags: input.tags ?? [],
    mood: input.mood ?? "calm",
    templateId: input.templateId ?? db.templates[0]?.id ?? "template-default",
    coverImage:
      input.coverImage ??
      "https://picsum.photos/seed/litenote-new-note/960/720",
    isFavorite: false,
    isArchived: false,
    status: input.status ?? "draft",
    createdAt: now,
    updatedAt: now,
  };

  db.notes = [note, ...db.notes];
  await writeDatabase(db);
  return note;
};

export const updateNote = async (
  id: string,
  input: UpdateNoteInput,
): Promise<Note | null> => {
  const db = await readDatabase();
  const index = db.notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return null;
  }

  const current = db.notes[index];
  const nextBody = input.body ?? current.body;
  const updated: Note = {
    ...current,
    ...input,
    title:
      input.title === undefined
        ? current.title
        : input.title.trim() || "Untitled entry",
    body: nextBody,
    summary: summarize(nextBody),
    tags: input.tags ?? current.tags,
    updatedAt: new Date().toISOString(),
  };

  db.notes[index] = updated;
  await writeDatabase(db);
  return updated;
};

export const toggleFavorite = async (id: string): Promise<Note | null> => {
  const db = await readDatabase();
  const index = db.notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return null;
  }

  db.notes[index] = {
    ...db.notes[index],
    isFavorite: !db.notes[index].isFavorite,
    updatedAt: new Date().toISOString(),
  };

  await writeDatabase(db);
  return db.notes[index];
};

export const archiveNote = async (id: string): Promise<Note | null> => {
  return updateNote(id, { isArchived: true });
};

export const restoreNote = async (id: string): Promise<Note | null> => {
  return updateNote(id, { isArchived: false });
};
