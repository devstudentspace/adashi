# Implementation Roadmap - Digital Adashi Manager

## Sprint 1: Foundation & User Management (COMPLETED)
**Goal:** Set up the database, authentication, and user profile management.
- [x] Initialize Supabase project & environment variables.
- [x] Implement Database Schema (`profiles`) with Address & Alt Phone.
- [x] Setup Auth: Admin Login vs Member Login.
- [x] RLS Policies: Grant Admins full CRUD access to all profiles.
- [x] Sleek UI Dashboard Shell with Sidebar & Role-based routing.
- [x] Admin Dashboard: Initial stats and Member list view.

## Sprint 2: Scheme Management & Core Logic
**Goal:** Allow admins to create and manage Adashi groups (Akawo, Kwanta, Ajita).
- [ ] Implement Database Schema (`schemes`, `scheme_members`).
- [ ] Admin: "Create Scheme" wizard (Set frequency, amount, and rules).
- [ ] Admin: Assign members to schemes.
- [ ] Admin: Manage member statuses in schemes (Active, Defaulted).
- [ ] Member: View scheme details and collection rosters (for Kwanta).

## Sprint 3: The Ledger & Transaction System
**Goal:** Implement the core financial recording features.
- [ ] Implement Database Schema (`transactions`).
- [ ] "Digital Card" Interface: Admin one-click deposit recording.
- [ ] Transaction Ledger: Filterable history for Admins.
- [ ] Backend logic: Auto-calculate payouts and service charges.
- [ ] Receipt generation (PDF) for payouts.

## Sprint 4: Transparency Portal (Member View)
**Goal:** Build the read-only view for customers.
- [ ] Member Dashboard: "My Savings" visualization.
- [ ] Detailed History: Mobile-optimized transaction list.
- [ ] Notifications: WhatsApp/SMS alerts on payment record (Mock/API).

## Sprint 5: System Audit & Polish
**Goal:** Add security checks and refine the UX.
- [ ] Admin: System audit logs (Who changed what?).
- [ ] Offline capability: Service worker for field collection.
- [ ] UI/UX Final Polish: Mobile responsiveness testing.
- [ ] Security Review: RLS hardening.