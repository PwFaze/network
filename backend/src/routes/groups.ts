import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { createGroup, getGroups } from '../handlers/groups';

const router: Router = express.Router();

router.post("/", createGroup as RequestHandler);
router.get("/", getGroups as RequestHandler);
export default router;