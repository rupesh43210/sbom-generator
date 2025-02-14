import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, FileEdit, Trash2, Download } from "lucide-react";
import type { Sbom } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const { data: sboms, isLoading } = useQuery<Sbom[]>({ 
    queryKey: ["/api/sboms"]
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/sboms/${id}`);
      toast({
        title: "SBOM deleted",
        description: "The SBOM was successfully deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete SBOM",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (sbom: Sbom) => {
    // Create a blob from the SBOM data
    const blob = new Blob([JSON.stringify(sbom, null, 2)], { type: 'application/json' });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sbom.name}-${sbom.version}.json`;

    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    window.URL.revokeObjectURL(url);

    toast({
      title: "SBOM Downloaded",
      description: `${sbom.name}-${sbom.version}.json has been downloaded.`
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C3E50]">SBOM Generator</h1>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New SBOM
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sboms?.map((sbom) => (
          <Card key={sbom.id}>
            <CardHeader>
              <CardTitle>{sbom.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Version: {sbom.version} | Format: {sbom.format}
              </p>
              <p className="text-sm mb-4">
                Components: {sbom.components.length}
              </p>
              <div className="flex gap-2">
                <Link href={`/edit/${sbom.id}`}>
                  <Button variant="outline" size="sm">
                    <FileEdit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(sbom)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(sbom.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}