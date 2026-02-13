"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const currentType = searchParams.get("type") || "all";

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== (searchParams.get("query") || "")) {
        updateSearchParams("query", query);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  function updateSearchParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 on filter change

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function clearFilters() {
    setQuery("");
    router.replace(pathname);
  }

  const hasFilters = searchParams.get("query") || searchParams.get("type");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search member, scheme..."
          className="pl-8 h-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <Select 
        value={currentType} 
        onValueChange={(val) => updateSearchParams("type", val)}
      >
        <SelectTrigger className="h-9 w-full sm:w-[150px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="deposit">Deposits</SelectItem>
          <SelectItem value="withdrawal">Payouts</SelectItem>
          <SelectItem value="fee">Fees</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-9 px-2 text-muted-foreground hover:text-foreground"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
