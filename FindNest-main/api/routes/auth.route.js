import express from "express";
import { createuser, signin } from "../controller/auth.controller.js";
import {
  verifyToken,
  verifyAdmin,
  verifySuperAdmin,
} from "../utils/verifyUser.js";

const router = express.Router();

router.post("/createuser", verifyToken, verifyAdmin, createuser); // Both admin and superadmin can create users
router.post("/signin", signin);

export default router;
