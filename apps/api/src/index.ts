import cors from "cors";
import express from "express";
import {
  archiveNote,
  buildDashboard,
  createNote,
  readDatabase,
  toggleFavorite,
  updateNote,
} from "./store.js";
import type { CreateNoteInput, UpdateNoteInput } from "./types.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "litenote-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/dashboard", async (_request, response) => {
  const db = await readDatabase();
  response.json(buildDashboard(db));
});

app.post("/api/notes", async (request, response) => {
  const payload = request.body as CreateNoteInput;
  const note = await createNote(payload);
  response.status(201).json(note);
});

app.patch("/api/notes/:id", async (request, response) => {
  const payload = request.body as UpdateNoteInput;
  const note = await updateNote(request.params.id, payload);

  if (!note) {
    response.status(404).json({ message: "Note not found." });
    return;
  }

  response.json(note);
});

app.post("/api/notes/:id/favorite", async (request, response) => {
  const note = await toggleFavorite(request.params.id);

  if (!note) {
    response.status(404).json({ message: "Note not found." });
    return;
  }

  response.json(note);
});

app.post("/api/notes/:id/archive", async (request, response) => {
  const note = await archiveNote(request.params.id);

  if (!note) {
    response.status(404).json({ message: "Note not found." });
    return;
  }

  response.json(note);
});

app.listen(port, () => {
  console.log(`LiteNote API listening on http://localhost:${port}`);
});
