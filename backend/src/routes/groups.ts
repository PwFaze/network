import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { createGroup } from '../handlers/groups';

const router: Router = express.Router();

router.post("/", createGroup as RequestHandler);

export default router;