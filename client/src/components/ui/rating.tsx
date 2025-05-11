import { StarIcon } from "@radix-ui/react-icons";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({ value, max = 5, size = "md", className }: RatingProps) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);
  
  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };
  
  return (
    <div className={cn("flex items-center", className)}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <StarIcon key={`full-${i}`} className={cn("text-amber-400", sizeClass[size])} />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <Star key="half" className={cn("text-amber-400", sizeClass[size])} fill="url(#half-fill)" />
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className={cn("text-amber-400", sizeClass[size])} fill="none" />
      ))}
      
      {/* SVG definition for half-filled star */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="half-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
