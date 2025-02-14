import { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sbom-ui-theme">
      <div className={cn(
        "relative min-h-screen flex flex-col",
        "bg-background text-foreground",
        "antialiased",
        className
      )}>
        <Header />
        <ScrollArea className="flex-1">
          <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-violet-200/20 to-purple-100/20 dark:from-blue-950/20 dark:via-violet-950/20 dark:to-purple-950/20 rounded-lg -z-10" />
              
              {/* Main content */}
              <div className="relative bg-background/80 backdrop-blur-sm shadow-lg rounded-lg p-6">
                {children}
              </div>
            </div>
          </main>
        </ScrollArea>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
