/**
 * SBOM Generator - Main App Component
 * 
 * @author Rupesh (rupesh)
 * @copyright 2025 Rupesh. All rights reserved.
 * @license MIT
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout/layout";
import Home from "@/pages/home";
import Create from "@/pages/create";
import Edit from "@/pages/edit";
import Search from "@/pages/search";
import NotFound from "@/pages/not-found";
import Settings from "@/pages/settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={Create} />
      <Route path="/edit/:id" component={Edit} />
      <Route path="/search" component={Search} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}
