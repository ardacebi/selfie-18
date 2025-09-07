import { Router } from "express";
import {
  createEvent,
  getAllUserEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/EventsHandling.controller.js";

const router = Router();
router.post("/create_event/:userID", createEvent);
router.get("/get_all_user_events/:userID", getAllUserEvents);
router.post("/get_event_by_id", getEventById);
router.patch("/update_event/:eventID", updateEvent);
router.patch("/delete_event/:eventID", deleteEvent);

export default router;
