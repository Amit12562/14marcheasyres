import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Service routes
  app.get("/api/services", async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.get("/api/services/:id", async (req, res) => {
    const service = await storage.getService(parseInt(req.params.id));
    if (!service) return res.status(404).send("Service not found");
    res.json(service);
  });

  // Admin only routes
  app.post("/api/services", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.sendStatus(401);
    }
    const service = await storage.createService(req.body);
    res.status(201).json(service);
  });

  app.patch("/api/services/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.sendStatus(401);
    }
    const service = await storage.updateService(parseInt(req.params.id), req.body);
    res.json(service);
  });

  // Recharge routes
  app.post("/api/recharge/request", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const rechargeRequest = await storage.createRechargeRequest(
      req.user!.id,
      req.body
    );
    res.status(201).json(rechargeRequest);
  });

  app.get("/api/recharge/requests", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.sendStatus(401);
    }

    const requests = await storage.getRechargeRequests();
    res.json(requests);
  });

  app.post("/api/recharge/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.sendStatus(401);
    }

    await storage.approveRecharge(parseInt(req.params.id));
    res.sendStatus(200);
  });

  app.post("/api/recharge/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.sendStatus(401);
    }

    await storage.rejectRecharge(parseInt(req.params.id));
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}