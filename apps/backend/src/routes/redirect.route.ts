import { Router } from "express";
import { redirectController } from "../controllers/redirect.controller";

const router = Router();

router.get("/", redirectController);

export default router;
