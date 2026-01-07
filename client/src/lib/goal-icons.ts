import { 
  Heart, Target, Dumbbell, Utensils, ShoppingCart,
  Plane, MapPin, Shield, Briefcase, Wine,
  Sofa, ChefHat, Flower2, Waves, Bed, Bath,
  Home, Key, FileText, Languages, GraduationCap,
  Calendar, UtensilsCrossed, Book, Leaf, GlassWater,
  type LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "heart": Heart,
  "target": Target,
  "dumbbell": Dumbbell,
  "utensils": Utensils,
  "cart": ShoppingCart,
  "plane": Plane,
  "mappin": MapPin,
  "shield": Shield,
  "briefcase": Briefcase,
  "wine": Wine,
  "sofa": Sofa,
  "chef": ChefHat,
  "flower": Flower2,
  "waves": Waves,
  "bed": Bed,
  "bath": Bath,
  "home": Home,
  "key": Key,
  "file": FileText,
  "languages": Languages,
  "graduation": GraduationCap,
  "calendar": Calendar,
  "fork": UtensilsCrossed,
  "book": Book,
  "leaf": Leaf,
  "glass": GlassWater,
};

const categoryDefaults: Record<string, LucideIcon> = {
  "lifestyle": Heart,
  "savings": MapPin,
  "business": Briefcase,
  "casa": Home,
  "milestones": Target,
  "fun": Calendar,
};

export function getGoalIcon(category?: string): LucideIcon {
  if (category && categoryDefaults[category]) {
    return categoryDefaults[category];
  }
  return Target;
}

export function getIconByName(name?: string): LucideIcon | null {
  if (!name) return null;
  const key = name.toLowerCase();
  return iconMap[key] || null;
}
