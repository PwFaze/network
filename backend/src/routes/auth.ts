import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { register, login } from '../handlers/auth';

const router: Router = express.Router();

router.post("/register", register as RequestHandler);
router.post("/login", login as RequestHandler);

export default router;