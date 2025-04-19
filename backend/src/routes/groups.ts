import express, { Router, RequestHandler } from "express";
import { createGroup, getGroups } from "../handlers/groups";
import { Server } from "socket.io";

const router: Router = express.Router();

export default (io: Server) => {
  router.post("/", createGroup(io) as RequestHandler); // Pass the io instance
  router.get("/:user", getGroups as RequestHandler);
  return router;
};
