# Real Estate Management System

A professional full-stack property management system built with Next.js 16, React 19, and TypeScript. This system allows property managers to track properties, occupants, rental information, payments, and send notifications to residents.

## 🌟 Features

- **User Authentication with Data Isolation**: Each user has their own separate data - properties, payments, and notifications are completely isolated between accounts
- **Supabase Integration Ready**: Production-ready setup for Supabase authentication and database
- **Interactive Onboarding**: First-time users get a guided tour of the platform
- **Property Management**: Create, read, update, and delete properties with detailed information
- **Dynamic Forms**: Property fields adapt based on property type (apartment, house, commercial, land)
- **Advanced Search & Filtering**: Search properties by name, occupant, or address with status and payment filters
- **Real-time Statistics**: Dashboard with key metrics including overdue payments and lease expirations
- **Payment Tracking**: Record rent payments with multiple payment methods and receipt management
- **Email Notifications**: Send actual emails to residents with integrated email service
- **Lease Expiration Alerts**: Automatic warnings for leases expiring within 30 days
- **Theme Toggle**: Switch between light and dark modes
- **Fully Responsive**: Mobile-first design that works on all devices
- **Currency**: All amounts displayed in Nigerian Naira (₦) with proper icons
- **Secure Data Separation**: Each user's data is stored separately with no cross-user access

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd real-estate-management
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### First Time Setup

1. **Sign Up**: Click "Don't have an account? Sign up"
2. **Create Account**: Enter your name, email, and password
3. **Auto Login**: After signup, you'll be automatically logged in
4. **Onboarding Tour**: First-time users see an interactive tour explaining key features
5. **Start Managing**: Add your first property to get started

### Demo Login Credentials

```
Email: admin@realestate.com
Password: admin123
```

## 📖 User Guide

### Authentication

#### Creating an Account

1. Click "Sign up" on the login page
2. Fill in your details:
   - Full Name
   - Email address
   - Password (minimum 6 characters)
   - Confirm Password
3. Click "Sign Up"
4. You'll be automatically logged in and see the onboarding tour

#### Logging In

1. Enter your email and password
2. Click "Sign In"
3. Access your dashboard

#### Onboarding Tour

New users automatically see an interactive tutorial that highlights:
- How to add properties
- Understanding dashboard statistics
- Navigating between tabs
- Using the theme switcher

You can skip the tour anytime or let it guide you through each feature.

### Managing Properties

#### Adding a New Property

1. Click the "Add Property" button in the top-right corner
2. **Select Property Type** (required): This determines which fields are shown
   - **Apartment**: Shows all fields including bedrooms and bathrooms
   - **House**: Shows all fields including bedrooms and bathrooms
   - **Commercial**: Focuses on size and location (no bedroom/bathroom fields)
   - **Land**: Plot-focused (no bedroom/bathroom fields, square feet becomes plot size)
3. Fill in the required information:
   - **Property Name** (required): e.g., "Sunset Apartments Unit 101"
   - **Monthly Rent** (required): e.g., 150000 (in Naira)
   - **Status** (required): Vacant, Occupied, or Maintenance
   - **Address**: Full property address
   - **Square Feet**: Property size (or plot size for land)
   - **Bedrooms** (if applicable): Number of bedrooms
   - **Bathrooms** (if applicable): Number of bathrooms
4. **If status is "Occupied"**, additional occupant fields appear:
   - Occupant Name, Email, Phone
   - Lease Start/End Dates
   - Stay Period description
5. Click "Add Property" to save

#### Editing a Property

1. Locate the property card you want to edit
2. Click the "Edit" button
3. Update the information as needed
4. Change payment status (Paid, Pending, Overdue) manually if needed
5. Click "Save Changes"

#### Deleting a Property

1. Locate the property card you want to delete
2. Click the "Delete" button
3. Confirm the deletion when prompted

### Theme Switching

Toggle between light and dark themes:
1. Click the sun/moon icon in the top-right header
2. Theme preference is saved automatically
3. Works across all pages

### Mobile Experience

The platform is fully responsive:
- **Mobile**: Stacked layout, collapsible navigation
- **Tablet**: Optimized grid with 2 columns
- **Desktop**: Full layout with 3-4 columns

### Search and Filtering

Use the powerful search and filter tools to find properties quickly:

1. **Search Bar**: Type property name, occupant name, or address
2. **Status Filter**: Filter by Vacant, Occupied, or Maintenance
3. **Payment Filter**: Filter by Paid, Pending, or Overdue payments
4. The system shows how many properties match your filters

