import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import ProfileContent from "@/components/profile-content";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Pass user data to the client component
  return (
    <ProfileContent user={{
      id: user.id,
      email: user.email || null,
      user_metadata: user.user_metadata
    }} />
  );
}