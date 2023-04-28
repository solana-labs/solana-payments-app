import { Router } from "express";
import { instalController } from "../controllers/install.controller";

const router = Router();

router.get("/", instalController);

export default router;
