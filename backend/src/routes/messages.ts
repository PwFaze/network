import express, { Router, RequestHandler } from "express";
import { getMessages } from "../handlers/message";

const router: Router = express.Router();

router.get("/:chatId", getMessages as RequestHandler);
export default router;
