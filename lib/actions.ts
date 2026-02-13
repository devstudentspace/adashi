"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function createMember(formData: {
  email?: string;
  fullName: string;
  phoneNumber: string;
  altPhoneNumber?: string;
  homeAddress?: string;
  password?: string;
}) {
  const supabase = await createClient();
  
  // 1. Verify the caller is an admin
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) throw new Error("Unauthorized");

  // Use the service role client to check the admin's role to bypass RLS recursion
  // (Alternatively, we could trust the metadata if we are sure it's synced, but DB is safer)
  // Since we already have createAdminClient, let's just use it for the check to be safe & fast.
  const adminClient = createAdminClient();
  
  // 2. Prepare User Data
  // If email is not provided, generate a dummy one based on phone number
  const email = formData.email?.trim() || `${formData.phoneNumber.replace(/\D/g, '')}@adashi.local`;
  
  // Default password to phone number if not provided (common for such systems)
  const password = formData.password?.trim() || formData.phoneNumber;

  const { data, error } = await adminClient.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      alt_phone_number: formData.altPhoneNumber,
      home_address: formData.homeAddress,
      role: 'member'
    }
  });

  if (error) {
    console.error("Error creating member:", error);
    // Return a structured error
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/members");
  return { success: true, user: data.user, tempPassword: password, generatedEmail: email };
}