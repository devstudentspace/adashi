# Requirements Document

## Introduction

This document specifies the requirements for completing Sprint 2 (Scheme Management & Core Logic) and Sprint 3 (The Ledger & Transaction System) of the Digital Adashi Manager. These features will enable the core business functionality of managing Nigerian Adashi contribution schemes and recording financial transactions digitally.

The system builds upon the existing foundation (Sprint 1) which includes user authentication, profile management, and the complete database schema. The focus is on implementing the business logic that makes the Digital Adashi Manager valuable - scheme membership management, transaction recording, and automated payout calculations according to Nigerian Adashi business rules.

## Glossary

- **System**: The Digital Adashi Manager web application
- **Admin**: A user with administrative privileges who manages schemes and records transactions
- **Member**: A customer/participant in one or more Adashi schemes with read-only access
- **Scheme**: An Adashi contribution plan (Akawo, Kwanta, or Ajita type)
- **Akawo**: Daily contribution scheme with individual tracking and month-end payouts
- **Kwanta**: Rotating contribution scheme (ROSCA) with roster-based payout order
- **Ajita**: Target savings scheme with locked funds until maturity date
- **Transaction_Recorder**: The component responsible for recording financial transactions
- **Payout_Calculator**: The component that calculates payouts and service charges
- **Roster_Manager**: The component that manages Kwanta payout order and rotation
- **Receipt_Generator**: The component that generates PDF receipts for payouts
- **Ledger**: The complete transaction history and filtering system

## Requirements

### Requirement 1: Scheme Member Assignment

**User Story:** As an admin, I want to assign members to schemes, so that I can build the participant roster for each Adashi group.

#### Acceptance Criteria

1. WHEN an admin selects a scheme and chooses "Add Members", THE System SHALL display a list of available members not already in that scheme
2. WHEN an admin selects multiple members and confirms assignment, THE System SHALL add each member to the scheme with "active" status
3. WHEN assigning members to a Kwanta scheme, THE System SHALL automatically assign sequential payout_order numbers starting from 1
4. WHEN a member is successfully assigned to a scheme, THE System SHALL update the scheme_members table with the correct scheme_id, user_id, and status
5. THE System SHALL prevent duplicate member assignments to the same scheme

### Requirement 2: Member Status Management

**User Story:** As an admin, I want to manage member statuses in schemes, so that I can track who is active, completed, or has defaulted on their contributions.

#### Acceptance Criteria

1. WHEN an admin views a scheme's member list, THE System SHALL display each member's current status (Active, Completed, Defaulted)
2. WHEN an admin changes a member's status, THE System SHALL update the status in the scheme_members table immediately
3. WHEN a member's status is changed to "Defaulted", THE System SHALL maintain their transaction history but exclude them from future payout calculations
4. WHEN a member's status is changed to "Completed", THE System SHALL preserve their record but mark them as no longer participating
5. THE System SHALL only allow valid status transitions (Active to Defaulted/Completed, but not Completed back to Active)

### Requirement 3: Kwanta Roster Management

**User Story:** As an admin, I want to manage the Kwanta roster and payout order, so that I can control who receives the next collection in rotating schemes.

#### Acceptance Criteria

1. WHEN an admin views a Kwanta scheme, THE System SHALL display the complete roster with payout_order numbers and member names
2. WHEN an admin needs to reorder the roster, THE System SHALL allow dragging and dropping members to new positions
3. WHEN the roster order is changed, THE System SHALL update all affected payout_order values in the scheme_members table
4. WHEN a member defaults in a Kwanta scheme, THE System SHALL maintain their payout_order but mark them as ineligible for collection
5. THE System SHALL ensure no duplicate payout_order numbers exist within a single Kwanta scheme

### Requirement 4: Member Scheme View

**User Story:** As a member, I want to view my scheme details and collection rosters, so that I can see my participation status and upcoming collection schedules.

#### Acceptance Criteria

1. WHEN a member logs in, THE System SHALL display all schemes they participate in with basic details (name, type, contribution amount)
2. WHEN a member views a Kwanta scheme they belong to, THE System SHALL show the complete roster with collection order and current position
3. WHEN displaying scheme information to members, THE System SHALL show only read-only data without edit capabilities
4. WHEN a member views their scheme status, THE System SHALL display their current status (Active, Completed, Defaulted)
5. THE System SHALL hide sensitive information like other members' personal details while showing the roster

### Requirement 5: Transaction Recording System

**User Story:** As an admin, I want to record member transactions quickly and accurately, so that I can maintain the digital ledger for all contributions and withdrawals.

#### Acceptance Criteria

1. WHEN an admin accesses the transaction recording interface, THE System SHALL provide a search function to quickly find members by name or phone number
2. WHEN an admin selects a member, THE System SHALL display their active schemes and default contribution amounts
3. WHEN an admin records a deposit, THE System SHALL create a transaction record with type "deposit", amount, current timestamp, and admin_id
4. WHEN an admin records a withdrawal or fee, THE System SHALL create appropriate transaction records with correct types
5. THE System SHALL validate that withdrawal amounts do not exceed available balances for the member in that scheme

