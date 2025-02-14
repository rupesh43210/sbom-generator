/**
 * SBOM Generator
 * A comprehensive Software Bill of Materials (SBOM) generator with NVD integration
 * 
 * @author Rupesh (rupesh)
 * @copyright 2025 Rupesh. All rights reserved.
 * @license MIT
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import * as dotenv from 'dotenv';
import { AddressInfo } from 'net';
import { watch } from "fs";
import { config } from "dotenv";
import { resolve } from "path";

// Function to reload environment variables
function reloadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  console.log('Loading environment from:', envPath);
  
  try {
    const result = config({ path: envPath, override: true });
    
    if (result.error) {
      console.error('Error loading .env file:', result.error);
      return;
    }
    
    console.log('Environment variables reloaded successfully');
    console.log('NVD_API_KEY status:', process.env.NVD_API_KEY ? 'present' : 'missing');
  } catch (error) {
    console.error('Error in reloadEnv:', error);
  }
}

// Watch for changes in .env file
function watchEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  console.log('Starting to watch .env file at:', envPath);
  
  try {
    const watcher = watch(envPath, (eventType, filename) => {
      console.log('File event detected:', eventType, filename);
      if (eventType === 'change') {
        console.log('.env file changed, reloading environment variables');
        reloadEnv();
      }
    });

    watcher.on('error', (error) => {
      console.error('Error watching .env file:', error);
    });
    
    console.log('File watcher set up successfully');
  } catch (error) {
    console.error('Error setting up file watcher:', error);
  }
}

// Initial environment setup
console.log('Initializing environment...');
reloadEnv();
watchEnvFile();

// Verify environment variables
console.log('Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- NVD_API_KEY exists:', !!process.env.NVD_API_KEY);
console.log('- NVD_API_KEY length:', process.env.NVD_API_KEY?.length || 0);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS middleware
app.use((req, res, next) => {
  // Allow requests from any origin in development
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to find an available port
async function findAvailablePort(startPort: number): Promise<number> {
  const server = createServer();
  
  const tryPort = (port: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          tryPort(port + 1).then(resolve, reject);
        } else {
          reject(err);
        }
      });
      
      server.once('listening', () => {
        server.close(() => resolve(port));
      });
      
      server.listen(port, '0.0.0.0');
    });
  };
  
  try {
    const port = await tryPort(startPort);
    return port;
  } catch (err) {
    console.error('Port finding error:', err);
    throw err;
  }
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err); // Add error logging
  });

  // Serve static files first
  app.use(express.static("public"));

  try {
    if (process.env.NODE_ENV === 'development') {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const startPort = parseInt(process.env.PORT || '5000', 10);
    const port = await findAvailablePort(startPort);
    
    server.listen(port, '0.0.0.0', () => {
      const address = server.address() as AddressInfo;
      console.log(`🚀 Server running at http://localhost:${address.port}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
})();