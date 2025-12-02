"use client";

import { useCurrentCategories, useStore } from '@/store/useStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from 'react';

export default function CategoryFilter() {
  const categories = useCurrentCategories();
  const { categoryFilter, setCategoryFilter } = useStore();
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-10 w-48 bg-zinc-900 rounded-md animate-pulse" />;
  }

  return (
    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
      <SelectTrigger className="w-auto min-w-[150px] max-w-[200px] bg-zinc-900 border-white/10 h-10">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
