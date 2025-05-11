import { Link } from "wouter";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { toast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

export interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string | null;
  image: string;
  stock: number;
  rating: string;
  numReviews: number;
  isFeatured: boolean;
  isNew: boolean;
}

const ProductCard = ({
  id,
  name,
  slug,
  description,
  price,
  comparePrice,
  image,
  stock,
  rating,
  numReviews,
  isFeatured,
  isNew
}: ProductCardProps) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: id, 
      quantity: 1
    });
    
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart`,
    });
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Added to wishlist",
      description: `${name} has been added to your wishlist`,
    });
  };
  
  const discount = comparePrice ? Math.round((1 - (parseFloat(price) / parseFloat(comparePrice))) * 100) : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative">
        <Link href={`/product/${slug}`} className="block">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-48 object-contain p-4" 
          />
        </Link>
        
        {(isNew || discount > 0) && (
          <div className="absolute top-2 left-2">
            {isNew && <Badge className="bg-secondary hover:bg-secondary mr-1">NEW</Badge>}
            {discount > 0 && <Badge className="bg-accent hover:bg-accent-dark">-{discount}%</Badge>}
          </div>
        )}
        
        <button 
          className="absolute top-2 right-2 text-neutral-medium hover:text-accent transition-colors"
          onClick={handleAddToWishlist}
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4">
        <Link href={`/product/${slug}`} className="block">
          <h3 className="font-medium text-neutral-dark mb-1 truncate">{name}</h3>
          <p className="text-neutral-dark text-sm mb-2 line-clamp-2 h-10">{description}</p>
          
          <div className="flex items-center mb-2">
            <Rating value={parseFloat(rating)} size="sm" />
            <span className="text-xs text-neutral-dark ml-1">({numReviews})</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold">${parseFloat(price).toFixed(2)}</span>
              {comparePrice && (
                <span className="text-sm text-neutral-dark line-through ml-1">
                  ${parseFloat(comparePrice).toFixed(2)}
                </span>
              )}
            </div>
            
            <Button
              size="icon"
              className="bg-primary hover:bg-primary-dark text-white rounded-full"
              onClick={handleAddToCart}
              disabled={stock <= 0}
            >
              <i className="fas fa-shopping-cart"></i>
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
