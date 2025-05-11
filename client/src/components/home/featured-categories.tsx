import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

const icons: Record<string, string> = {
  laptop: "fas fa-laptop",
  tshirt: "fas fa-tshirt",
  home: "fas fa-home",
  heartbeat: "fas fa-heartbeat",
  futbol: "fas fa-futbol",
  gift: "fas fa-gift"
};

const FeaturedCategories = () => {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  if (isLoading) {
    return (
      <section className="py-8 bg-white">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6 font-heading">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-neutral-light rounded-lg p-4 flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-8 bg-white">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6 font-heading">Featured Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/products/${category.slug}`} className="group">
              <div className="bg-neutral-light rounded-lg p-4 flex flex-col items-center transition-transform group-hover:scale-105">
                <div className="w-16 h-16 flex items-center justify-center text-primary mb-2">
                  <i className={`${icons[category.icon] || 'fas fa-tag'} text-3xl`}></i>
                </div>
                <span className="text-sm text-center font-medium">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
