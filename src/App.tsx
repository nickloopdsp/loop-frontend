import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { ArtistProvider } from "@/contexts/ArtistContext";
import { ModeProvider } from "@/contexts/ModeContext";
import { AppRoutes } from "./routes/AppRoutes";



function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="loop-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ArtistProvider>
          <ModeProvider>
            <ChatProvider>
              <TooltipProvider>
                <Toaster />
                <AppRoutes />
              </TooltipProvider>
            </ChatProvider>
          </ModeProvider>
        </ArtistProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
