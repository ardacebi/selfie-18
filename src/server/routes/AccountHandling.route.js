import { Router } from "express";
import {
  accountLogin,
  accountSignUp,
  changePassword,
  changeUsername,
  deleteAccount,
  getProfileIDByEmail,
  userOwnsNote,
} from "../controllers/AccountHandling.controller.js";

const router = Router();

router.post("/sign_up", accountSignUp);

router.post("/login", accountLogin);

router.patch("/change_username/:id", changeUsername);

router.patch("/change_password/:id", changePassword);

router.delete("/delete_account/:id", deleteAccount);

router.post("/find_user_id_by_email", getProfileIDByEmail);

router.post("/user_owns_note", userOwnsNote);

export default router;
