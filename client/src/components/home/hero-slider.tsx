import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  bgClass: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Summer Fashion Sale",
    description: "Up to 50% off on selected items",
    buttonText: "Shop Now",
    buttonLink: "/products/fashion",
    imageSrc: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    bgClass: "bg-gradient-to-r from-blue-500 to-purple-600"
  },
  {
    id: 2,
    title: "New Tech Arrivals",
    description: "The latest gadgets are here",
    buttonText: "Explore Now",
    buttonLink: "/products/electronics",
    imageSrc: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    bgClass: "bg-gradient-to-r from-gray-900 to-gray-800"
  },
  {
    id: 3,
    title: "Home Decor Essentials",
    description: "Transform your living space",
    buttonText: "Shop Collection",
    buttonLink: "/products/home-kitchen",
    imageSrc: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    bgClass: "bg-gradient-to-r from-amber-500 to-amber-700"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  
  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  
  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(goToNextSlide, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="relative bg-neutral-lightest overflow-hidden">
      <div className="relative h-[200px] sm:h-[300px] md:h-[400px]">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`h-full ${slide.bgClass} flex items-center`}>
              <div className="container flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 text-white space-y-4 mb-8 md:mb-0">
                  <h2 className="text-2xl md:text-4xl font-bold font-heading">{slide.title}</h2>
                  <p className="text-lg md:text-xl">{slide.description}</p>
                  <Button asChild>
                    <Link href={slide.buttonLink}>
                      {slide.buttonText}
                    </Link>
                  </Button>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <img 
                    src={slide.imageSrc} 
                    alt={slide.title} 
                    className="max-h-[250px] object-contain rounded-lg shadow-lg" 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slide controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full bg-white transition-opacity ${
                index === currentSlide ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Arrow controls */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-black/30 hover:bg-black/50 text-white rounded-full border-none"
          onClick={goToPrevSlide}
        >
          <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-black/30 hover:bg-black/50 text-white rounded-full border-none"
          onClick={goToNextSlide}
        >
          <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      </div>
    </section>
  );
};

export default HeroSlider;
