import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ProductGrid from "@/components/product/product-grid";
import { Heart, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const ProductDetail = () => {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: [`/api/products/${slug}`],
  });

  if (isError) {
    navigate("/not-found");
    return null;
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({
        productId: product.id,
        quantity,
      });

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = () => {
    if (!product) return;

    toast({
      title: "Added to wishlist",
      description: `${product.name} has been added to your wishlist`,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="flex mt-4 gap-2">
              {[1, 2, 3].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-md" />
              ))}
            </div>
          </div>
          <div className="md:w-1/2">
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discount = product.comparePrice
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)
    : 0;

  const images = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{product.name} | ShopWorld</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} | ShopWorld`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
      </Helmet>

      <div className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="md:w-1/2">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full object-contain h-[400px]"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`border-2 rounded-md p-1 ${
                      activeImage === index ? "border-primary" : "border-neutral-light"
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - view ${index + 1}`}
                      className="w-16 h-16 object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold font-heading mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <Rating value={parseFloat(product.rating)} />
              <span className="text-sm text-neutral-dark">
                ({product.numReviews} reviews)
              </span>
            </div>

            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold mr-2">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-neutral-dark line-through mr-2">
                    ${parseFloat(product.comparePrice).toFixed(2)}
                  </span>
                  <span className="bg-accent text-white text-sm px-2 py-1 rounded">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-neutral-dark mb-6">{product.description}</p>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="font-medium mr-2">Availability:</span>
                {product.stock > 0 ? (
                  <span className="text-secondary">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-destructive">Out of Stock</span>
                )}
              </div>

              {product.categoryId && (
                <div className="flex items-center">
                  <span className="font-medium mr-2">Category:</span>
                  <span>Electronics</span>
                </div>
              )}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    onClick={decrementQuantity}
                  >
                    <i className="fas fa-minus"></i>
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 h-10 text-center rounded-none"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    onClick={incrementQuantity}
                  >
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button
                className="grow"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToWishlist}
              >
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>

        {/* Product Tabs (Description, Reviews, etc.) */}
        <Card className="mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted w-full justify-start rounded-b-none border-b">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.numReviews})</TabsTrigger>
            </TabsList>
            <CardContent className="pt-6">
              <TabsContent value="description">
                <h3 className="text-lg font-medium mb-2">Product Description</h3>
                <p className="text-neutral-dark whitespace-pre-line">{product.description}</p>
              </TabsContent>
              <TabsContent value="specifications">
                <h3 className="text-lg font-medium mb-2">Product Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Brand</span>
                      <span>ShopWorld</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Model</span>
                      <span>{product.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Stock</span>
                      <span>{product.stock} units</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews">
                <h3 className="text-lg font-medium mb-2">Customer Reviews</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Rating value={parseFloat(product.rating)} size="lg" />
                  <span className="text-lg font-medium">
                    {product.rating} out of 5
                  </span>
                </div>
                <p className="text-neutral-dark">Based on {product.numReviews} reviews</p>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Related Products */}
        <ProductGrid
          queryKey={`/api/products?category=${product.categoryId}&limit=5`}
          title="You Might Also Like"
          limit={5}
        />
      </div>
    </>
  );
};

export default ProductDetail;
