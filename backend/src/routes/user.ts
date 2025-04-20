import express, { Router, RequestHandler } from "express";
import { getUsers } from "../handlers/user";

const router: Router = express.Router();

router.get("/", getUsers as RequestHandler);

export default router;
