import { Router } from "express";
import { helloController } from "../controllers/hello.controller";

const router = Router();

router.get("/", helloController);

export default router;
