import express, { Router, RequestHandler } from "express";
import { createGroup, leaveGroup, getGroups } from "../handlers/groups";
import { Server } from "socket.io";

const router: Router = express.Router();

export default (io: Server) => {
  router.post("/", createGroup(io) as RequestHandler); // Pass the io instance
  router.get("/:user", getGroups as RequestHandler);
  router.delete("/:groupId/leave/:userId", leaveGroup(io) as any);
  return router;
};
