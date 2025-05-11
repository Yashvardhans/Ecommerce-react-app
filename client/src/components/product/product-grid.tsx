import { useQuery } from "@tanstack/react-query";
import ProductCard from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  queryKey: string;
  title?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  emptyMessage?: string;
  limit?: number;
}

const ProductGrid = ({
  queryKey,
  title,
  showViewAll = false,
  viewAllLink = "/products",
  emptyMessage = "No products found",
  limit
}: ProductGridProps) => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: [queryKey],
  });
  
  // Filter products if limit is provided
  const displayProducts = limit ? products.slice(0, limit) : products;
  
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container">
          {title && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-heading">{title}</h2>
              {showViewAll && (
                <a href={viewAllLink} className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
                  View All <i className="fas fa-chevron-right ml-1 text-xs"></i>
                </a>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: limit || 10 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (displayProducts.length === 0) {
    return (
      <div className="py-8">
        <div className="container">
          {title && (
            <h2 className="text-2xl font-bold font-heading mb-6">{title}</h2>
          )}
          <div className="text-center py-12">
            <p className="text-lg text-neutral-dark">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <div className="container">
        {title && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-heading">{title}</h2>
            {showViewAll && (
              <a href={viewAllLink} className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
                View All <i className="fas fa-chevron-right ml-1 text-xs"></i>
              </a>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              description={product.description}
              price={product.price}
              comparePrice={product.comparePrice}
              image={product.image}
              stock={product.stock}
              rating={product.rating}
              numReviews={product.numReviews}
              isFeatured={product.isFeatured}
              isNew={product.isNew}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
