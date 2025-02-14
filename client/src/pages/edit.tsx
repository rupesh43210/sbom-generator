import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { insertSbomSchema, type InsertSbom, type Sbom } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Edit({ params }: { params: { id: string } }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const id = parseInt(params.id);

  const { data: sbom, isLoading } = useQuery<Sbom>({
    queryKey: [`/api/sboms/${id}`]
  });

  const form = useForm<InsertSbom>({
    resolver: zodResolver(insertSbomSchema),
    values: sbom as InsertSbom,
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSbom) => {
      await apiRequest("PATCH", `/api/sboms/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SBOM updated successfully"
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update SBOM",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!sbom) {
    return <div className="flex justify-center p-8">SBOM not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit SBOM</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
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
