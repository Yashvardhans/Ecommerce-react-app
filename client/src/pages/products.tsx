import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import ProductCard from "@/components/product/product-card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Products = () => {
  const [location] = useLocation();
  const params = useParams();
  const { category } = params;
  
  const searchParams = new URLSearchParams(window.location.search);
  const search = searchParams.get("search");
  const featured = searchParams.get("featured") === "true";
  const newArrivals = searchParams.get("new") === "true";
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  let queryString = "/api/products";
  if (category) queryString = `/api/products?category=${category}`;
  if (featured) queryString = "/api/products?featured=true";
  if (newArrivals) queryString = "/api/products?newArrivals=true";
  
  const { data: categoryData } = useQuery({
    queryKey: category ? [`/api/categories/${category}`] : null,
    enabled: !!category,
  });
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: [queryString],
  });
  
  // Filter products based on search query
  const filteredProducts = search 
    ? products.filter((product: any) => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      )
    : products;
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, featured, newArrivals]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Build page title
  let pageTitle = "Products";
  if (category && categoryData) pageTitle = `${categoryData.name}`;
  if (featured) pageTitle = "Featured Products";
  if (newArrivals) pageTitle = "New Arrivals";
  if (search) pageTitle = `Search Results: "${search}"`;
  
  return (
    <div className="py-8">
      <Helmet>
        <title>{pageTitle} | ShopWorld</title>
        <meta name="description" content={`Browse our selection of ${pageTitle.toLowerCase()} at ShopWorld. Quality products at great prices with fast shipping.`} />
        <meta property="og:title" content={`${pageTitle} | ShopWorld`} />
        <meta property="og:description" content={`Browse our selection of ${pageTitle.toLowerCase()} at ShopWorld. Quality products at great prices with fast shipping.`} />
      </Helmet>
      
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading mb-2">{pageTitle}</h1>
          
          {category && categoryData && (
            <p className="text-neutral-dark">
              Browse our selection of {categoryData.name.toLowerCase()} products
            </p>
          )}
          
          {search && (
            <p className="text-neutral-dark">
              {filteredProducts.length} results for "{search}"
            </p>
          )}
          
          {featured && (
            <p className="text-neutral-dark">
              Check out our featured products with special discounts and offers
            </p>
          )}
          
          {newArrivals && (
            <p className="text-neutral-dark">
              Discover our latest arrivals, fresh in stock
            </p>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
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
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-neutral-dark mb-4">No products found</p>
                <Button asChild>
                  <a href="/products">View all products</a>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {currentItems.map((product: any) => (
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
                
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <Pagination.PrevButton
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          isActive={currentPage === i + 1}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      
                      <Pagination.NextButton
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
