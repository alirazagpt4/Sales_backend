import express from "express";
const router = express.Router();
import { designations } from "../controllers/designations.controller.js";

router.get("/", designations);

export default router;