### Payment Management

#### Recording a Payment

1. Navigate to the **Properties** tab in the dashboard
2. Locate a property with an occupant
3. Click the **"Record Payment"** button (green)
4. Fill in the payment details:
   - **Amount**: Pre-filled with rent amount (editable)
   - **Payment Date**: Date payment was received
   - **Payment Method**: Bank Transfer, Cash, Card, or Check
   - **Receipt Number**: Optional reference number
   - **Notes**: Additional payment information
5. Click **"Record Payment"**
6. The property's payment status automatically updates to "Paid"

#### Viewing Payment History

1. Navigate to the **Payments** tab in the dashboard
2. View all recorded payments with details:
   - Property name and occupant
   - Payment amount in Naira
   - Payment date and method
   - Receipt number
   - Notes and status
3. See total collected amount at the top

### Lease Expiration Monitoring

The system automatically tracks lease expirations:

- **Dashboard Statistics**: "Expiring Soon" shows leases expiring within 30 days
- **Property Cards**: Display days until lease expiry
- **Yellow Warning**: Properties with leases expiring soon show a warning badge
- **Proactive Management**: Reach out to tenants before lease expires

### Sending Notifications to Residents

#### Sending a Notification with Email

1. Navigate to the **Properties** tab
2. Locate a property with an occupant (marked as "Occupied")
3. Click the **"Send Notification"** button
4. Fill in the notification details:
   - **Recipient**: Auto-filled with occupant name
   - **Recipient Email**: **Required for email delivery** - pre-filled if available
   - **Notification Type**: General, Reminder, Maintenance, Payment, or Announcement
   - **Subject**: Brief description
   - **Message**: Detailed message to the resident
5. Click **"Send Notification"**
6. **Email Delivery**:
   - If email is provided, notification is sent via email immediately
   - Success/error message displays after sending
   - Notification is saved to history regardless of email delivery status

#### Email Sending Status

- **Green indicator**: Email will be sent when "Send Notification" is clicked
- **Success message**: Notification sent successfully
- **Error message**: Email failed but notification saved locally
- All notifications are tracked in the Notifications tab

#### Production Email Setup

For actual email delivery in production:

1. **Configure Email Service**: The system supports integration with:
   - Resend (recommended)
   - SendGrid
   - Mailgun
   - AWS SES
   
2. **Add API Key**: Set your email service API key in environment variables

3. **Update API Route**: The `/api/send-notification/route.ts` file includes integration examples

4. **Test Delivery**: Send test notifications to verify email delivery

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Language**: TypeScript
- **Icons**: Lucide React
- **Data Storage**: localStorage (frontend-only) for development, Supabase for production

### Project Structure

```
real-estate-management/
├── app/
│   ├── api/
│   │   └── send-notification/
│   │       └── route.ts        # Email notification API
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard page
│   ├── globals.css           # Global styles and theme
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Login page
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── add-property-dialog.tsx
│   ├── dashboard-layout.tsx
│   ├── edit-property-dialog.tsx
│   ├── login-form.tsx
│   ├── property-list.tsx
│   ├── property-stats.tsx
│   ├── send-notification-dialog.tsx
│   ├── notification-history.tsx
│   ├── record-payment-dialog.tsx
│   └── payment-history.tsx
├── contexts/
│   └── auth-context.tsx      # Global authentication state
├── lib/
│   └── utils.ts              # Utility functions (currency, dates)
├── types/
│   ├── property.ts           # TypeScript interfaces
│   └── notification.ts       # Notification types
└── README.md
```

### Data Model

```typescript
interface Property {
  id: string
  name: string
  rent: number
  occupant?: string
  occupantEmail?: string
  occupantPhone?: string
  stayPeriod?: string
  leaseStartDate?: string
  leaseEndDate?: string
  status: "vacant" | "occupied" | "maintenance"
  propertyType?: "apartment" | "house" | "commercial" | "land"
  address?: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  createdAt: string
  lastPaymentDate?: string
  nextPaymentDue?: string
  paymentStatus: "paid" | "pending" | "overdue"
}

interface Payment {
  id: string
  propertyId: string
  propertyName: string
  occupantName: string
  amount: number
  paymentDate: string
  paymentMethod: "cash" | "bank_transfer" | "card" | "check"
  status: "completed" | "pending" | "failed"
  receiptNumber?: string
  notes?: string
  createdAt: string
}

interface Notification {
  id: string
  propertyId: string
  propertyName: string
  recipientName: string
  recipientEmail?: string
  subject: string
  message: string
  type: "general" | "reminder" | "maintenance" | "payment" | "announcement"
  status: "sent" | "pending" | "failed"
  sentAt: string
  createdAt: string
}
```

