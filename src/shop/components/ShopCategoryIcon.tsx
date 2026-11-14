import React from 'react';
import {
  Smartphone,
  Laptop,
  Cpu,
  Store,
  ShoppingBasket,
  Shirt,
  Sparkles,
  Pill,
  BookOpen,
  Gift,
  Hammer,
  Briefcase,
} from 'lucide-react';
import { ShopCategoryDefinition } from '../shopCategoriesConfig';

export const ShopCategoryIcon: React.FC<{
  iconName: ShopCategoryDefinition['iconName'];
  className?: string;
}> = ({ iconName, className = 'w-5 h-5' }) => {
  switch (iconName) {
    case 'Smartphone':
      return <Smartphone className={className} />;
    case 'Laptop':
      return <Laptop className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Store':
      return <Store className={className} />;
    case 'ShoppingBasket':
      return <ShoppingBasket className={className} />;
    case 'Shirt':
      return <Shirt className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Pill':
      return <Pill className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Gift':
      return <Gift className={className} />;
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Briefcase':
    default:
      return <Briefcase className={className} />;
  }
};
