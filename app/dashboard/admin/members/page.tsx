import { Suspense } from "react";
import { CreateMemberForm } from "@/components/create-member-form";
import { MemberSearch } from "@/components/member-search";
import { ViewToggle } from "@/components/view-toggle";
import MembersTable from "./members-table";
import { Skeleton } from "@/components/ui/skeleton";

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="hidden md:block h-64 rounded-xl" />
    </div>
  );
}

export default async function MembersPage(props: {
  searchParams: Promise<{ 
    query?: string; 
    view?: string; 
    page?: string; 
    pageSize?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.query;
  const view = searchParams.view || "auto";
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Members</h1>
          <p className="text-sm md:text-base text-muted-foreground">Directory of all customers across your schemes.</p>
        </div>
        <div className="w-full md:w-auto">
          <CreateMemberForm />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <MemberSearch />
          <ViewToggle />
        </div>
        
        {/* Content Area */}
        <div className="min-h-[400px]">
          <Suspense fallback={<TableSkeleton />}>
            <MembersTable 
              query={query} 
              view={view} 
              page={page} 
              pageSize={pageSize} 
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}