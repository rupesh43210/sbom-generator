import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// SBOM table definition
export const sboms = pgTable("sboms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  format: text("format").notNull(), // CycloneDX/SPDX
  components: jsonb("components").notNull().$type<Component[]>(),
  metadata: jsonb("metadata").notNull().$type<Metadata>(),
});

// Component schema with enhanced fields based on standards
export const componentSchema = z.object({
  name: z.string().min(1, "Component name is required"),
  version: z.string().min(1, "Version is required"),
  type: z.enum(["library", "framework", "application", "container", "operating-system", "device", "file"]),
  supplier: z.string().optional(),
  author: z.string().optional(),
  description: z.string().optional(),
  licenses: z.array(z.string()).optional(),
  purl: z.string().optional(), // Package URL
  cpe: z.string().optional(), // Common Platform Enumeration
  hashes: z.array(z.object({
    algorithm: z.enum(["SHA-1", "SHA-256", "SHA-512", "MD5"]),
    value: z.string()
  })).optional(),
  downloadLocation: z.string().optional(),
  homepage: z.string().optional(),
  copyrightText: z.string().optional()
});

export type Component = z.infer<typeof componentSchema>;

// Metadata schema with enhanced fields
export const metadataSchema = z.object({
  timestamp: z.string(),
  tools: z.array(z.object({
    vendor: z.string(),
    name: z.string(),
    version: z.string()
  })),
  authors: z.array(z.object({
    name: z.string(),
    email: z.string().optional(),
    organization: z.string().optional()
  })),
  documentNamespace: z.string().optional(), // Required for SPDX
  licenseListVersion: z.string().optional(), // SPDX license list version
  relationships: z.array(z.object({
    sourceComponent: z.string(),
    targetComponent: z.string(),
    relationshipType: z.enum([
      "DEPENDS_ON",
      "CONTAINS",
      "DEPENDENCY_OF",
      "DEV_DEPENDENCY_OF",
      "OPTIONAL_DEPENDENCY_OF",
      "PROVIDED_BY",
      "TEST_DEPENDENCY_OF"
    ])
  })).optional()
});

export type Metadata = z.infer<typeof metadataSchema>;

// Insert schema
export const insertSbomSchema = createInsertSchema(sboms).pick({
  name: true,
  version: true,
  format: true,
  components: true,
  metadata: true
});

export type InsertSbom = z.infer<typeof insertSbomSchema>;
export type Sbom = typeof sboms.$inferSelect;