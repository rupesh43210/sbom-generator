import { GithubIcon, PackageIcon, SettingsIcon, PlusCircleIcon, SearchIcon, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <PackageIcon className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                SBOM Generator
              </span>
            </a>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/">
              <a>
                <Button 
                  variant={location === "/" ? "secondary" : "ghost"}
                  className="flex items-center space-x-2"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </a>
            </Link>
            <Link href="/create">
              <a>
                <Button 
                  variant={location === "/create" ? "secondary" : "ghost"}
                  className="flex items-center space-x-2"
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  <span>Create SBOM</span>
                </Button>
              </a>
            </Link>
            <Link href="/search">
              <a>
                <Button 
                  variant={location === "/search" ? "secondary" : "ghost"}
                  className="flex items-center space-x-2"
                >
                  <SearchIcon className="h-4 w-4" />
                  <span>Search</span>
                </Button>
              </a>
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Button variant="outline" className="text-sm">
                Version 1.0.0
              </Button>
            </div>
            
            <nav className="flex items-center space-x-2">
              <Link href="/settings">
                <a>
                  <Button 
                    variant={location === "/settings" ? "secondary" : "ghost"} 
                    size="icon"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </a>
              </Link>
              <a
                href="https://github.com/[your-username]/sbom-generator"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="ghost" size="icon">
                  <GithubIcon className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </Button>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
