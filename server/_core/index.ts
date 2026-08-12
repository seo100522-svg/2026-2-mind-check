import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { sdk } from "./sdk";
import { serveStatic, setupVite } from "./vite";
import { getRawAssessmentExportRows } from "../studentRecordsDb";
import { buildRawAssessmentXlsx } from "../rawAssessmentXlsx";
import { isProjectOwner } from "../ownerAccess";
import { hasAdministratorPasswordSession } from "../adminPassword";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.get("/api/assessment/raw-export.xlsx", async (req, res) => {
    try {
      let user;
      try { user = await sdk.authenticateRequest(req); } catch { return res.status(403).json({ error: "소유자 권한이 필요합니다." }); }
      if (!(await isProjectOwner(user)) || !hasAdministratorPasswordSession(req, user.openId)) return res.status(403).json({ error: "관리자 비밀번호 확인이 필요합니다." });
      const department = typeof req.query.department === "string" ? req.query.department.trim().slice(0, 160) || undefined : undefined;
      const rows = await getRawAssessmentExportRows(department);
      const suffix = department ? `-${department.replace(/[^\w가-힣-]+/g, "_")}` : "-all";
      const fileName = `healing-play-station-raw${suffix}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("X-Export-Count", String(rows.length));
      return res.send(buildRawAssessmentXlsx(rows));
    } catch (error) {
      console.error("[assessment export]", error);
      return res.status(500).json({ error: "원자료 엑셀 파일을 생성하지 못했습니다." });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
