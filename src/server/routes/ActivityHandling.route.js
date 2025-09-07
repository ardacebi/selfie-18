import { Router } from "express";

import {
  createActivity,
  getAllUserActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} from "../controllers/ActivityHandling.controller.js";

const router = Router();
router.post("/create_activity/:userID", createActivity);
router.get("/get_all_user_activities/:userID", getAllUserActivities);
router.post("/get_activity_by_id", getActivityById);
router.patch("/update_activity/:activityID", updateActivity);
router.patch("/delete_activity/:activityID", deleteActivity);

export default router;
