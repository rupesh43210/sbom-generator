import { sboms, type Sbom, type InsertSbom } from "@shared/schema";

export interface IStorage {
  createSbom(sbom: InsertSbom): Promise<Sbom>;
  getSbom(id: number): Promise<Sbom | undefined>;
  getAllSboms(): Promise<Sbom[]>;
  updateSbom(id: number, sbom: Partial<InsertSbom>): Promise<Sbom | undefined>;
  deleteSbom(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private sboms: Map<number, Sbom>;
  private currentId: number;

  constructor() {
    this.sboms = new Map();
    this.currentId = 1;
  }

  async createSbom(sbom: InsertSbom): Promise<Sbom> {
    const id = this.currentId++;
    const newSbom: Sbom = { ...sbom, id };
    this.sboms.set(id, newSbom);
    return newSbom;
  }

  async getSbom(id: number): Promise<Sbom | undefined> {
    return this.sboms.get(id);
  }

  async getAllSboms(): Promise<Sbom[]> {
    return Array.from(this.sboms.values());
  }

  async updateSbom(id: number, sbom: Partial<InsertSbom>): Promise<Sbom | undefined> {
    const existing = this.sboms.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...sbom };
    this.sboms.set(id, updated);
    return updated;
  }

  async deleteSbom(id: number): Promise<boolean> {
    return this.sboms.delete(id);
  }
}

export const storage = new MemStorage();
