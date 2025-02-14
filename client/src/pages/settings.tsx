/**
 * SBOM Generator - Settings Component
 * 
 * @author Rupesh (rupesh)
 * @copyright 2025 Rupesh. All rights reserved.
 * @license MIT
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const settingsSchema = z.object({
  nvdApiKey: z.string().min(1, "NVD API Key is required"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      nvdApiKey: "",
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      const response = await fetch("/api/settings/nvd-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: data.nvdApiKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to update API key");
      }

      toast({
        title: "Settings Updated",
        description: "NVD API key has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update NVD API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Configure your SBOM Generator settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nvdApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NVD API Key</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          placeholder="Enter your NVD API key"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your NVD API key for accessing the National Vulnerability Database.
                      Get one from{" "}
                      <a
                        href="https://nvd.nist.gov/developers/request-an-api-key"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        NVD API Key Request
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
