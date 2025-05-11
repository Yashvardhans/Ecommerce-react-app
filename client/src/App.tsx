import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/cart-context";
import { AuthProvider } from "./context/auth-context";

import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import MobileNav from "./components/layout/mobile-nav";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:category" component={Products} />
          <Route path="/product/:slug" component={ProductDetail} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/profile" component={Profile} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/orders" component={Orders} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
