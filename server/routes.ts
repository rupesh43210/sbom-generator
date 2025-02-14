import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertSbomSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // NVD API Integration
  app.get("/api/nvd/search", async (req, res) => {
    try {
      const { keyword } = req.query;
      if (!keyword || typeof keyword !== 'string') {
        return res.status(400).json({ message: 'Keyword is required' });
      }

      const apiKey = process.env.NVD_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'NVD API key not configured' });
      }

      const response = await fetch(
        `https://services.nvd.nist.gov/rest/json/cpes/2.0?keywordSearch=${encodeURIComponent(keyword)}`,
        {
          headers: {
            'apiKey': apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`NVD API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data.products || []);
    } catch (error) {
      console.error('NVD search error:', error);
      res.status(500).json({ message: 'Failed to search NVD database' });
    }
  });

  app.get("/api/nvd/versions", async (req, res) => {
    try {
      const { cpe } = req.query;
      if (!cpe || typeof cpe !== 'string') {
        return res.status(400).json({ message: 'CPE is required' });
      }

      const apiKey = process.env.NVD_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'NVD API key not configured' });
      }

      const response = await fetch(
        `https://services.nvd.nist.gov/rest/json/cpes/2.0?cpeMatchString=${encodeURIComponent(cpe)}`,
        {
          headers: {
            'apiKey': apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`NVD API error: ${response.statusText}`);
      }

      const data = await response.json();
      const versions = data.products?.map((product: any) => {
        // Extract version from CPE name
        const cpeParts = product.cpe?.cpeName?.split(':') || [];
        const version = cpeParts[5] !== '*' ? cpeParts[5] : undefined;

        return {
          version: version || 'latest',
          releaseDate: product.cpe?.created,
          cpe: product.cpe?.cpeName,
          references: product.cpe?.refs?.map((ref: any) => ref.ref) || []
        };
      }).filter((v: any) => v.version !== 'latest') || [];

      // If no specific versions found, return a default version
      if (versions.length === 0) {
        const cpeParts = cpe.split(':');
        const defaultVersion = cpeParts[5] !== '*' ? cpeParts[5] : 'latest';
        versions.push({
          version: defaultVersion,
          releaseDate: new Date().toISOString(),
          cpe: cpe,
          references: []
        });
      }

      res.json(versions);
    } catch (error) {
      console.error('NVD versions error:', error);
      res.status(500).json({ message: 'Failed to fetch versions from NVD database' });
    }
  });

  // Add this after the existing NVD endpoints
  app.get("/api/nvd/vulnerabilities", async (req, res) => {
    try {
      const { cpe } = req.query;
      if (!cpe || typeof cpe !== 'string') {
        return res.status(400).json({ message: 'CPE is required' });
      }

      const apiKey = process.env.NVD_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'NVD API key not configured' });
      }

      const response = await fetch(
        `https://services.nvd.nist.gov/rest/json/cves/2.0?cpeName=${encodeURIComponent(cpe)}`,
        {
          headers: {
            'apiKey': apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`NVD API error: ${response.statusText}`);
      }

      const data = await response.json();
      const vulnerabilities = data.vulnerabilities?.map((vuln: any) => {
        const cve = vuln.cve;
        const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0] || cve.metrics?.cvssMetricV2?.[0];
        const cvssScore = metrics?.cvssData?.baseScore || 0;

        return {
          id: cve.id,
          description: cve.descriptions?.find((desc: any) => desc.lang === 'en')?.value || 'No description available',
          severity: getSeverity(cvssScore),
          cvssScore,
          publishedDate: cve.published,
          lastModifiedDate: cve.lastModified,
          references: cve.references?.map((ref: any) => ref.url) || []
        };
      }) || [];

      res.json(vulnerabilities);
    } catch (error) {
      console.error('NVD vulnerabilities error:', error);
      res.status(500).json({ message: 'Failed to fetch vulnerabilities from NVD database' });
    }
  });

  // Existing SBOM routes...
  app.get("/api/sboms", async (_req, res) => {
    const sboms = await storage.getAllSboms();
    res.json(sboms);
  });

  app.get("/api/sboms/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const sbom = await storage.getSbom(id);
    if (!sbom) {
      return res.status(404).json({ message: "SBOM not found" });
    }
    res.json(sbom);
  });

  app.post("/api/sboms", async (req, res) => {
    const result = insertSbomSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.message });
    }
    const sbom = await storage.createSbom(result.data);
    res.status(201).json(sbom);
  });

  app.patch("/api/sboms/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertSbomSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.message });
    }
    const updated = await storage.updateSbom(id, result.data);
    if (!updated) {
      return res.status(404).json({ message: "SBOM not found" });
    }
    res.json(updated);
  });

  app.delete("/api/sboms/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteSbom(id);
    if (!deleted) {
      return res.status(404).json({ message: "SBOM not found" });
    }
    res.status(204).send();
  });

  return createServer(app);
}

// Helper function for severity calculation
function getSeverity(cvssScore: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  if (cvssScore >= 9.0) return "CRITICAL";
  if (cvssScore >= 7.0) return "HIGH";
  if (cvssScore >= 4.0) return "MEDIUM";
  return "LOW";
}