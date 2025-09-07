import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
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

export function render(url) {
  return renderToString(
    <CurrentUserProvider>
      <CurrentDateProvider>
        <ThemeProvider>
          <NoteEditModeProvider>
            <CalendarViewModeProvider>
              <StaticRouter location={url}>
                <QueryClientProvider client={queryClient}>
                  <App />
                </QueryClientProvider>
              </StaticRouter>
            </CalendarViewModeProvider>
          </NoteEditModeProvider>
        </ThemeProvider>
      </CurrentDateProvider>
    </CurrentUserProvider>,
  );
}
