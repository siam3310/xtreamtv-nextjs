"use client";

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';

export default function SearchBar() {
  const { mediaType, setSearchQuery: setGlobalSearchQuery } = useStore();
  const [localQuery, setLocalQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset local search when media type changes
    setLocalQuery('');
  }, [mediaType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalQuery(query);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setGlobalSearchQuery(query);
    }, 300);
  };

  const placeholderText = {
    live: 'Search channels...',
    movie: 'Search movies...',
    series: 'Search series...',
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholderText[mediaType]}
        value={localQuery}
        onChange={handleChange}
        className="pl-9 bg-zinc-900 border-white/10 h-10"
      />
    </div>
  );
}
