import { Helmet } from "react-helmet";
import HeroSlider from "@/components/home/hero-slider";
import FeaturedCategories from "@/components/home/featured-categories";
import ProductGrid from "@/components/product/product-grid";
import PromoBanner from "@/components/home/promo-banner";
import FeaturesBanner from "@/components/home/features-banner";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>ShopWorld - Your One-Stop Shop for Everything</title>
        <meta name="description" content="Shop the latest products at ShopWorld. We offer electronics, fashion, home essentials and more with free shipping on orders over $50." />
        <meta property="og:title" content="ShopWorld - Your One-Stop Shop for Everything" />
        <meta property="og:description" content="Shop the latest products at ShopWorld. We offer electronics, fashion, home essentials and more with free shipping on orders over $50." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <HeroSlider />
      
      <FeaturedCategories />
      
      <ProductGrid 
        queryKey="/api/products?featured=true&limit=5"
        title="Deals of the Day"
        showViewAll
        viewAllLink="/products?featured=true"
        limit={5}
      />
      
      <PromoBanner 
        title="Tech Week Sale"
        description="Get up to 40% off on all electronics and tech gadgets. Limited time offer."
        buttonText="Shop Now"
        buttonLink="/products/electronics"
        imageSrc="https://images.unsplash.com/photo-1593344484962-796055d4a3a4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
      />
      
      <ProductGrid 
        queryKey="/api/products?newArrivals=true&limit=5"
        title="New Arrivals"
        showViewAll
        viewAllLink="/products?new=true"
        limit={5}
      />
      
      <FeaturesBanner />
    </>
  );
};

export default Home;
