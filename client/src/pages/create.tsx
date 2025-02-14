import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { insertSbomSchema, type InsertSbom, type Component } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Plus, X, Hash, Download } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import {
  LICENSE_OPTIONS,
  COMPONENT_TYPES,
  COMMON_VENDORS,
  HASH_ALGORITHMS,
  CPE_PATTERNS,
  PURL_PATTERNS,
  KNOWN_COMPONENTS
} from "@/lib/constants";
import { searchNvdProducts, getProductVersions } from "@/lib/nvd";
import { ComboboxSearch } from "@/components/ui/combobox-search";
import { useState } from "react";
import type { Sbom } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getVulnerabilities, type VulnerabilityInfo } from "@/lib/nvd";

export type ComponentSearchResult = {
  value: string;
  label: string;
  cpe?: string;
};

const parseCpeName = (cpeName: string): { vendor: string; product: string; version: string; type: string } | null => {
  try {
    const parts = cpeName.split(':');
    if (parts.length < 6) return null;
    return {
      vendor: parts[3],
      product: parts[4],
      version: parts[5] !== '*' ? parts[5] : '',
      type: parts[2]
    };
  } catch (error) {
    console.error('Error parsing CPE:', error);
    return null;
  }
};

export default function Create() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [createdSbom, setCreatedSbom] = useState<Sbom | null>(null);

  const form = useForm<InsertSbom>({
    resolver: zodResolver(insertSbomSchema),
    defaultValues: {
      name: "",
      version: "",
      format: "CycloneDX",
      components: [],
      metadata: {
        timestamp: new Date().toISOString(),
        tools: [{
          vendor: "SBOM Generator",
          name: "Web Tool",
          version: "1.0"
        }],
        authors: [{
          name: "",
          email: "",
          organization: ""
        }],
        relationships: []
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSbom) => {
      const response = await apiRequest("POST", "/api/sboms", data);
      const newSbom = await response.json();
      return newSbom;
    },
    onSuccess: (data) => {
      setCreatedSbom(data);
      toast({
        title: "Success",
        description: "SBOM created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create SBOM",
        variant: "destructive"
      });
    }
  });

  const addComponent = () => {
    const currentComponents = form.getValues("components") || [];
    const newComponent: Component = {
      name: "",
      version: "",
      type: "library",
      supplier: "",
      author: "",
      description: "",
      licenses: [],
      purl: "",
      cpe: "",
      hashes: [],
      downloadLocation: "",
      homepage: "",
      copyrightText: ""
    };
    form.setValue("components", [...currentComponents, newComponent]);
  };

  const removeComponent = (index: number) => {
    const currentComponents = form.getValues("components");
    form.setValue(
      "components",
      currentComponents.filter((_, i) => i !== index)
    );
  };

  const addHash = (componentIndex: number) => {
    const components = form.getValues("components");
    const component = components[componentIndex];
    if (!component) return;

    const updatedComponent = {
      ...component,
      hashes: [
        ...(component.hashes || []),
        { algorithm: "SHA-256", value: "" }
      ]
    };

    const updatedComponents = [...components];
    updatedComponents[componentIndex] = updatedComponent;
    form.setValue("components", updatedComponents);
  };

  const removeHash = (componentIndex: number, hashIndex: number) => {
    const components = form.getValues("components");
    const component = components[componentIndex];
    if (!component) return;

    const updatedComponent = {
      ...component,
      hashes: component.hashes?.filter((_, i) => i !== hashIndex) || []
    };

    const updatedComponents = [...components];
    updatedComponents[componentIndex] = updatedComponent;
    form.setValue("components", updatedComponents);
  };

  const populateKnownComponent = async (index: number, selection: ComponentSearchResult) => {
    console.log('Populating component:', selection);
    const components = form.getValues("components");
    const currentComponent = components[index];
    if (!currentComponent) return;

    let updatedComponent = { ...currentComponent };

    // First check known components
    const lowercaseName = selection.value.toLowerCase();
    const knownComponent = Object.entries(KNOWN_COMPONENTS).find(([key]) =>
      lowercaseName.includes(key)
    );

    if (knownComponent) {
      const [, template] = knownComponent;
      const version = template.versions[0]; // Default to latest version

      updatedComponent = {
        ...updatedComponent,
        name: selection.value,
        type: template.type,
        version: version,
        supplier: template.supplier,
        author: template.author,
        description: template.description,
        licenses: template.licenses,
        purl: template.purl.replace('VERSION', version),
        cpe: template.cpe.replace('VERSION', version),
        homepage: template.homepage,
        downloadLocation: template.downloadLocation,
        copyrightText: template.copyrightText
      };
    } else if (selection.cpe) {
      console.log('Using CPE data:', selection.cpe);
      const cpeInfo = parseCpeName(selection.cpe);
      if (cpeInfo) {
        // Get versions for this CPE
        const versions = await getProductVersions(selection.cpe);
        console.log('Found versions:', versions);

        // Extract version from CPE or use the first version from NVD if available
        let version = cpeInfo.version;
        if (versions.length > 0 && versions[0].version !== 'unknown') {
          version = versions[0].version;
        }

        updatedComponent = {
          ...updatedComponent,
          name: selection.value,
          type: cpeInfo.type === 'a' ? 'application' : 'library',
          supplier: cpeInfo.vendor,
          version: version || '1.0.0', // Provide a default version if none is found
          cpe: selection.cpe
        };

        // If versions available and have references
        if (versions[0]?.references?.length) {
          const homepage = versions[0].references.find(ref => ref.includes('homepage') || ref.includes('website'));
          const download = versions[0].references.find(ref => ref.includes('download'));

          if (homepage) updatedComponent.homepage = homepage;
          if (download) updatedComponent.downloadLocation = download;
        }
      }
    }

    // Update the component in the form
    const updatedComponents = [...components];
    updatedComponents[index] = updatedComponent;
    form.setValue("components", updatedComponents);
  };

  const handleDownload = () => {
    if (!createdSbom) return;

    // Create a blob from the SBOM data
    const blob = new Blob([JSON.stringify(createdSbom, null, 2)], { type: 'application/json' });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `${createdSbom.name}-${createdSbom.version}.json`;

    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    window.URL.revokeObjectURL(url);

    toast({
      title: "SBOM Downloaded",
      description: `${createdSbom.name}-${createdSbom.version}.json has been downloaded.`
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create New SBOM</CardTitle>
          <CardDescription>Fill in the details to generate a new Software Bill of Materials</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
              {/* Basic Information */}
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CycloneDX">CycloneDX</SelectItem>
                          <SelectItem value="SPDX">SPDX</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose between CycloneDX and SPDX formats for your SBOM
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Components Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Components</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addComponent}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Component
                  </Button>
                </div>

                {form.watch("components").map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-medium">Component {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeComponent(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      {/* Component Name with NVD Search */}
                      <FormField
                        control={form.control}
                        name={`components.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <ComboboxSearch
                                value={field.value}
                                onValueChange={async (option: ComponentSearchResult) => {
                                  console.log('Selected option:', option);
                                  field.onChange(option.value);
                                  await populateKnownComponent(index, option);
                                }}
                                onSearch={async (query) => {
                                  try {
                                    const results = await searchNvdProducts(query);
                                    if (results.length === 0) {
                                      // If no NVD results, create a manual entry option
                                      return [{
                                        value: query,
                                        label: `Use "${query}" (Manual Entry)`,
                                        cpe: undefined
                                      }];
                                    }
                                    return results.map(result => ({
                                      value: result.cpe.titles[0]?.title || result.cpe.cpeName,
                                      label: result.cpe.titles[0]?.title || result.cpe.cpeName,
                                      cpe: result.cpe.cpeName
                                    }));
                                  } catch (error) {
                                    console.error('Error searching NVD:', error);
                                    // On error, allow manual entry
                                    return [{
                                      value: query,
                                      label: `Use "${query}" (Manual Entry)`,
                                      cpe: undefined
                                    }];
                                  }
                                }}
                                placeholder="Search for components or enter manually..."
                                emptyMessage="Enter component details manually or try a different search term."
                              />
                            </FormControl>
                            <FormDescription>
                              Search for components or enter details manually if not found in NVD database.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Rest of the component fields */}
                      <FormField
                        control={form.control}
                        name={`components.${index}.version`}
                        render={({ field }) => {
                          const componentName = form.watch(`components.${index}.name`);
                          const lowercaseName = componentName?.toLowerCase() || '';
                          const knownComponent = Object.entries(KNOWN_COMPONENTS).find(([key]) =>
                            lowercaseName.includes(key)
                          );

                          if (knownComponent) {
                            const [, template] = knownComponent;
                            return (
                              <FormItem>
                                <FormLabel>Version</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select version" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {template.versions.map((version) => (
                                      <SelectItem key={version} value={version}>
                                        {version}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            );
                          }

                          return (
                            <FormItem>
                              <FormLabel>Version</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name={`components.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <Combobox
                                options={COMPONENT_TYPES}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select component type"
                              />
                            </FormControl>
                            <FormDescription>
                              This will help auto-populate CPE and PURL patterns
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`components.${index}.purl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Package URL (PURL)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={PURL_PATTERNS.npm}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Common formats: {Object.values(PURL_PATTERNS).join(", ")}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`components.${index}.cpe`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPE</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={CPE_PATTERNS[
                                    form.watch(`components.${index}.type`) as keyof typeof CPE_PATTERNS
                                  ] || CPE_PATTERNS.application}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <FormLabel>Hashes</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addHash(index)}
                          >
                            <Hash className="h-4 w-4 mr-2" />
                            Add Hash
                          </Button>
                        </div>
                        {form.watch(`components.${index}.hashes`)?.map((_, hashIndex) => (
                          <div key={hashIndex} className="flex gap-2 items-end">
                            <FormField
                              control={form.control}
                              name={`components.${index}.hashes.${hashIndex}.algorithm`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {HASH_ALGORITHMS.map((algo) => (
                                        <SelectItem
                                          key={algo.value}
                                          value={algo.value}
                                        >
                                          {algo.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`components.${index}.hashes.${hashIndex}.value`}
                              render={({ field }) => (
                                <FormItem className="flex-[2]">
                                  <FormControl>
                                    <Input placeholder="Hash value" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeHash(index, hashIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <FormField
                        control={form.control}
                        name={`components.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`components.${index}.downloadLocation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Download Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`components.${index}.homepage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Homepage</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`components.${index}.copyrightText`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Copyright Text</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`components.${index}.supplier`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <FormControl>
                              <Combobox
                                options={COMMON_VENDORS.map(vendor => ({
                                  value: vendor,
                                  label: vendor
                                }))}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select or enter supplier"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`components.${index}.author`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Author</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`components.${index}.licenses`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(value) => field.onChange([value])}
                                value={field.value?.[0]}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select license" />
                                </SelectTrigger>
                                <SelectContent>
                                  {LICENSE_OPTIONS.map((license) => (
                                    <SelectItem key={license} value={license}>
                                      {license}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Vulnerabilities Section */}
                      {form.watch(`components.${index}.cpe`) && (
                        <div className="space-y-2">
                          <FormLabel>Vulnerabilities</FormLabel>
                          <VulnerabilitiesSection cpe={form.watch(`components.${index}.cpe`)} />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create SBOM"}
                </Button>
                {createdSbom && (
                  <Button type="button" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download SBOM
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function VulnerabilitiesSection({ cpe }: { cpe: string }) {
  const { data: vulnerabilities, isLoading } = useQuery<VulnerabilityInfo[]>({
    queryKey: [`/api/nvd/vulnerabilities?cpe=${encodeURIComponent(cpe)}`],
    enabled: !!cpe
  });

  if (!process.env.NVD_API_KEY) {
    return (
      <Alert>
        <AlertTitle>Manual Vulnerability Assessment</AlertTitle>
        <AlertDescription>
          NVD integration is not configured. Please assess vulnerabilities manually or add an NVD API key to enable automatic scanning.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <div>Checking for vulnerabilities...</div>;
  }

  if (!vulnerabilities?.length) {
    return (
      <Alert>
        <AlertTitle>No Known Vulnerabilities</AlertTitle>
        <AlertDescription>
          No vulnerabilities were found for this component in the NVD database.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {vulnerabilities.map((vuln) => (
        <Alert key={vuln.id} variant={vuln.severity === "CRITICAL" || vuln.severity === "HIGH" ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            {vuln.id}
            <Badge variant={vuln.severity === "CRITICAL" ? "destructive" :
                         vuln.severity === "HIGH" ? "destructive" :
                         vuln.severity === "MEDIUM" ? "default" :
                         "secondary"}>
              {vuln.severity} ({vuln.cvssScore})
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm">{vuln.description}</p>
            <div className="mt-2">
              <a
                href={vuln.references[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
              >
                More Info
              </a>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}