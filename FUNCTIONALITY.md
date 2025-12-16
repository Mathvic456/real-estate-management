# Real Estate Management System - Functionality Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & State Management](#architecture--state-management)
3. [Authentication System](#authentication-system)
4. [Core Features Implementation](#core-features-implementation)
5. [API Routes & Endpoints](#api-routes--endpoints)
6. [Database Schema (Production)](#database-schema-production)
7. [State Management Patterns](#state-management-patterns)
8. [Notification System](#notification-system)
9. [Payment Processing](#payment-processing)
10. [Frontend-Backend Integration](#frontend-backend-integration)
11. [Deployment Guide](#deployment-guide)

---

## System Overview

The Real Estate Management System is a full-featured property management platform built with modern web technologies. It provides comprehensive tools for managing properties, tenants, payments, and communications.

### Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19.2
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Lucide React icons

**State Management:**
- React Context API (AuthContext)
- localStorage (development)
- React useState/useEffect hooks

**Backend (Production Setup):**
- Next.js API Routes
- Supabase/Neon (PostgreSQL)
- Server Actions
- Email APIs (Resend, SendGrid)

---

## Architecture & State Management

### Application Architecture

```
┌─────────────────────────────────────────────┐
│           Root Layout (app/layout.tsx)      │
│  ┌───────────────────────────────────────┐  │
│  │         AuthProvider                  │  │
│  │  (Global Authentication State)        │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │      ThemeProvider              │  │  │
│  │  │  (Theme Management)             │  │  │
│  │  │  ┌───────────────────────────┐  │  │  │
│  │  │  │    Pages & Components     │  │  │  │
│  │  │  └───────────────────────────┘  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### State Management Flow

#### Authentication State (`contexts/auth-context.tsx`)

```typescript
AuthContext Structure:
{
  user: User | null,              // Current logged-in user
  login: (email, password) => Promise<Result>,
  signup: (email, password, name) => Promise<Result>,
  logout: () => void,
  isLoading: boolean,            // Loading state
  isAuthenticated: boolean       // Quick auth check
}
```

**Implementation Details:**

1. **User Registration Flow:**
```typescript
signup(email, password, name) {
  // 1. Check if email exists
  const users = JSON.parse(localStorage.getItem('realestate_users'))
  const exists = users.find(u => u.email === email)
  
  // 2. Create new user object
  const newUser = {
    id: `user_${Date.now()}`,
    email,
    password, // Hash in production!
    name,
    createdAt: new Date().toISOString()
  }
  
  // 3. Save to users array
  users.push(newUser)
  localStorage.setItem('realestate_users', JSON.stringify(users))
  
  // 4. Set as current user with isNewUser flag
  localStorage.setItem('realestate_user', JSON.stringify({
    ...newUser,
    isNewUser: true  // Triggers onboarding
  }))
  
  return { success: true }
}
```

2. **Login Flow:**
```typescript
login(email, password) {
  // 1. Get all users
  const users = JSON.parse(localStorage.getItem('realestate_users'))
  
  // 2. Find matching user
  const user = users.find(u => 
    u.email === email && u.password === password
  )
  
  // 3. Set current user (without isNewUser flag)
  if (user) {
    localStorage.setItem('realestate_user', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      isNewUser: false  // No onboarding for returning users
    }))
    return { success: true }
  }
  
  return { success: false, error: 'Invalid credentials' }
}
```

3. **Logout Flow:**
```typescript
logout() {
  // Remove current user but keep users array
  localStorage.removeItem('realestate_user')
  router.push('/')
}
```

---

## Authentication System

### Frontend Authentication (Current)

**Login Component (`components/login-form.tsx`):**

```typescript
const LoginForm = ({ onSignupClick }) => {
  const { login } = useAuth()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error)
    }
  }
  
  return (
    // Login form UI
  )
}
```

**Signup Component (`components/signup-form.tsx`):**

```typescript
const SignupForm = ({ onBackToLogin }) => {
  const { signup } = useAuth()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    const result = await signup(email, password, name)
    
    if (result.success) {
      router.push('/dashboard')  // Triggers onboarding
    } else {
      setError(result.error)
    }
  }
  
  return (
    // Signup form UI
  )
}
```

### Production Authentication Setup

**Using Supabase Auth:**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Signup
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name }  // Additional user metadata
  }
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// Logout
await supabase.auth.signOut()

// Get current session
const { data: { session } } = await supabase.auth.getSession()
```

**Protected Routes Middleware:**

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Redirect to login if not authenticated
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

---

## Core Features Implementation

### 1. Property Management

**Data Structure:**

```typescript
interface Property {
  id: string
  name: string
  rent: number
  status: "vacant" | "occupied" | "maintenance"
  propertyType?: "apartment" | "house" | "commercial" | "land"
  address?: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  occupant?: string
  occupantEmail?: string
  occupantPhone?: string
  leaseStartDate?: string
  leaseEndDate?: string
  stayPeriod?: string
  paymentStatus: "paid" | "pending" | "overdue"
  lastPaymentDate?: string
  nextPaymentDue?: string
  createdAt: string
}
```

**CRUD Operations:**

```typescript
// CREATE
const handleAddProperty = (property: Property) => {
  const newProperties = [...properties, {
    ...property,
    id: `prop_${Date.now()}`,
    createdAt: new Date().toISOString()
  }]
  setProperties(newProperties)
  localStorage.setItem('realestate_properties', JSON.stringify(newProperties))
}

// READ
useEffect(() => {
  const stored = localStorage.getItem('realestate_properties')
  if (stored) {
    setProperties(JSON.parse(stored))
  }
}, [])

// UPDATE
const handleEditProperty = (updated: Property) => {
  const newProperties = properties.map(p => 
    p.id === updated.id ? updated : p
  )
  setProperties(newProperties)
  localStorage.setItem('realestate_properties', JSON.stringify(newProperties))
}

// DELETE
const handleDeleteProperty = (id: string) => {
  const newProperties = properties.filter(p => p.id !== id)
  setProperties(newProperties)
  localStorage.setItem('realestate_properties', JSON.stringify(newProperties))
}
```

### 2. Dynamic Form Fields

**Property Type-Based Field Display:**

```typescript
// components/add-property-dialog.tsx
const AddPropertyDialog = () => {
  const [propertyType, setPropertyType] = useState<string>("apartment")
  
  // Determine which fields to show
  const showResidentialFields = ["apartment", "house"].includes(propertyType)
  const isLand = propertyType === "land"
  
  return (
    <DialogContent>
      {/* Property Type Selector - Always visible */}
      <Select value={propertyType} onValueChange={setPropertyType}>
        <SelectItem value="apartment">Apartment</SelectItem>
        <SelectItem value="house">House</SelectItem>
        <SelectItem value="commercial">Commercial</SelectItem>
        <SelectItem value="land">Land</SelectItem>
      </Select>
      
      {/* Conditional Fields */}
      {showResidentialFields && (
        <>
          <Input label="Bedrooms" type="number" />
          <Input label="Bathrooms" type="number" />
        </>
      )}
      
      <Input 
        label={isLand ? "Plot Size (sq ft)" : "Square Feet"} 
        type="number" 
      />
      
      {/* Status-dependent fields */}
      {status === "occupied" && (
        <>
          <Input label="Occupant Name" />
          <Input label="Occupant Email" type="email" />
          <Input label="Occupant Phone" type="tel" />
          <Input label="Lease Start" type="date" />
          <Input label="Lease End" type="date" />
        </>
      )}
    </DialogContent>
  )
}
```

### 3. Search and Filtering

**Implementation:**

```typescript
const PropertyList = ({ properties }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  
  const filteredProperties = properties.filter(property => {
    // Text search across multiple fields
    const matchesSearch = 
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.occupant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = statusFilter === "all" || 
      property.status === statusFilter
    
    // Payment filter
    const matchesPayment = paymentFilter === "all" || 
      property.paymentStatus === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })
  
  return (
    <div>
      <div className="flex gap-4">
        <Input 
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="vacant">Vacant</SelectItem>
          <SelectItem value="occupied">Occupied</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectItem value="all">All Payments</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </Select>
      </div>
      
      <div className="mt-4">
        {filteredProperties.length} properties found
      </div>
      
      {filteredProperties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
```

---

## API Routes & Endpoints

### Current API Structure

**Notification Email API (`app/api/send-notification/route.ts`):**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientEmail, recipientName, subject, message, type } = body
    
    // Validation
    if (!recipientEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // TODO: Integrate with email service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'notifications@yourdomain.com',
    //   to: recipientEmail,
    //   subject: subject,
    //   html: `<p>${message}</p>`
    // })
    
    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully'
    })
  } catch (error) {
    console.error('[v0] Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
```

### Production API Endpoints

**1. Properties API:**

```typescript
// app/api/properties/route.ts
import { createServerClient } from '@supabase/ssr'

// GET all properties
export async function GET(request: NextRequest) {
  const supabase = createServerClient(...)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  return NextResponse.json({ properties: data })
}

// POST create property
export async function POST(request: NextRequest) {
  const supabase = createServerClient(...)
  const body = await request.json()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from('properties')
    .insert([{ ...body, user_id: user.id }])
    .select()
    .single()
  
  return NextResponse.json({ property: data })
}
```

```typescript
// app/api/properties/[id]/route.ts

// PUT update property
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient(...)
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('properties')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()
  
  return NextResponse.json({ property: data })
}

// DELETE property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient(...)
  
  await supabase
    .from('properties')
    .delete()
    .eq('id', params.id)
  
  return NextResponse.json({ success: true })
}
```

**2. Payments API:**

```typescript
// app/api/payments/route.ts

