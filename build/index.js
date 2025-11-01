var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  buttonClicks: () => buttonClicks,
  contactSubmissions: () => contactSubmissions,
  insertButtonClickSchema: () => insertButtonClickSchema,
  insertContactSubmissionSchema: () => insertContactSubmissionSchema,
  insertUserSchema: () => insertUserSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var contactSubmissions = pgTable("contact_submissions", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  addressed: boolean("addressed").notNull().default(false)
});
var buttonClicks = pgTable("button_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buttonType: text("button_type").notNull(),
  // 'call', 'email', 'whatsapp', 'website', 'social'
  buttonLabel: text("button_label").notNull(),
  // button text or social platform name
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata")
  // additional data like URL, etc.
});
var insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true
});
var insertButtonClickSchema = createInsertSchema(buttonClicks).omit({
  id: true,
  clickedAt: true
});

// server/storage.ts
import { randomUUID } from "crypto";

// server/db.ts
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Contact submissions
  async createContactSubmission(submission) {
    const [result] = await db.insert(contactSubmissions).values({ ...submission, id: randomUUID() }).returning();
    return result;
  }
  async getContactSubmissions(limit = 50) {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(limit);
  }
  async getContactSubmissionById(id) {
    const [submission] = await db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id));
    return submission || void 0;
  }
  async deleteContactSubmission(id) {
    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  }
  async markContactSubmissionAddressed(id) {
    await db.update(contactSubmissions).set({ addressed: true }).where(eq(contactSubmissions.id, id));
  }
  async editContactSubmission(id, { name, email, phone, service, message }) {
    await db.update(contactSubmissions).set({ name, email, phone, service, message }).where(eq(contactSubmissions.id, id));
  }
  // Button clicks tracking
  async trackButtonClick(click) {
    const [result] = await db.insert(buttonClicks).values(click).returning();
    return result;
  }
  async getButtonClicks(limit = 100) {
    return await db.select().from(buttonClicks).orderBy(desc(buttonClicks.clickedAt)).limit(limit);
  }
  async getButtonClickStats() {
    const result = await db.select({
      buttonType: buttonClicks.buttonType,
      buttonLabel: buttonClicks.buttonLabel,
      count: sql2`count(*)::int`
    }).from(buttonClicks).groupBy(buttonClicks.buttonType, buttonClicks.buttonLabel).orderBy(sql2`count(*) desc`);
    return result;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
var contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  service: z.string().min(1, "Service selection is required"),
  message: z.string().min(1, "Message is required")
});
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const formData = contactFormSchema.parse(req.body);
      const submissionData = {
        ...formData,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get("User-Agent")
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
  app2.post("/api/track-click", async (req, res) => {
    try {
      const clickData = insertButtonClickSchema.parse(req.body);
      const trackingData = {
        ...clickData,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get("User-Agent")
      };
      await storage.trackButtonClick(trackingData);
      res.json({ success: true });
    } catch (error) {
      console.error("Button click tracking error:", error);
      res.status(500).json({ success: false, message: "Failed to track click" });
    }
  });
  app2.get("/api/dashboard/submissions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const submissions = await storage.getContactSubmissions(limit);
      res.json({ success: true, data: submissions });
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      res.status(500).json({ success: false, message: "Failed to fetch submissions" });
    }
  });
  app2.get("/api/dashboard/clicks", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const clicks = await storage.getButtonClicks(limit);
      res.json({ success: true, data: clicks });
    } catch (error) {
      console.error("Failed to fetch clicks:", error);
      res.status(500).json({ success: false, message: "Failed to fetch clicks" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
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
          recentClicks
        }
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
    }
  });
  app2.delete("/api/dashboard/submissions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContactSubmission(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete submission:", error);
      res.status(500).json({ success: false, message: "Failed to delete submission" });
    }
  });
  app2.post("/api/dashboard/submissions/:id/addressed", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markContactSubmissionAddressed(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark as addressed:", error);
      res.status(500).json({ success: false, message: "Failed to mark as addressed" });
    }
  });
  app2.put("/api/dashboard/submissions/:id", async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": "http://localhost:5000"
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "127.0.0.1"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
