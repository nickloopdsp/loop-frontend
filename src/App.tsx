import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { ArtistProvider } from "@/contexts/ArtistContext";
import { ModeProvider } from "@/contexts/ModeContext";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="loop-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ArtistProvider>
        <ModeProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ChatProvider>
        </ModeProvider>
        </ArtistProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
