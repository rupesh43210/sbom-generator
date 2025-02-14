import { queryClient } from "./queryClient";

export interface NvdSearchResult {
  cpe: {
    cpeName: string;
    cpeNameId: string;
    created: string;
    lastModified: string;
    titles: Array<{ title: string; lang: string }>;
    refs: Array<{ ref: string; type: string }>;
    deprecated: boolean;
    deprecatedBy: string[];
    deprecationDate: string;
  };
  matchString: string[];
  matchType: string;
  searchScore: number;
}

export interface NvdVersionInfo {
  version: string;
  releaseDate?: string;
  cpe?: string;
  references?: string[];
}

export interface VulnerabilityInfo {
  id: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  cvssScore: number;
  publishedDate: string;
  lastModifiedDate: string;
  references: string[];
}

export function parseCpeName(cpeName: string) {
  // CPE format: cpe:2.3:a:vendor:product:version:*:*:*:*:*:*:*
  const parts = cpeName.split(':');
  if (parts.length < 6) return null;

  return {
    vendor: parts[3],
    product: parts[4],
    version: parts[5] !== '*' ? parts[5] : '',
    type: parts[2]
  };
}

export async function searchNvdProducts(
  keyword: string,
): Promise<NvdSearchResult[]> {
  if (!keyword || keyword.length < 3) return [];

  try {
    const response = await queryClient.fetchQuery({
      queryKey: [`/api/nvd/search?keyword=${encodeURIComponent(keyword)}`],
      queryFn: async () => {
        const res = await fetch(`/api/nvd/search?keyword=${encodeURIComponent(keyword)}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch from NVD');
        return res.json();
      },
    });

    return response;
  } catch (error) {
    console.error('Error searching NVD:', error);
    return [];
  }
}

export async function getProductVersions(
  cpe: string,
): Promise<NvdVersionInfo[]> {
  try {
    const response = await queryClient.fetchQuery({
      queryKey: [`/api/nvd/versions?cpe=${encodeURIComponent(cpe)}`],
      queryFn: async () => {
        const res = await fetch(`/api/nvd/versions?cpe=${encodeURIComponent(cpe)}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch versions from NVD');
        return res.json();
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching versions:', error);
    return [];
  }
}

export async function getVulnerabilities(cpe: string): Promise<VulnerabilityInfo[]> {
  try {
    const response = await queryClient.fetchQuery({
      queryKey: [`/api/nvd/vulnerabilities?cpe=${encodeURIComponent(cpe)}`],
      queryFn: async () => {
        const res = await fetch(`/api/nvd/vulnerabilities?cpe=${encodeURIComponent(cpe)}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch vulnerabilities from NVD');
        return res.json();
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    return [];
  }
}

// Function to get severity based on CVSS score
export function getSeverity(cvssScore: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  if (cvssScore >= 9.0) return "CRITICAL";
  if (cvssScore >= 7.0) return "HIGH";
  if (cvssScore >= 4.0) return "MEDIUM";
  return "LOW";
}