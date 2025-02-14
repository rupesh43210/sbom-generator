import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, FileText, Search, Settings, Info } from "lucide-react";

export default function Documentation() {
  return (
    <div className="flex flex-col space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to use the SBOM Generator effectively.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>What is SBOM?</AlertTitle>
        <AlertDescription>
          A Software Bill of Materials (SBOM) is a formal record containing the details and supply chain relationships of various components used in building software.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="getting-started" className="space-y-4">
        <TabsList>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="creating-sbom">Creating SBOM</TabsTrigger>
          <TabsTrigger value="searching">Searching</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installation</CardTitle>
              <CardDescription>
                Follow these steps to install and set up SBOM Generator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Prerequisites</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Node.js v18 or higher</li>
                <li>npm or yarn package manager</li>
                <li>Git (optional)</li>
              </ul>

              <h3 className="text-lg font-semibold">Installation Steps</h3>
              <div className="bg-muted rounded-md p-4 space-y-2">
                <p className="font-mono text-sm">
                  # Clone the repository
                  <br />
                  git clone https://github.com/rupesh43210/sbom-generator.git
                  <br />
                  cd sbom-generator
                  <br />
                  <br />
                  # Run the installation script
                  <br />
                  chmod +x install.sh
                  <br />
                  ./install.sh
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creating-sbom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Creating an SBOM</CardTitle>
              <CardDescription>
                Learn how to generate Software Bill of Materials for your projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Steps to Create SBOM</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Click on the "Create" button in the navigation bar</li>
                  <li>Select your project directory or upload your package files</li>
                  <li>Choose the SBOM format (CycloneDX, SPDX)</li>
                  <li>Configure additional options if needed</li>
                  <li>Click "Generate SBOM" to create your report</li>
                </ol>

                <h3 className="text-lg font-semibold">Supported Formats</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>CycloneDX (XML, JSON)</li>
                  <li>SPDX (TAG, JSON, YAML)</li>
                  <li>Custom formats (configurable)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="searching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Searching and Analyzing SBOMs</CardTitle>
              <CardDescription>
                Discover how to search through and analyze your SBOMs effectively.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Search Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full-text search across all SBOM fields</li>
                  <li>Filter by component type, license, or version</li>
                  <li>Advanced query syntax support</li>
                  <li>Export search results</li>
                </ul>

                <h3 className="text-lg font-semibold">Vulnerability Scanning</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Integration with NVD database</li>
                  <li>Real-time vulnerability alerts</li>
                  <li>Detailed vulnerability reports</li>
                  <li>Remediation suggestions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration and Settings</CardTitle>
              <CardDescription>
                Learn how to configure SBOM Generator for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">API Configuration</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>NVD API key setup</li>
                  <li>Custom API endpoints</li>
                  <li>Rate limiting configuration</li>
                </ul>

                <h3 className="text-lg font-semibold">Output Customization</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Custom SBOM templates</li>
                  <li>Output format configuration</li>
                  <li>Report styling options</li>
                </ul>

                <h3 className="text-lg font-semibold">Environment Variables</h3>
                <div className="bg-muted rounded-md p-4 space-y-2">
                  <p className="font-mono text-sm">
                    NVD_API_KEY=your-api-key
                    <br />
                    OUTPUT_FORMAT=cyclonedx-json
                    <br />
                    SCAN_DEPTH=complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
