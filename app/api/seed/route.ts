import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();

  try {
    // 1. Create Admin User
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@adashi.com',
      password: 'password',
      email_confirm: true,
      user_metadata: {
        full_name: 'Adashi Admin',
        role: 'admin',
        phone_number: '08012345678',
        home_address: '123 Admin St, Abuja',
        avatar_url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin'
      }
    });

    if (adminError && adminError.message !== 'User already registered') {
        throw adminError;
    }

    const adminId = adminUser.user?.id || (await supabase.from('profiles').select('id').eq('phone_number', '08012345678').single()).data?.id;

    // 2. Create Member Users
    const members = [
      { email: 'member1@test.com', name: 'Musa Ibrahim', phone: '07011111111', address: '12 Market Road, Kano' },
      { email: 'member2@test.com', name: 'Zainab Bello', phone: '07022222222', address: '45 GRA, Kaduna' },
      { email: 'member3@test.com', name: 'Chidi Okafor', phone: '07033333333', address: '88 Wuse 2, Abuja' },
      { email: 'member4@test.com', name: 'Fatima Yusuf', phone: '07044444444', address: '101 Emir Palace Rd, Sokoto' },
      { email: 'member5@test.com', name: 'Emeka Nnamdi', phone: '07055555555', address: '22 Alaba Int, Lagos' }
    ];

    const memberIds: string[] = [];

    for (const m of members) {
      const { data: mUser, error: mError } = await supabase.auth.admin.createUser({
        email: m.email,
        password: 'password',
        email_confirm: true,
        user_metadata: {
          full_name: m.name,
          role: 'member',
          phone_number: m.phone,
          home_address: m.address,
          avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${m.name.replace(' ', '')}`
        }
      });
      
      if (mError && mError.message !== 'User already registered') {
        console.error(`Error creating ${m.email}:`, mError);
      } else {
         const id = mUser.user?.id || (await supabase.from('profiles').select('id').eq('phone_number', m.phone).single()).data?.id;
         if (id) memberIds.push(id);
      }
    }

    // 3. Create Schemes (Sprint 2 Data)
    if (adminId && memberIds.length > 0) {
        const { data: schemes, error: schemeError } = await supabase.from('schemes').insert([
            {
                name: 'Main Market Akawo',
                type: 'akawo',
                admin_id: adminId,
                contribution_amount: 1000,
                frequency: 'daily',
                rules: { service_charge_percent: 5 }
            },
            {
                name: 'Kano Rotating Savings',
                type: 'kwanta',
                admin_id: adminId,
                contribution_amount: 5000,
                frequency: 'weekly',
                rules: { payout_order: 'random' }
            },
            {
                name: 'Sallah 2026 Ajita',
                type: 'ajita',
                admin_id: adminId,
                contribution_amount: 0, 
                frequency: 'monthly',
                end_date: '2026-06-20',
                rules: { locked: true }
            }
        ]).select();

        if (schemeError) throw schemeError;

        // 4. Assign Members to Schemes
        if (schemes) {
            // Assign some to Akawo
            const akawoMembers = memberIds.slice(0, 3).map(mId => ({
                    scheme_id: schemes[0].id,
                    user_id: mId,
                    status: 'active'
            }));
            
            // Assign all to Kwanta
            const kwantaMembers = memberIds.map((mId, index) => ({
                    scheme_id: schemes[1].id,
                    user_id: mId,
                    status: 'active',
                    payout_order: index + 1
            }));

            // Assign some to Ajita
            const ajitaMembers = memberIds.slice(2, 5).map(mId => ({
                scheme_id: schemes[2].id,
                user_id: mId,
                status: 'active'
            }));

            // Insert ensuring no duplicates if running seed multiple times (though insert might fail on conflict if not handled, for simple seed we assume clean or handle error)
            const allMemberships = [...akawoMembers, ...kwantaMembers, ...ajitaMembers];
            
            // Use upsert to avoid conflicts
            const { error: memberError } = await supabase.from('scheme_members').upsert(allMemberships, { onConflict: 'scheme_id,user_id' });
            if (memberError) console.error("Membership error", memberError);

            // 5. Create some Transactions (Sprint 3 Preview)
            const transactions = [];
            
            // Generate some random history
            for (const mId of memberIds) {
                // Initial deposit
                transactions.push({
                    user_id: mId,
                    scheme_id: schemes[0].id,
                    admin_id: adminId,
                    amount: 1000,
                    type: 'deposit',
                    notes: 'Initial deposit',
                    date: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
                });
                
                // Another deposit
                transactions.push({
                    user_id: mId,
                    scheme_id: schemes[0].id,
                    admin_id: adminId,
                    amount: 1000,
                    type: 'deposit',
                    notes: 'Day 2 deposit',
                    date: new Date(Date.now() - 86400000 * 4).toISOString()
                });
            }

            const { error: transError } = await supabase.from('transactions').insert(transactions);
            if (transError) console.error("Transaction error", transError);
        }
    }

    return NextResponse.json({ 
        message: "Database seeded successfully!",
        accounts: {
            admin: 'admin@adashi.com (password)',
            members: 'member1@test.com...member5@test.com (password)'
        }
    });

  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
