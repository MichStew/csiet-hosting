# Requirements Assessment - CSIET Member Database

This document outlines which requirements have been met based on the current codebase implementation.

## 1. General

### 1.1 UI

✅ **The application shall render and look presentable on desktop devices.**
- **Status**: MET
- **Evidence**: React components with Tailwind CSS styling, professional UI components from shadcn/ui library, consistent color scheme (#733635, #ebe3d5)

✅ **The UI will use responsive breakpoints.**
- **Status**: MET
- **Evidence**: 
  - Mobile menu implementation in `Header.jsx` with `isMobileMenuOpen` state
  - Responsive grid layouts using `grid-cols-1 md:grid-cols-2`
  - `use-mobile.ts` hook with breakpoint at 768px
  - Mobile-responsive navigation and forms

✅ **All pages will share a consistent header/footer/navbar.**
- **Status**: MET
- **Evidence**: `Header.jsx` component is used across pages, consistent navigation structure

✅ **The website will be hosted using GitHub Pages and will use Git control.**
- **Status**: PARTIALLY MET
- **Evidence**: Git repository exists, but deployment configuration for GitHub Pages not yet verified in codebase

### 1.2 Database

✅ **The database shall store user accounts with role assignments, email, passwords, etc.**
- **Status**: MET
- **Evidence**: 
  - `User` model in `backend/src/models/User.js` with fields: name, email, role (enum: 'member', 'company', 'admin'), passwordHash, timestamps
  - Role-based authentication implemented

❌ **The database shall store company profiles with job listings and representatives' information.**
- **Status**: NOT MET
- **Evidence**: 
  - No separate Company model exists
  - Company information is stored in User model with `employeeName` field, but no dedicated company profile structure
  - No job listings model or routes exist

❌ **The database shall store job listings with screening questions, job states, etc.**
- **Status**: NOT MET
- **Evidence**: 
  - No Job model exists
  - Job postings in Dashboard are placeholder/mock data (see `Dashboard.jsx` lines 152-182)
  - No backend routes for jobs (`/api/jobs`)

❌ **The database shall store applications with statuses, timestamps, etc.**
- **Status**: NOT MET
- **Evidence**: 
  - No Application model exists
  - No routes for job applications
  - "Apply Now" buttons in Dashboard are non-functional

❌ **The database shall store documents with metadata like owner, type, version, etc.**
- **Status**: NOT MET
- **Evidence**: 
  - No Document model exists
  - Only `resumeUrl` field exists in User model (string URL, not a document entity)
  - No document upload functionality or document management system

✅ **The database will be created and stored using MongoDB.**
- **Status**: MET
- **Evidence**: 
  - MongoDB connection configured in `backend/src/config/db.js`
  - Mongoose used for ODM
  - Database seeding script exists

## 2. Authentication & Authorization

### 2.1 General Roles

✅ **Users will be designated one of three profile types: member, administrator, company representative.**
- **Status**: MET
- **Evidence**: 
  - User model has `role` field with enum: ['member', 'company', 'admin']
  - Role-based access control implemented in middleware

### 2.2 Login & Logout

✅ **Users will be able to create a new account with an email and password.**
- **Status**: MET
- **Evidence**: 
  - Registration routes: `/api/auth/register` (backend)
  - Frontend components: `MemberRegister.jsx`, `CompanyRegister.jsx`
  - Supports member and company registration

✅ **Users will be able to log in with email and password.**
- **Status**: MET
- **Evidence**: 
  - Login route: `/api/auth/login` (backend)
  - Frontend components: `MemberLogin.jsx`, `CompanyLogin.jsx`
  - JWT token-based authentication

✅ **Users will be able to log out.**
- **Status**: MET
- **Evidence**: 
  - Logout functionality in `App.jsx` (`handleLogout` function)
  - Logout button in `Header.jsx`
  - Clears localStorage and auth state

### 2.3 Security

⚠️ **Passwords shall meet complexity requirements such as minimum characters and special characters.**
- **Status**: PARTIALLY MET
- **Evidence**: 
  - Minimum length requirement: 6 characters (backend: `auth.js` line 57, frontend validation)
  - **Missing**: Special character requirement, uppercase/lowercase requirements, number requirements
  - Current validation only checks length, not complexity

## 3. Admin

### 3.1 User Control

✅ **The admin shall be able to view all members, companies, and company representatives.**
- **Status**: MET
- **Evidence**: 
  - `/api/members` route returns all members (authenticated users can view)
  - Dashboard shows member list with admin-specific columns (role column visible to admins)
  - Admin can see all members in the Members tab

⚠️ **The admin shall be able to delete user accounts.**
- **Status**: PARTIALLY MET
- **Evidence**: 
  - Backend route exists: `DELETE /api/members/:id` (admin only, `requireAdmin` middleware)
  - **Missing**: Frontend UI for admin to delete users (no delete buttons visible in Dashboard)

### 3.2 Job Control

❌ **The admin will be able to approve or reject job postings.**
- **Status**: NOT MET
- **Evidence**: 
  - No job postings system exists
  - No approval/rejection workflow

### 3.3 Club Control

❌ **The admin will be able to create events for the club viewable to all members and admins.**
- **Status**: NOT MET
- **Evidence**: 
  - No Event model exists
  - No event routes or UI components
  - No event management functionality

❌ **The admin will be able to edit or delete already created events.**
- **Status**: NOT MET
- **Evidence**: 
  - No events system exists

## 4. Member

### 4.1 Profile

✅ **Members will be able to edit their profile information including name, graduation date, major, skills, documents, etc.**
- **Status**: MET
- **Evidence**: 
  - Profile update route: `PUT /api/members/me`
  - Profile editing form in Dashboard and MemberInfo components
  - Fields editable: name, major, year (graduation year), interests (skills), resumeUrl, phone
  - Note: "documents" handled via resumeUrl (URL string, not document upload)

### 4.2 Personal Documents

⚠️ **The user shall be able to upload documents to their profile.**
- **Status**: PARTIALLY MET
- **Evidence**: 
  - `resumeUrl` field exists in User model (string URL)
  - Users can enter a resume URL in profile form
  - **Missing**: Actual file upload functionality (no multipart/form-data handling, no file storage)

⚠️ **Each document will need to be labeled as a resume, CV, cover letter, transcript, etc.**
- **Status**: NOT MET
- **Evidence**: 
  - Only `resumeUrl` field exists (single URL, no document type)
  - No document type/labeling system
  - No multiple document support

### 4.3 Job Search

⚠️ **Members shall be able to browse a list of all posted job listings.**
- **Status**: PARTIALLY MET
- **Evidence**: 
  - Job Postings tab exists in Dashboard
  - **Missing**: Backend integration (using placeholder/mock data)
  - No actual job listings from database

⚠️ **Members shall be able to filter jobs by role, location, skills, etc.**
- **Status**: PARTIALLY MET
- **Evidence**: 
  - Search functionality exists in Dashboard (filters by title, company, location, description, type)
  - **Missing**: Backend filtering (only client-side filtering on mock data)
  - No advanced filters for role, skills, etc.

### 4.4 Club Events

❌ **Members shall be able to view a list of all upcoming club events.**
- **Status**: NOT MET
- **Evidence**: 
  - No events system exists
  - No UI for viewing events

## 5. Company Representative

### 5.1 Company Profile

⚠️ **Reps shall be able to edit the company profile.**
- **Status**: PARTIALLY MET
- **Evidence**: 
  - Company users can edit their profile via `PUT /api/members/me` (same as members)
  - `employeeName` field exists for company name
  - **Missing**: Dedicated company profile with company-specific fields (description, website, industry, etc.)
  - No separate company profile model or routes

### 5.2 Job Posting

❌ **Reps shall be able to create job listings associated with the company profile.**
- **Status**: NOT MET
- **Evidence**: 
  - No job creation routes or UI
  - No job posting functionality

❌ **Reps shall be able to view applications with members.**
- **Status**: NOT MET
- **Evidence**: 
  - No applications system exists
  - No application viewing functionality

❌ **Reps will be able to access contact information of all members/applicants.**
- **Status**: NOT MET
- **Evidence**: 
  - Company users can view member directory (same as members)
  - Member contact info (email, phone) visible in member details
  - **Missing**: Specific applicant contact information (no applications system)
  - **Missing**: Explicit access control for company reps to view all member contact info

---

## Summary

### Fully Met Requirements: 12
- UI rendering and responsive design
- Consistent header/navigation
- User accounts with roles
- MongoDB database
- Three role types (member, admin, company)
- Account creation, login, logout
- Admin can view all members
- Members can edit profile
- Basic member directory viewing

### Partially Met Requirements: 6
- GitHub Pages hosting (Git exists, deployment not verified)
- Password complexity (only length, not special characters)
- Admin delete users (backend exists, no frontend UI)
- Document upload (URL only, no file upload)
- Job browsing (UI exists, no backend)
- Job filtering (client-side only, no backend)
- Company profile editing (basic, no dedicated company model)

### Not Met Requirements: 11
- Company profiles with job listings
- Job listings with screening questions and states
- Applications with statuses and timestamps
- Documents with metadata (type, version, etc.)
- Admin approve/reject job postings
- Admin create/edit/delete events
- Members view club events
- Document type labeling (resume, CV, cover letter, etc.)
- Company reps create job listings
- Company reps view applications
- Company reps access applicant contact info

### Overall Completion: ~40-45%

The foundation is solid with authentication, user management, and basic profile functionality. The major missing pieces are:
1. Job listings system (models, routes, UI)
2. Applications system (models, routes, UI)
3. Events system (models, routes, UI)
4. Document management system (file upload, metadata, types)
5. Enhanced company profile system
6. Admin job approval workflow

