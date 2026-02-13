# Product Requirements Document (PRD)
## Project: Digital Adashi Manager - Package 2 (The "Amana" Suite)

**Date:** February 8, 2026
**Version:** 1.0
**Status:** Draft

### 1. Introduction
The Digital Adashi Manager is a specialized financial management tool for local Nigerian contribution schemes (Adashi, Akawo, Ajo). **Package 2 ("Amana")** focuses on "Transparency" by bridging the gap between Managers (Admins) and Customers (Members). It digitizes the manager's ledger and provides a read-only portal for members to verify their records, building trust.

### 2. User Roles
*   **Manager (Admin):** The owner of the Adashi business. Has full write access. Can create users, groups, record transactions, and manage payouts.
*   **Member (Customer):** The saver. Has read-only access. Can view their balance, transaction history, and group status (for rotating schemes).

### 3. Key Features (Scope: Package 2)

#### 3.1. Authentication & Profiles
*   **Secure Admin Login:** Email/Password authentication for Managers.
*   **Customer Accounts:** Managers create accounts for customers. Customers can log in (possibly via phone number/OTP or simple credentials provided by manager) to view data.
*   **Profile Management:** Store Name, Phone Number, Photo, and Next of Kin for each member.

#### 3.2. Scheme Management (The "Models")
The system must support three distinct operational models:
1.  **Akawo (Daily Contribution):**
    *   Individual tracking.
    *   Daily/Weekly deposits.
    *   Month-end payout calculation (Total - Service Charge).
2.  **Kwanta (Rotating/ROSCA):**
    *   Group-based.
    *   Roster management (Who collects next?).
    *   Tracking defaulters.
3.  **Ajita (Target Savings):**
    *   Long-term "Locked Wallet".
    *   Funds held until specific maturity date (e.g., Sallah).

#### 3.3. Transaction Recording (The "Digital Card")
*   **Manager Dashboard:** Interface to quickly record daily payments for multiple users.
*   **One-Click Entry:** Simplified UI for repeating standard daily amounts.
*   **Auto-Calculation:** System automatically computes current balance and pending payouts based on scheme rules.

#### 3.4. Member Portal (Transparency)
*   **Read-Only Dashboard:** Members see their own "Digital Card".
*   **Kwanta View:** Members in a rotating group see the full group roster and collection schedule.
*   **History:** List of all past deposits and withdrawals.

#### 3.5. Notifications & Reporting
*   **Payment Alerts:** Automated SMS/WhatsApp integration (via API) when a payment is recorded.
*   **Receipts:** Generate PDF receipts for payouts.

#### 3.6. Offline Capability
*   **Offline-First:** Critical operations (recording payments) must work without internet, syncing when connectivity is restored (Service Workers/Local Storage).

### 4. User Flows
*   **Daily Collection:** Manager logs in -> Selects "Record" -> Searches Member -> Enters Amount (or confirms default) -> Save -> SMS sent to Member.
*   **Member Check:** Member logs in -> Views Dashboard -> Sees "Total Saved: ₦50,000" -> Checks recent transactions.
*   **Payout:** Manager selects Member/Group -> Clicks "Process Payout" -> System calculates fees -> Manager confirms cash handout -> Receipt generated -> Balance resets (or closes).

### 5. Non-Functional Requirements
*   **Mobile Responsiveness:** Primary usage will be on mobile phones (both Manager and Members).
*   **Performance:** Fast loading even on 3G networks.
*   **Security:** Data encryption, especially for personal info and financial records.