### Requirement 6: One-Click Deposit Interface

**User Story:** As an admin, I want a streamlined interface for recording daily deposits, so that I can quickly process multiple member contributions during collection rounds.

#### Acceptance Criteria

1. WHEN an admin uses the one-click deposit feature, THE System SHALL pre-populate the contribution amount based on the scheme's default amount
2. WHEN processing a standard deposit, THE System SHALL allow confirmation with a single click or tap
3. WHEN an admin needs to record a different amount, THE System SHALL allow quick amount modification before confirmation
4. WHEN a deposit is recorded via one-click, THE System SHALL immediately update the member's balance and transaction history
5. THE System SHALL provide visual feedback confirming successful transaction recording

### Requirement 7: Automated Payout Calculation

**User Story:** As an admin, I want the system to automatically calculate payouts and service charges, so that I can ensure accurate payments according to each scheme type's rules.

#### Acceptance Criteria

1. WHEN calculating Akawo payouts, THE Payout_Calculator SHALL sum all deposits for the period and subtract the configured service charge percentage
2. WHEN calculating Kwanta payouts, THE Payout_Calculator SHALL determine the total collection amount based on all active members' contributions for the cycle
3. WHEN calculating Ajita payouts, THE Payout_Calculator SHALL only allow withdrawals after the maturity date and include any accrued interest
4. WHEN service charges are applied, THE System SHALL create separate transaction records with type "fee" for transparency
5. THE System SHALL store payout calculation rules in the scheme's rules jsonb field for customization per scheme

### Requirement 8: Transaction Ledger with Filtering

**User Story:** As an admin, I want to view and filter transaction history, so that I can analyze financial activity and generate reports for specific periods or members.

#### Acceptance Criteria

1. WHEN an admin accesses the transaction ledger, THE System SHALL display all transactions with date, member name, amount, type, and notes
2. WHEN filtering by date range, THE System SHALL show only transactions within the specified start and end dates
3. WHEN filtering by member, THE System SHALL display only transactions for the selected member across all their schemes
4. WHEN filtering by scheme, THE System SHALL show only transactions related to that specific scheme
5. WHEN filtering by transaction type, THE System SHALL display only deposits, withdrawals, or fees as selected

### Requirement 9: PDF Receipt Generation

**User Story:** As an admin, I want to generate PDF receipts for payouts, so that I can provide members with official documentation of their transactions.

#### Acceptance Criteria

1. WHEN processing a payout, THE Receipt_Generator SHALL create a PDF receipt containing member details, amount, date, and scheme information
2. WHEN generating receipts, THE System SHALL include the admin's name and signature area for authenticity
3. WHEN a receipt is generated, THE System SHALL format it professionally with the organization's branding and contact information
4. WHEN receipts are created, THE System SHALL allow immediate download or printing from the browser
5. THE System SHALL store a reference to generated receipts linked to the corresponding transaction record

### Requirement 10: Balance Calculation and Display

**User Story:** As both admin and member, I want to see accurate current balances, so that I can track savings progress and available funds for each scheme.

#### Acceptance Criteria

1. WHEN displaying member balances, THE System SHALL calculate the sum of all deposits minus withdrawals and fees for each scheme
2. WHEN a member views their dashboard, THE System SHALL show current balance for each scheme they participate in
3. WHEN an admin views member details, THE System SHALL display real-time balance calculations based on transaction history
4. WHEN calculating balances for Kwanta schemes, THE System SHALL consider the member's position in the payout rotation
5. THE System SHALL update balance displays immediately after any transaction is recorded

### Requirement 11: Scheme Type Business Logic

**User Story:** As an admin, I want the system to enforce different business rules for each scheme type, so that Akawo, Kwanta, and Ajita schemes operate according to their specific requirements.

#### Acceptance Criteria

1. WHEN managing Akawo schemes, THE System SHALL allow individual member tracking with flexible deposit amounts and frequencies
2. WHEN managing Kwanta schemes, THE System SHALL enforce roster-based payout order and prevent out-of-turn collections
3. WHEN managing Ajita schemes, THE System SHALL lock funds until the specified maturity date and prevent early withdrawals
4. WHEN processing transactions, THE System SHALL apply scheme-specific validation rules based on the scheme type
5. THE System SHALL store and retrieve scheme-specific configuration from the rules jsonb field

### Requirement 12: Data Validation and Integrity

**User Story:** As a system administrator, I want robust data validation, so that the financial records remain accurate and consistent.

#### Acceptance Criteria

1. WHEN recording transactions, THE System SHALL validate that amounts are positive numbers with appropriate decimal precision
2. WHEN assigning members to schemes, THE System SHALL verify that both the member and scheme exist and are active
3. WHEN updating member statuses, THE System SHALL ensure only valid status transitions are allowed
4. WHEN calculating payouts, THE System SHALL verify sufficient funds exist before processing withdrawals
5. THE System SHALL maintain referential integrity between all related database tables (profiles, schemes, scheme_members, transactions)