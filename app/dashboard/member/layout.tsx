import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const isAdmin = user.user_metadata?.role === 'admin' || user.email?.includes('admin');

  if (isAdmin) {
    redirect("/dashboard/admin");
  }

  return <>{children}</>;
}
