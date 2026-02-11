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

  // If user is Admin, they usually shouldn't be here unless they want to see "their" savings.
  // However, the prompt says "dont allow another role to access other roles dashboard".
  // So we will strictly redirect Admins to Admin Dashboard.
  
  const isMetadataAdmin = user.user_metadata?.role === 'admin' || user.email?.includes('admin');

  if (isMetadataAdmin) {
     redirect("/dashboard/admin");
  }

  // Optional: DB Check for extra security
  /*
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role === 'admin') {
      redirect("/dashboard/admin");
  }
  */

  return <>{children}</>;
}
