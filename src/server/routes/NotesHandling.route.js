import { Router } from "express";
import {
  createNote,
  getAllUserNotes,
  getNoteById,
  updateNote,
  deleteNote,
  duplicateNote,
} from "../controllers/NotesHandling.controller.js";

const router = Router();

router.post("/create_note/:id", createNote);
router.get("/get_all_user_notes/:id", getAllUserNotes);
router.post("/get_note_by_id", getNoteById);
router.patch("/update_note/:noteID", updateNote);
router.patch("/delete_note/:noteID", deleteNote);
router.post("/duplicate_note/", duplicateNote);

export default router;