### State Management

The application uses React Context API for global state management:

**AuthContext** (`contexts/auth-context.tsx`):
- Manages user authentication
- Handles signup, login, and logout
- Tracks new user status for onboarding
- Persists auth state

**Component State**:
- Properties managed at dashboard level
- Local state for forms and dialogs
- Theme state in ThemeProvider

### Data Flow

```
User Action → Component Handler → Context/State Update → localStorage → UI Update
```

For production:
```
User Action → Component Handler → API Route → Database → State Update → UI Update
```

## 🔐 User Data Isolation

### How It Works

The system ensures complete data separation between user accounts:

1. **User-Specific Storage**: All data is stored with the user ID as a key
   - Properties: `realestate_properties_{userId}`
   - Payments: `realestate_payments_{userId}`
   - Notifications: `realestate_notifications_{userId}`

2. **Automatic Filtering**: The system automatically loads only the logged-in user's data

3. **No Cross-User Access**: Users cannot see or access data from other accounts

4. **Production Ready**: This pattern works with both localStorage (development) and database (production via Supabase)

### Example:

- **User A** (ID: user_1234) creates 5 properties → Stored in `realestate_properties_user_1234`
- **User B** (ID: user_5678) creates 3 properties → Stored in `realestate_properties_user_5678`
- When User A logs in, they only see their 5 properties
- When User B logs in, they only see their 3 properties

## 📚 Documentation

- **README.md**: User guide and getting started (this file)
- **SUPABASE_SETUP.md**: Complete step-by-step guide for setting up Supabase authentication and database with Row Level Security (RLS) policies
- **FUNCTIONALITY.md**: Complete technical documentation covering state management, API endpoints, database schema, email setup, and deployment
- **UPSCALING.md**: Production deployment roadmap

## 🚀 Production Setup with Supabase

For production deployment with proper authentication and database:

1. See **SUPABASE_SETUP.md** for complete Supabase integration guide including:
   - Project setup and configuration
   - Database schema creation
   - Row Level Security (RLS) policies for data isolation
   - Authentication setup
   - Frontend integration code
   - Testing and troubleshooting

2. Key Features with Supabase:
   - **Real Authentication**: Email/password signup and login
   - **Secure Database**: PostgreSQL with automatic backups
   - **Data Isolation**: RLS policies ensure users only see their own data
   - **Email Verification**: Built-in email confirmation
   - **Session Management**: Automatic token refresh
   - **Real-time Updates**: Optional real-time data sync

## 🔒 Security Considerations

**Current (Development):**
- Frontend-only authentication with user isolation
- localStorage for data persistence with user-specific keys
- No password hashing (uses plain text - NOT for production)
- Client-side data separation

**Production Requirements (via Supabase):**
- Server-side authentication (Supabase Auth)
- Secure password hashing (bcrypt - handled by Supabase)
- Database with Row Level Security (RLS) - ensures users only access their own data
- HTTPS encryption
- Environment variables for secrets
- Rate limiting on API routes
- Automatic session management
- Email verification

See **SUPABASE_SETUP.md** for complete security implementation with RLS policies.

## 🎯 Key Features Explained

### Dynamic Property Forms

Property forms adapt based on property type:
- **Apartment/House**: Shows bedrooms and bathrooms
- **Commercial**: Focuses on size and location
- **Land**: Plot-specific fields
- **All Types**: Conditional occupant fields when status is "Occupied"

### First-Time User Experience

New users get:
1. Automatic onboarding tour
2. Step-by-step feature highlights
3. Visual indicators on key elements
4. Progress tracking through tour steps

### State Management

- **AuthContext**: Global authentication state
- **React Hooks**: Local component state
- **localStorage**: Data persistence (dev)
- **Production**: Context + Database + API

### Email Notifications

Integrated email sending:
- Real API endpoint (`/api/send-notification`)
- Production-ready for Resend/SendGrid
- Success/error feedback
- Email template support

## 📝 License

This project is provided as-is for educational and demonstration purposes.

## 🤝 Support

For technical implementation details, see **FUNCTIONALITY.md**.

For production deployment guidance, see **UPSCALING.md**.

For issues or questions, please create an issue in the project repository.
