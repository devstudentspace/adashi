import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }
  
  const cookieStore = await cookies();

  try {
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have proxy refreshing
              // user sessions.
            }
          },
        },
      },
    );
    
    // Verify that the client has the expected methods
    if (!client || !client.auth || typeof client.auth.getUser !== 'function') {
      console.error('Supabase client not initialized properly:', {
        hasClient: !!client, 
        hasAuth: client ? !!client.auth : undefined, 
        hasGetUser: client?.auth ? typeof client.auth.getUser : undefined,
        authType: typeof client?.auth,
        authValue: client?.auth
      });
      throw new Error('Supabase client not initialized properly');
    }
    
    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Re-throw the error to be handled by calling functions
    throw error;
  }
}

// Admin client for seeding and bypassing RLS (Service Role)
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing Supabase Admin environment variables');
    throw new Error('Missing Supabase Admin environment variables');
  }

  return createSupabaseClient(
    url,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