export async function POST(request: NextRequest) {
  const supabase = createServerClient(...)
  const body = await request.json()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert([{
      ...body,
      user_id: user.id,
      status: 'completed'
    }])
    .select()
    .single()
  
  // Update property payment status
  if (payment) {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    await supabase
      .from('properties')
      .update({
        payment_status: 'paid',
        last_payment_date: payment.payment_date,
        next_payment_due: nextMonth.toISOString().split('T')[0]
      })
      .eq('id', body.property_id)
  }
  
  return NextResponse.json({ payment })
}
```

**3. Notifications API (Enhanced):**

```typescript
// app/api/notifications/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const supabase = createServerClient(...)
  const body = await request.json()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Save notification to database
  const { data: notification } = await supabase
    .from('notifications')
    .insert([{
      ...body,
      user_id: user.id,
      status: 'pending'
    }])
    .select()
    .single()
  
  // Send email
  try {
    await resend.emails.send({
      from: 'RealEstate Manager <notifications@yourdomain.com>',
      to: body.recipientEmail,
      subject: body.subject,
      html: `
        <h2>${body.subject}</h2>
        <p>Dear ${body.recipientName},</p>
        <p>${body.message}</p>
        <hr />
        <p style="color: gray; font-size: 12px;">
          This is an automated message from your property manager.
        </p>
      `
    })
    
    // Update status to sent
    await supabase
      .from('notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', notification.id)
    
    return NextResponse.json({ success: true, notification })
  } catch (error) {
    // Update status to failed
    await supabase
      .from('notifications')
      .update({ status: 'failed' })
      .eq('id', notification.id)
    
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
```

---

## Database Schema (Production)

### PostgreSQL Schema

```sql
-- Users table (managed by Supabase Auth)
-- auth.users is automatically created

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rent NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('vacant', 'occupied', 'maintenance')),
  property_type TEXT CHECK (property_type IN ('apartment', 'house', 'commercial', 'land')),
  address TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_feet INTEGER,
  occupant_name TEXT,
  occupant_email TEXT,
  occupant_phone TEXT,
  lease_start_date DATE,
  lease_end_date DATE,
  stay_period TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
  last_payment_date DATE,
  next_payment_due DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  occupant_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'check')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'reminder', 'maintenance', 'payment', 'announcement')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('sent', 'pending', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_payment_status ON properties(payment_status);
CREATE INDEX idx_properties_lease_end ON properties(lease_end_date);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_property_id ON payments(property_id);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for payments and notifications
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Database Connection Setup

**Supabase Configuration:**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side client
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**Environment Variables:**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email service
RESEND_API_KEY=re_your_api_key

# Optional: SMS notifications
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## State Management Patterns

### Context-Based State Management

**1. Authentication Context:**

```typescript
// contexts/auth-context.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Check auth status on mount
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('realestate_user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**2. Properties State (Component-level):**

```typescript
// app/dashboard/page.tsx
const [properties, setProperties] = useState<Property[]>([])

// Load from storage
useEffect(() => {
  const stored = localStorage.getItem('realestate_properties')
  if (stored) setProperties(JSON.parse(stored))
}, [])

// Save to storage on change
useEffect(() => {
  localStorage.setItem('realestate_properties', JSON.stringify(properties))
}, [properties])
```

**3. Production: Server State with SWR:**

```typescript
// hooks/use-properties.ts
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useProperties() {
  const { data, error, mutate } = useSWR('/api/properties', fetcher)
  
  const addProperty = async (property: Property) => {
    // Optimistic update
    mutate({ ...data, properties: [...data.properties, property] }, false)
    
    // Send to server
    const res = await fetch('/api/properties', {
      method: 'POST',
      body: JSON.stringify(property)
    })
    
    // Revalidate
    mutate()
  }
  
  return {
    properties: data?.properties || [],
    isLoading: !error && !data,
    isError: error,
    addProperty,
    mutate
  }
}
```

---

## Notification System

### Email Integration (Resend)

**1. Install Resend:**

```bash
npm install resend
```

**2. Create Email Template:**

```typescript
// emails/notification-template.tsx
import { Html, Head, Body, Container, Section, Text, Button } from '@react-email/components'

interface NotificationEmailProps {
  recipientName: string
  subject: string
  message: string
  type: string
}

export default function NotificationEmail({
  recipientName,
  subject,
  message,
  type
}: NotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc' }}>
        <Container style={{ padding: '40px' }}>
          <Section style={{ backgroundColor: '#ffffff', padding: '40px' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {subject}
            </Text>
            <Text style={{ fontSize: '16px', color: '#666' }}>
              Dear {recipientName},
            </Text>
            <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
              {message}
            </Text>
            <Text style={{ fontSize: '12px', color: '#999', marginTop: '40px' }}>
              This is an automated notification from your property manager.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

**3. Send Email:**

```typescript
// app/api/send-notification/route.ts
import { Resend } from 'resend'
import NotificationEmail from '@/emails/notification-template'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const { data, error } = await resend.emails.send({
    from: 'Property Manager <notifications@yourdomain.com>',
    to: body.recipientEmail,
    subject: body.subject,
    react: NotificationEmail({
      recipientName: body.recipientName,
      subject: body.subject,
      message: body.message,
      type: body.type
    })
  })
  
  return NextResponse.json({ success: !error, data, error })
}
```

### Bulk Notifications

```typescript
// app/api/notifications/bulk/route.ts
export async function POST(request: NextRequest) {
  const { properties, subject, message, type } = await request.json()
  
  const results = await Promise.allSettled(
    properties.map(property => 
      resend.emails.send({
        from: 'Property Manager <notifications@yourdomain.com>',
        to: property.occupantEmail,
        subject,
        react: NotificationEmail({
          recipientName: property.occupant,
          subject,
          message,
          type
        })
      })
    )
  )
  
  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  return NextResponse.json({
    success: true,
    sent: successful,
    failed
  })
}
```

---

## Payment Processing

### Payment Gateway Integration (Paystack)

**1. Install Paystack:**

```bash
npm install @paystack/inline-js
```

**2. Payment Component:**

```typescript
// components/paystack-payment.tsx
import { usePaystackPayment } from 'react-paystack'

export default function PaystackPayment({ amount, email, onSuccess }) {
  const config = {
    reference: `pay_${Date.now()}`,
    email,
    amount: amount * 100, // Convert to kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  }
  
  const initializePayment = usePaystackPayment(config)
  
  const handlePayment = () => {
    initializePayment(
      (reference) => {
        // Payment successful
        onSuccess(reference)
      },
      () => {
        // Payment failed
        console.error('Payment failed')
      }
    )
  }
  
  return (
    <Button onClick={handlePayment}>
      Pay ₦{amount.toLocaleString()}
    </Button>
  )
}
```

**3. Verify Payment on Backend:**

```typescript
// app/api/payments/verify/route.ts
export async function POST(request: NextRequest) {
  const { reference } = await request.json()
  
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    }
  )
  
  const data = await response.json()
  
  if (data.data.status === 'success') {
    // Record payment in database
    const payment = await supabase
      .from('payments')
      .insert([{
        property_id: data.data.metadata.property_id,
        amount: data.data.amount / 100,
        payment_method: 'card',
        receipt_number: reference,
        status: 'completed'
      }])
    
    return NextResponse.json({ success: true, payment })
  }
  
  return NextResponse.json({ success: false }, { status: 400 })
}
```

---

## Frontend-Backend Integration

### Data Fetching Patterns

**1. Server Components (Recommended):**

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
  
  return <PropertyList properties={properties} />
}
```

**2. Client Components with SWR:**

```typescript
// components/property-list.tsx
'use client'

import useSWR from 'swr'

export default function PropertyList() {
  const { data, mutate } = useSWR('/api/properties')
  
  const handleDelete = async (id: string) => {
    await fetch(`/api/properties/${id}`, { method: 'DELETE' })
    mutate() // Revalidate data
  }
  
  return (
    // Render properties
  )
}
```

**3. Server Actions (Modern Approach):**

```typescript
// app/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addProperty(formData: FormData) {
  const supabase = createClient()
  
  const property = {
    name: formData.get('name'),
    rent: formData.get('rent'),
    // ... other fields
  }
  
  const { data, error } = await supabase
    .from('properties')
    .insert([property])
  
  if (!error) {
    revalidatePath('/dashboard')
  }
  
  return { success: !error, data, error }
}
```

**4. Using Server Actions in Components:**

```typescript
// components/add-property-form.tsx
'use client'

import { addProperty } from '@/app/actions'

export default function AddPropertyForm() {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const result = await addProperty(formData)
    
    if (result.success) {
      toast.success('Property added!')
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## Deployment Guide

### Vercel Deployment

**1. Push to GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/realestate-manager.git
git push -u origin main
```

**2. Deploy to Vercel:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add RESEND_API_KEY

# Deploy to production
vercel --prod
```

**3. Or use Vercel Dashboard:**
- Go to vercel.com
- Click "New Project"
- Import from GitHub
- Configure environment variables
- Deploy

### Environment Variables Checklist

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email (choose one)
RESEND_API_KEY=
# OR
SENDGRID_API_KEY=

# Payment (optional)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=

# SMS (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## Performance Optimization

### Caching Strategies

```typescript
// API route with caching
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { properties: data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    }
  )
}
```

### Database Query Optimization

```typescript
// Use select to fetch only needed columns
const { data } = await supabase
  .from('properties')
  .select('id, name, rent, status')
  .limit(50)

// Use indexes for frequently filtered columns
CREATE INDEX idx_properties_status ON properties(status);
```

---

## Security Best Practices

1. **Never store passwords in plain text** - Use bcrypt
2. **Use environment variables** for sensitive keys
3. **Enable RLS** on all database tables
4. **Validate all inputs** on backend
5. **Use HTTPS** in production
6. **Implement rate limiting** on API routes
7. **Sanitize user inputs** to prevent XSS
8. **Use prepared statements** to prevent SQL injection

---

## Monitoring and Logging

```typescript
// lib/logger.ts
export const logger = {
  error: (message: string, error: Error) => {
    console.error(`[ERROR] ${message}`, error)
    // Send to error tracking service (Sentry, etc.)
  },
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data)
  }
}
```

---

This documentation provides a comprehensive guide to all functionality, state management, API endpoints, database schema, and deployment instructions for the Real Estate Management System. Use it as a reference for development, maintenance, and scaling the application.
