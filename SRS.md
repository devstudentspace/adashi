# Software Requirements Specification (SRS)
## Project: Digital Adashi Manager - Package 2

### 1. Technology Stack
*   **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, Shadcn/UI.
*   **Backend:** Next.js Server Actions (BFF pattern).
*   **Database:** Supabase (PostgreSQL).
*   **Auth:** Supabase Auth.
*   **State Management:** React Query (TanStack Query) for server state, Zustand for local UI state.
*   **Offline Support:** Serwist (Service Worker wrapper for Next.js).

### 2. Database Schema (Supabase)

#### `profiles`
Extends default `auth.users`.
*   `id` (UUID, PK, FK to auth.users)
*   `role` (enum: 'admin', 'member')
*   `full_name` (text)
*   `phone_number` (text, unique)
*   `alt_phone_number` (text)
*   `home_address` (text)
*   `avatar_url` (text)
*   `created_at` (timestamptz)

#### `schemes`
Represents a group or a specific plan type (Akawo, Kwanta, Ajita).
*   `id` (UUID, PK)
*   `name` (text) - e.g., "Market Women Akawo", "Sallah 2026 Ajita"
*   `type` (enum: 'akawo', 'kwanta', 'ajita')
*   `admin_id` (UUID, FK to profiles)
*   `contribution_amount` (decimal) - Default amount (optional)
*   `frequency` (enum: 'daily', 'weekly', 'monthly')
*   `start_date` (date)
*   `end_date` (date)
*   `rules` (jsonb) - e.g., service charge percent, payout order for Kwanta.
*   `created_at` (timestamptz)

#### `scheme_members`
Linking users to schemes.
*   `id` (UUID, PK)
*   `scheme_id` (UUID, FK to schemes)
*   `user_id` (UUID, FK to profiles)
*   `joined_at` (timestamptz)
*   `status` (enum: 'active', 'completed', 'defaulted')
*   `payout_order` (int) - For Kwanta.

#### `transactions`
The ledger.
*   `id` (UUID, PK)
*   `user_id` (UUID, FK to profiles)
*   `scheme_id` (UUID, FK to schemes)
*   `admin_id` (UUID, FK to profiles) - Who recorded it.
*   `amount` (decimal)
*   `type` (enum: 'deposit', 'withdrawal', 'fee')
*   `date` (timestamptz)
*   `notes` (text)

### 3. API & Server Actions
*   **Auth:** `login`, `logout`, `resetPassword`, `createMemberUser` (Admin function).
*   **Schemes:** `createScheme`, `getSchemes`, `getSchemeDetails`.
*   **Transactions:** `recordTransaction`, `getMemberHistory`, `getSchemeLedger`.
*   **Dashboard:** `getAdminStats` (Total collection today, Pending payouts), `getMemberStats` (My balance).

### 4. Integration Points
*   **SMS/WhatsApp:** Integration with providers like Twilio or Termii (local Nigerian provider).
*   **PDF:** `react-pdf` or similar for receipt generation on the client/server.

### 5. Security Rules (RLS)
*   **Admins:** Can read/write all data in their managed schemes.
*   **Members:** Can read ONLY their own `profiles`, `transactions`, and `scheme_members` data. Can read shared `schemes` data they belong to. CANNOT write to `transactions`.
