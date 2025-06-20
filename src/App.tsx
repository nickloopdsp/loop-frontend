import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppRoutes } from "./routes/AppRoutes";



function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="loop-ui-theme">
      {/* <QueryClientProvider client={queryClient}> */}
      <AppRoutes />
      {/* <ArtistProvider>
        <ModeProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ChatProvider>
        </ModeProvider>
        </ArtistProvider> */}
      {/* </QueryClientProvider> */}
    </ThemeProvider>
  );
}

export default App;
