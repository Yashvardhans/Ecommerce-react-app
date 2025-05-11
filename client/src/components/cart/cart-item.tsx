import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

interface CartItemProps {
  item: {
    id: number;
    productId: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      slug: string;
      price: string;
      image: string;
    };
  };
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateCartItemQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    updateCartItemQuantity(item.id, newQuantity).finally(() => {
      setIsUpdating(false);
    });
  };
  
  const handleRemove = () => {
    removeFromCart(item.id);
  };
  
  return (
    <div className="flex border-b border-neutral-light pb-4">
      <Link href={`/product/${item.product.slug}`} className="w-20 h-20 flex-shrink-0">
        <img 
          src={item.product.image} 
          alt={item.product.name} 
          className="w-full h-full object-contain" 
        />
      </Link>
      
      <div className="ml-4 flex-grow">
        <Link href={`/product/${item.product.slug}`} className="font-medium text-neutral-dark mb-1 hover:text-primary">
          {item.product.name}
        </Link>
        
        <p className="text-sm text-neutral-dark mb-2">
          ${parseFloat(item.product.price).toFixed(2)} x {item.quantity}
        </p>
        
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6 w-6 rounded-full p-0"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
          >
            <i className="fas fa-minus text-xs"></i>
          </Button>
          
          <span className="mx-2 text-sm">{item.quantity}</span>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-6 w-6 rounded-full p-0"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={isUpdating}
          >
            <i className="fas fa-plus text-xs"></i>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto p-0 h-6 w-6 text-neutral-dark hover:text-destructive"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            <i className="fas fa-trash-alt text-xs"></i>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
