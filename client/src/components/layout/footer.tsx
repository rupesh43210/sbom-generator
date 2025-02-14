import { Github, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col gap-4 py-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              2025 SBOM Generator. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <span className="flex items-center gap-1">
              Created with <Heart className="h-4 w-4 text-red-500 animate-pulse" /> by{" "}
              <a
                href="https://github.com/rupesh43210"
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:text-foreground hover:underline"
              >
                Rupesh
              </a>
            </span>
            <Separator orientation="vertical" className="h-4" />
            <a
              href="/docs"
              className="hover:text-foreground hover:underline"
            >
              Documentation
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a
              href="/privacy"
              className="hover:text-foreground hover:underline"
            >
              Privacy
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a
              href="/terms"
              className="hover:text-foreground hover:underline"
            >
              Terms
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/rupesh43210/sbom-generator"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Button variant="ghost" size="icon">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </a>
          <span className="text-sm text-muted-foreground">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
}
