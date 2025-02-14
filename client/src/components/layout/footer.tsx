import { HeartIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="sticky bottom-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          © 2025 SBOM Generator. All rights reserved.
        </div>
        
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <span>Created with</span>
          <HeartIcon className="h-4 w-4 text-red-500" />
          <span>by</span>
          <a
            href="mailto:rupesh"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            Rupesh
          </a>
        </div>
      </div>
    </footer>
  );
}
