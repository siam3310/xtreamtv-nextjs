"use client";

import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export default function LoadMoreButton() {
  const loadMore = useStore((state) => state.loadMore);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    startTransition(() => {
      loadMore();
    });
  };

  return (
    <div className="flex justify-center mt-4">
      <Button
        variant="outline"
        onClick={handleLoadMore}
        disabled={isPending}
        className="border-white/10 hover:bg-zinc-900 hover:text-white"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </Button>
    </div>
  );
}
