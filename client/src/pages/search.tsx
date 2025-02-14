/**
 * SBOM Generator - Search Page
 * 
 * @author Rupesh (rupesh)
 * @copyright 2025 Rupesh. All rights reserved.
 * @license MIT
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search SBOMs</h1>
          <p className="text-muted-foreground">
            Search through your generated Software Bill of Materials
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
            <CardDescription>
              Filter SBOMs by component name, version, or vendor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found 0 results matching your search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Enter a search query to find SBOMs
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
