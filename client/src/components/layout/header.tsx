import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CartDrawer from "../cart/cart-drawer";

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();
  
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItemsCount } = useCart();
  
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Navigation */}
      <div className="container py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary font-heading">ShopWorld</span>
        </Link>
        
        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-6">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search products, brands and categories"
              className="w-full pr-10 rounded-r-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              className="absolute right-0 top-0 h-full px-4 rounded-l-none"
            >
              <i className="fas fa-search"></i>
            </Button>
          </div>
        </form>
        
        {/* Navigation Icons */}
        <div className="flex items-center space-x-4">
          <Link href="/wishlist" className="hidden sm:block text-neutral-dark hover:text-primary transition-colors">
            <div className="relative">
              <i className="fas fa-heart text-xl"></i>
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">0</span>
            </div>
          </Link>
          
          <Button 
            variant="ghost" 
            className="p-0 text-neutral-dark hover:text-primary hover:bg-transparent"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="relative">
              <i className="fas fa-shopping-cart text-xl"></i>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </div>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-neutral-dark hover:text-primary hover:bg-transparent">
                <i className="fas fa-user-circle text-xl"></i>
                <span className="hidden md:inline">Account</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthenticated ? (
                <>
                  <div className="p-3 border-b border-neutral-light">
                    <p className="text-sm text-neutral-dark">Hello, {user?.firstName || user?.username}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Your Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Your Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <div className="p-3 border-b border-neutral-light">
                    <p className="text-sm text-neutral-dark">Welcome, Guest</p>
                    <div className="flex space-x-2 mt-2">
                      <Link href="/login" className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary-dark">
                        Sign In
                      </Link>
                      <Link href="/register" className="px-3 py-1 text-xs border border-neutral-medium text-neutral-dark rounded-md hover:bg-neutral-light">
                        Register
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Search Bar (Mobile) */}
      <form onSubmit={handleSearch} className="px-4 py-2 md:hidden">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search products..."
            className="w-full pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-0 top-0 h-full px-3 rounded-l-none"
          >
            <i className="fas fa-search"></i>
          </Button>
        </div>
      </form>
      
      {/* Categories Navigation */}
      <nav className="bg-neutral-darkest text-white">
        <div className="container">
          <ul className="flex space-x-1 overflow-x-auto scrollbar-hide py-2 text-sm">
            <li className="whitespace-nowrap">
              <Link href="/products" className="px-3 py-1 hover:bg-neutral-dark rounded-md inline-block">
                All Categories
              </Link>
            </li>
            {categories.map((category: any) => (
              <li key={category.id} className="whitespace-nowrap">
                <Link 
                  href={`/products/${category.slug}`}
                  className="px-3 py-1 hover:bg-neutral-dark rounded-md inline-block"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
