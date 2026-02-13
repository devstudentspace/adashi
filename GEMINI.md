## GEMINI Context File

## Project: Digital Adashi Manager (Package 2 - Amana)
**Current Phase:** Sprint 1: Foundation & User Management

## Overview
This project is a financial management system for local Nigerian contribution schemes (Akawo, Kwanta, Ajita). We are implementing "Package 2", which includes Manager tools and a Member transparency portal.

## Active Task
- **Goal:** Setup Database Schema and Role-based Dashboards.
- **Status:** 
    - [x] Initial documentation (PRD, SRS, ROADMAP)
    - [x] Sleek UI Update (Landing Page, Dashboard Layout)
    - [x] Role-based Dashboard structure (Admin/Member)
    - [x] Supabase Migration: `profiles` table & auto-trigger.
- **Next Steps:**
    - Update Sign-up logic to handle `full_name` and `role`.
    - Create Admin view for "Creating Members".

## Technical Context
- **Framework:** Next.js 15 (App Router)
- **DB:** Supabase
- **UI:** Tailwind + Shadcn/UI (Custom Sleek Theme)
- **Auth:** Supabase Auth (Admin vs Member roles)

## Documentation
- `PRD.md`: Product Requirements
- `SRS.md`: Technical Specs
- `ROADMAP.md`: Implementation Plan
