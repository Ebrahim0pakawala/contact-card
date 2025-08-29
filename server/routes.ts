import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendContactEmail } from "./email";
import { z } from "zod";

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
      
      // Send email using SendGrid
      const emailSent = await sendContactEmail(formData);
      
      if (emailSent) {
        res.json({ success: true, message: "Thank you! Your message has been sent successfully." });
      } else {
        res.status(500).json({ success: false, message: "Failed to send email. Please try again." });
      }
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

  const httpServer = createServer(app);

  return httpServer;
}
