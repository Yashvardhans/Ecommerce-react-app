import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface PromoBannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
}

const PromoBanner = ({
  title = "Tech Week Sale",
  description = "Get up to 40% off on all electronics and tech gadgets. Limited time offer.",
  buttonText = "Shop Now",
  buttonLink = "/products/electronics",
  imageSrc = "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
}: PromoBannerProps) => {
  return (
    <section className="py-8">
      <div className="container">
        <div className="bg-gradient-to-r from-neutral-darkest to-neutral-dark rounded-lg overflow-hidden shadow-md">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-heading">{title}</h2>
              <p className="text-white/80 mb-6">{description}</p>
              <Button asChild className="bg-accent hover:bg-accent-dark">
                <Link href={buttonLink}>{buttonText}</Link>
              </Button>
            </div>
            <div className="md:w-1/2 p-6 flex justify-center">
              <img 
                src={imageSrc} 
                alt={title} 
                className="max-h-[300px] rounded-lg object-contain" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
