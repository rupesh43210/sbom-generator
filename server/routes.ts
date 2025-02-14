import type { Express, Request, Response } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertSbomSchema } from "@shared/schema";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface ManualComponentData {
  name: string;
  version: string;
  vendor?: string;
  description?: string;
  isProprietary: boolean;
  proprietaryInfo?: {
    owner: string;
    internalId?: string;
    confidentialityLevel?: string;
    lastUpdated?: string;
    maintainer?: string;
    notes?: string;
  };
  customMetadata?: Record<string, string>;
}

export async function registerRoutes(app: Express) {
  // NVD API Integration
  app.get("/api/nvd/search", async (req, res) => {
    try {
      const keyword = req.query.keyword as string;

      if (!keyword) {
        return res.status(400).json({
          error: 'Missing keyword',
          message: 'Search keyword is required'
        });
      }

      // Get the current API key from environment
      const apiKey = process.env.NVD_API_KEY;
      console.log('Current NVD_API_KEY status:', apiKey ? 'present' : 'missing');

      if (!apiKey) {
        console.log('No API key found in environment');
        return res.json([
          {
            value: 'manual-entry',
            label: `Add "${keyword}" (Manual Entry)`,
            data: {
              name: keyword,
              version: '',
              vendor: '',
              type: 'manual',
              isManualEntry: true
            }
          },
          {
            value: 'no-api-key',
            label: '⚠️ NVD API Key not configured',
            data: {
              name: 'NVD API Key Missing',
              version: '',
              vendor: '',
              type: 'error',
              error: 'Please configure NVD API key in .env file',
              isError: true
            }
          }
        ]);
      }

      const url = `https://services.nvd.nist.gov/rest/json/cpes/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=20`;
      console.log('Making NVD API request with key present');
      
      try {
        const response = await fetch(url, {
          headers: {
            'apiKey': apiKey,
            'User-Agent': 'SBOM-Generator/1.0'
          }
        });

        console.log('NVD API response status:', response.status);

        if (!response.ok) {
          console.error('NVD API error:', response.status, await response.text());
          return res.json([
            {
              value: 'manual-entry',
              label: `Add "${keyword}" (Manual Entry)`,
              data: {
                name: keyword,
                version: '',
                vendor: '',
                type: 'manual',
                isManualEntry: true
              }
            },
            {
              value: 'nvd-error',
              label: '⚠️ Cannot connect to NVD database',
              data: {
                name: 'NVD Connection Error',
                version: '',
                vendor: '',
                type: 'error',
                error: 'Unable to connect to NVD. Please check your internet connection.',
                isError: true
              }
            }
          ]);
        }

        const data = await response.json();
        console.log('NVD API response received with', data.products?.length || 0, 'products');
        
        // Transform NVD results to match frontend format
        const transformedProducts = data.products?.map(product => {
          const title = product.titles?.[0]?.title || '';
          const cpeParts = product.cpe?.cpeName?.split(':') || [];
          const vendor = cpeParts[3] || '';
          const productName = cpeParts[4] || '';
          const version = cpeParts[5] || '';

          const displayName = title || productName || 'Unknown Product';
          const displayVersion = version !== '*' ? version : '';
          const displayVendor = vendor !== '*' ? vendor : '';

          return {
            value: product.cpe?.cpeName || '',
            label: `${displayName} ${displayVersion} (${displayVendor})`.trim().replace(/\s+/g, ' '),
            data: {
              name: displayName,
              version: displayVersion,
              vendor: displayVendor,
              cpe: product.cpe?.cpeName,
              type: 'nvd'
            }
          };
        });

        // Add Manual Entry option at the beginning
        const resultsWithManual = [
          {
            value: 'manual-entry',
            label: `Add "${keyword}" (Manual Entry)`,
            data: {
              name: keyword,
              version: '',
              vendor: '',
              type: 'manual',
              isManualEntry: true
            }
          },
          ...transformedProducts
        ];

        res.json(resultsWithManual);
      } catch (error) {
        // Return a specific response for connection errors
        res.json([
          {
            value: 'manual-entry',
            label: `Add "${keyword}" (Manual Entry)`,
            data: {
              name: keyword,
              version: '',
              vendor: '',
              type: 'manual',
              isManualEntry: true
            }
          },
          {
            value: 'connection-error',
            label: '⚠️ Cannot connect to NVD database',
            data: {
              name: 'Connection Error',
              version: '',
              vendor: '',
              type: 'error',
              error: 'Unable to connect to NVD. Please check your internet connection.',
              isError: true
            }
          }
        ]);
      }
    } catch (error) {
      console.error('NVD search error:', error);
      // Return a specific response for unexpected errors
      res.json([
        {
          value: 'manual-entry',
          label: `Add "${keyword}" (Manual Entry)`,
          data: {
            name: keyword,
            version: '',
            vendor: '',
            type: 'manual',
            isManualEntry: true
          }
        },
        {
          value: 'error',
          label: '⚠️ Error searching components',
          data: {
            name: 'Search Error',
            version: '',
            vendor: '',
            type: 'error',
            error: 'An unexpected error occurred while searching components.',
            isError: true
          }
        }
      ]);
    }
  });

  app.get("/api/nvd/versions", async (req, res) => {
    try {
      const { cpe } = req.query;
      if (!cpe || typeof cpe !== 'string') {
        return res.status(400).json({ message: 'CPE is required' });
      }

      if (!process.env.NVD_API_KEY) {
        return res.status(400).json({ 
          error: 'NVD_API_KEY not found in environment',
          message: 'Please add your NVD API key to the .env file'
        });
      }

      const url = `https://services.nvd.nist.gov/rest/json/cpes/2.0?cpeMatchString=${encodeURIComponent(cpe)}`;
      
      const response = await fetch(url, {
        headers: {
          'apiKey': process.env.NVD_API_KEY
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('NVD API Error:', errorText);
        return res.status(response.status).json({ 
          error: 'NVD API Error',
          status: response.status,
          message: errorText
        });
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
      res.status(500).json({ 
        error: 'NVD Versions Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  app.get("/api/nvd/vulnerabilities", async (req, res) => {
    try {
      const { cpe } = req.query;
      if (!cpe || typeof cpe !== 'string') {
        return res.status(400).json({ message: 'CPE is required' });
      }

      if (!process.env.NVD_API_KEY) {
        return res.status(400).json({ 
          error: 'NVD_API_KEY not found in environment',
          message: 'Please add your NVD API key to the .env file'
        });
      }

      const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cpeName=${encodeURIComponent(cpe)}`;
      
      const response = await fetch(url, {
        headers: {
          'apiKey': process.env.NVD_API_KEY
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('NVD API Error:', errorText);
        return res.status(response.status).json({ 
          error: 'NVD API Error',
          status: response.status,
          message: errorText
        });
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
      res.status(500).json({ 
        error: 'NVD Vulnerabilities Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Update component endpoint to handle both NVD and manual updates
  app.post('/api/components/update', async (req: Request, res: Response) => {
    try {
      const { componentId, useNvd, manualData, keyword } = req.body;

      if (!componentId) {
        return res.status(400).json({
          error: 'Missing componentId',
          message: 'Component ID is required'
        });
      }

      if (useNvd) {
        // Use NVD API to get component data
        if (!process.env.NVD_API_KEY) {
          return res.status(400).json({ 
            error: 'NVD_API_KEY not found',
            message: 'Please add your NVD API key to the .env file'
          });
        }

        if (!keyword) {
          return res.status(400).json({
            error: 'Missing keyword',
            message: 'Keyword is required for NVD search'
          });
        }

        const url = `https://services.nvd.nist.gov/rest/json/cpes/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=20`;
        
        try {
          const response = await fetch(url, {
            headers: {
              'apiKey': process.env.NVD_API_KEY,
              'User-Agent': 'SBOM-Generator/1.0'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ 
              error: 'NVD API Error',
              status: response.status,
              message: errorText
            });
          }

          const data = await response.json();
          const products = data.products || [];
          
          res.json({
            componentId,
            source: 'nvd',
            data: products[0] || null,
            allMatches: products
          });
        } catch (error) {
          console.error('NVD API Request Failed:', error);
          res.status(500).json({ 
            error: 'NVD API Request Failed',
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      } else {
        // Handle manual/proprietary update
        if (!manualData) {
          return res.status(400).json({
            error: 'Missing manualData',
            message: 'Manual data is required when not using NVD'
          });
        }

        // Validate required fields for manual components
        if (!manualData.name || !manualData.version) {
          return res.status(400).json({
            error: 'Invalid manualData',
            message: 'Name and version are required for manual components'
          });
        }

        // If component is marked as proprietary, validate proprietary info
        if (manualData.isProprietary) {
          if (!manualData.proprietaryInfo?.owner) {
            return res.status(400).json({
              error: 'Invalid proprietaryInfo',
              message: 'Owner is required for proprietary components'
            });
          }

          // Add timestamp for proprietary components
          manualData.proprietaryInfo.lastUpdated = new Date().toISOString();
        }

        // Store the component data
        // Note: This is where you'd update your database/storage
        const storedData = {
          ...manualData,
          lastUpdated: new Date().toISOString(),
          componentId
        };

        res.json({
          componentId,
          source: 'manual',
          isProprietary: manualData.isProprietary,
          data: storedData
        });
      }
    } catch (error) {
      console.error('Component update error:', error);
      res.status(500).json({ 
        error: 'Component Update Failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add this after the existing NVD endpoints
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

  // Settings API
  app.post("/api/settings/nvd-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({
          error: 'Missing API key',
          message: 'API key is required'
        });
      }

      // Update both the environment variable and .env file
      process.env.NVD_API_KEY = apiKey;
      
      const envPath = resolve(process.cwd(), '.env');
      let envContent = '';
      
      try {
        envContent = readFileSync(envPath, 'utf8');
      } catch (error) {
        // If .env doesn't exist, create it
        envContent = '';
      }

      // Update or add NVD_API_KEY in .env content
      const lines = envContent.split('\n').filter(line => line.trim() !== '');
      let found = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('NVD_API_KEY=')) {
          lines[i] = `NVD_API_KEY=${apiKey}`;
          found = true;
          break;
        }
      }
      
      if (!found) {
        lines.push(`NVD_API_KEY=${apiKey}`);
      }

      // Write back to .env
      writeFileSync(envPath, lines.join('\n') + '\n');

      // Test the API key with NVD after saving
      const testUrl = "https://services.nvd.nist.gov/rest/json/cpes/2.0?resultsPerPage=1";
      const testResponse = await fetch(testUrl, {
        headers: {
          'apiKey': apiKey,
          'User-Agent': 'SBOM-Generator/1.0'
        }
      });

      if (!testResponse.ok) {
        console.warn('API key validation failed, but key was saved:', testResponse.status);
      }

      res.json({ 
        message: 'API key updated successfully',
        validated: testResponse.ok,
        warning: !testResponse.ok ? 'API key was saved but failed validation with NVD' : undefined
      });
    } catch (error) {
      console.error('Settings update error:', error);
      res.status(500).json({ 
        error: 'Settings Update Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Get current settings
  app.get("/api/settings", (req, res) => {
    res.json({
      hasNvdApiKey: !!process.env.NVD_API_KEY
    });
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