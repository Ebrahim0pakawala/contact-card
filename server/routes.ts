import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendContactEmail } from "./email";
import { z } from "zod";
import { insertContactSubmissionSchema, insertButtonClickSchema } from "@shared/schema";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  service: z.string().min(1, "Service selection is required"),
  message: z.string().min(1, "Message is required")
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate the request body
      const formData = contactFormSchema.parse(req.body);
      
      // Save to database instead of sending email (since email service is not working)
      const submissionData = {
        ...formData,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      };
      
      const submission = await storage.createContactSubmission(submissionData);
      
      res.json({ 
        success: true, 
        message: "Thank you! Your message has been received successfully. We'll get back to you soon.",
        submissionId: submission.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Please fill in all required fields correctly.",
          errors: error.errors 
        });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({ success: false, message: "An error occurred. Please try again." });
      }
    }
  });

  // Button click tracking endpoint
  app.post("/api/track-click", async (req, res) => {
    try {
      const clickData = insertButtonClickSchema.parse(req.body);
      
      const trackingData = {
        ...clickData,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      };
      
      await storage.trackButtonClick(trackingData);
      res.json({ success: true });
    } catch (error) {
      console.error("Button click tracking error:", error);
      res.status(500).json({ success: false, message: "Failed to track click" });
    }
  });

  // Dashboard endpoints
  app.get("/api/dashboard/submissions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const submissions = await storage.getContactSubmissions(limit);
      res.json({ success: true, data: submissions });
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      res.status(500).json({ success: false, message: "Failed to fetch submissions" });
    }
  });

  app.get("/api/dashboard/clicks", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const clicks = await storage.getButtonClicks(limit);
      res.json({ success: true, data: clicks });
    } catch (error) {
      console.error("Failed to fetch clicks:", error);
      res.status(500).json({ success: false, message: "Failed to fetch clicks" });
    }
  });

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const [clickStats, submissions, recentClicks] = await Promise.all([
        storage.getButtonClickStats(),
        storage.getContactSubmissions(10),
        storage.getButtonClicks(10)
      ]);
      
      res.json({ 
        success: true, 
        data: {
          clickStats,
          totalSubmissions: submissions.length,
          recentSubmissions: submissions,
          recentClicks: recentClicks
        }
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
    }
  });

  // --- Added dashboard actions below ---

  // Delete a submission
  app.delete("/api/dashboard/submissions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContactSubmission(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete submission:", error);
      res.status(500).json({ success: false, message: "Failed to delete submission" });
    }
  });

  // Mark as addressed
  app.post("/api/dashboard/submissions/:id/addressed", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markContactSubmissionAddressed(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark as addressed:", error);
      res.status(500).json({ success: false, message: "Failed to mark as addressed" });
    }
  });

  // Edit a submission
  app.put("/api/dashboard/submissions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, service, message } = req.body;
      await storage.editContactSubmission(id, { name, email, phone, service, message });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to edit submission:", error);
      res.status(500).json({ success: false, message: "Failed to edit submission" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}