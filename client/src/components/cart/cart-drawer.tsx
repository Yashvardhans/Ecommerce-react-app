import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import CartItem from "./cart-item";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const [location] = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  // Set up event listener for external cart open
  useEffect(() => {
    const handleOpenCart = () => {
      if (!isOpen) onClose();
    };
    
    document.addEventListener('open-cart', handleOpenCart);
    return () => {
      document.removeEventListener('open-cart', handleOpenCart);
    };
  }, [isOpen, onClose]);
  
  // Close cart when location changes (but not on mount)
  useEffect(() => {
    let isInitialMount = true;
    
    if (!isInitialMount && isOpen) {
      onClose();
    }
    
    isInitialMount = false;
  }, [location, isOpen, onClose]);
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      onClose();
      return;
    }
    
    onClose();
  };
  
  const subtotal = cartTotal || 0;
  const shipping = 0; // Free shipping
  const tax = parseFloat(((subtotal || 0) * 0.08).toFixed(2)); // 8% tax
  const total = subtotal + shipping + tax;
  
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      
      {/* Cart drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-xl transform transition-transform z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-neutral-light flex justify-between items-center">
            <h3 className="text-lg font-bold">Your Cart ({cartItems.length})</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <i className="fas fa-times"></i>
            </Button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-10">
                <i className="fas fa-shopping-cart text-4xl text-neutral-medium mb-3"></i>
                <p className="text-neutral-dark mb-5">Your cart is empty</p>
                <Button onClick={onClose}>Start Shopping</Button>
              </div>
            ) : (
              cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-neutral-light">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Subtotal:</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Shipping:</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b border-neutral-light">
                <span className="font-medium">Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-lg">${total.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary-dark mb-2"
                onClick={handleCheckout}
                asChild
              >
                <Link href={isAuthenticated ? "/checkout" : "/login?redirect=checkout"}>
                  {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-neutral-medium text-neutral-dark hover:bg-neutral-light"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-destructive hover:text-destructive"
                onClick={clearCart}
              >
                <i className="fas fa-trash-alt mr-2"></i> Clear Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
