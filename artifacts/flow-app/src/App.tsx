import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import FlowApp from './pages/FlowApp';
import NotFound from '@/pages/not-found';
import { ThemeProvider } from './components/ThemeProvider';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={FlowApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="flow-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <div className="min-h-[100dvh] w-full bg-[#E5E5E5] dark:bg-[#111] flex justify-center text-ink sm:py-8 sm:px-4 transition-colors">
              {/* The outer gray background mimics a desktop around a mobile app */}
              <div className="w-full max-w-[480px] bg-background sm:rounded-[2rem] sm:shadow-2xl sm:overflow-hidden relative flex flex-col sm:h-[90vh] sm:max-h-[850px] min-h-[100dvh] sm:min-h-0 border-border sm:border">
                <Router />
              </div>
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
