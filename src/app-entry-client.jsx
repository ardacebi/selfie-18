import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrentUserProvider } from "./client/contexts/CurrentUserContext";
import { CurrentDateProvider } from "./client/contexts/CurrentDateContext";
import { ThemeProvider } from "./client/contexts/ThemeContext";
import { NoteEditModeProvider } from "./client/contexts/NoteEditModeContext";
import { CalendarViewModeProvider } from "./client/contexts/CalendarViewModeContext";
import App from "./client/App";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, cacheTime: Infinity } },
});

hydrateRoot(
  document.getElementById("root"),
  <CurrentUserProvider>
    <CurrentDateProvider>
      <ThemeProvider>
        <NoteEditModeProvider>
          <CalendarViewModeProvider>
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <App />
              </QueryClientProvider>
            </BrowserRouter>
          </CalendarViewModeProvider>
        </NoteEditModeProvider>
      </ThemeProvider>
    </CurrentDateProvider>
  </CurrentUserProvider>,
);
