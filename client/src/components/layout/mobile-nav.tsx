import { Link, useLocation } from "wouter";

const MobileNav = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-neutral-light md:hidden z-30">
      <div className="flex justify-around py-2">
        <Link 
          href="/" 
          className={`flex flex-col items-center py-1 px-3 ${
            isActive('/') ? 'text-primary' : 'text-neutral-dark hover:text-primary'
          }`}
        >
          <i className="fas fa-home text-lg"></i>
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          href="/products" 
          className={`flex flex-col items-center py-1 px-3 ${
            isActive('/products') ? 'text-primary' : 'text-neutral-dark hover:text-primary'
          }`}
        >
          <i className="fas fa-list text-lg"></i>
          <span className="text-xs mt-1">Categories</span>
        </Link>
        
        <Link 
          href="/wishlist" 
          className={`flex flex-col items-center py-1 px-3 ${
            isActive('/wishlist') ? 'text-primary' : 'text-neutral-dark hover:text-primary'
          }`}
        >
          <i className="fas fa-heart text-lg"></i>
          <span className="text-xs mt-1">Wishlist</span>
        </Link>
        
        <Link 
          href="/profile" 
          className={`flex flex-col items-center py-1 px-3 ${
            isActive('/profile') ? 'text-primary' : 'text-neutral-dark hover:text-primary'
          }`}
        >
          <i className="fas fa-user text-lg"></i>
          <span className="text-xs mt-1">Account</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
