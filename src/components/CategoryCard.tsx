import { motion } from "framer-motion";
import { CategoryInfo } from "@/lib/diagnostic-data";

interface CategoryCardProps {
  category: CategoryInfo;
  onSelect: (id: string) => void;
  index: number;
}

const CategoryCard = ({ category, onSelect, index }: CategoryCardProps) => {
  const Icon = category.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={() => onSelect(category.id)}
      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-all duration-200 hover:shadow-lg hover:border-accent/30 hover:-translate-y-0.5 active:scale-95 cursor-pointer touch-manipulation min-h-[100px]"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <span className="font-heading text-lg text-foreground">{category.label}</span>
    </motion.button>
  );
};

export default CategoryCard;
