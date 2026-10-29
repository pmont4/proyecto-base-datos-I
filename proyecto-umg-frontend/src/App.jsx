import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainPage } from "./page/MainPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, gcTime: 5 * 60_000, retry: 1 }
  }
});

export const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <MainPage />
    </QueryClientProvider>
  );

}
