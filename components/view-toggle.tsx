"use client";

import { LayoutGrid, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentView = searchParams.get("view") || "auto";

  function setView(view: string) {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("grid")}
        className={cn(
          "h-8 px-3 rounded-md transition-all",
          currentView === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        <span className="text-xs font-medium">Grid</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setView("table")}
        className={cn(
          "h-8 px-3 rounded-md transition-all",
          currentView === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <TableIcon className="h-4 w-4 mr-2" />
        <span className="text-xs font-medium">Table</span>
      </Button>
    </div>
  );
}
