import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Upload from "@/pages/Upload";
import Flashcards from "@/pages/Flashcards";
import Quiz from "@/pages/Quiz";
import Summary from "@/pages/Summary";
import Pricing from "@/pages/Pricing";
import Chat from "@/pages/Chat";
import AuthPage from "@/pages/auth-page";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import DocumentPage from "@/pages/document-page";

const DocumentRoute = () => {
  // This component wraps DocumentPage to handle the route parameters
  return <DocumentPage />;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/pricing" component={Pricing} />
      <ProtectedRoute path="/upload" component={Upload} />
      <ProtectedRoute path="/document/:id" component={DocumentRoute} />
      <ProtectedRoute path="/flashcards/:id" component={Flashcards} />
      <ProtectedRoute path="/quiz/:id" component={Quiz} />
      <ProtectedRoute path="/summary/:id" component={Summary} />
      <ProtectedRoute path="/chat" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
          <Header />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Router />
            </div>
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
