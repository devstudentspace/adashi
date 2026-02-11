import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardRedirect() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Role-based redirection logic
  // Priority: 1. Metadata, 2. Email domain/specific (for testing), 3. Database query (future)
  
  const role = user.user_metadata?.role;

  if (role === 'admin' || user.email?.includes('admin')) {
    redirect("/dashboard/admin");
  }

  // Default to member dashboard
  redirect("/dashboard/member");
}
