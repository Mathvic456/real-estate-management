# Complete Supabase Integration Guide for Real Estate Management System

This comprehensive guide will walk you through setting up Supabase for authentication and database management in your Real Estate Management System.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema & Tables](#database-schema--tables)
4. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
5. [Authentication Setup](#authentication-setup)
6. [Frontend Integration](#frontend-integration)
7. [Testing Your Setup](#testing-your-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js 18+ installed
- Basic understanding of SQL and PostgreSQL

---

## Supabase Project Setup

### Step 1: Create a New Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `real-estate-management`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest region to your users
   - **Pricing Plan**: Start with Free tier
4. Click **"Create new project"** and wait 2-3 minutes for setup

### Step 2: Get Your Project Credentials

1. Once created, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (for admin operations - keep this secret!)

### Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: Add `.env.local` to your `.gitignore` to keep credentials secure!

---

## Database Schema & Tables

### Step 1: Create the Users Profile Table

Supabase automatically creates an `auth.users` table. We'll extend it with a public profile table.

Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 2: Create Properties Table

```sql
-- Create properties table
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  rent NUMERIC(10, 2) NOT NULL,
  occupant TEXT,
  occupant_email TEXT,
  occupant_phone TEXT,
  stay_period TEXT,
  lease_start_date DATE,
  lease_end_date DATE,
  status TEXT CHECK (status IN ('vacant', 'occupied', 'maintenance')) DEFAULT 'vacant',
  property_type TEXT CHECK (property_type IN ('apartment', 'house', 'commercial', 'land')) DEFAULT 'apartment',
  address TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_feet INTEGER,
  last_payment_date DATE,
  next_payment_due DATE,
  payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at trigger for properties
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_payment_status ON public.properties(payment_status);
```

### Step 3: Create Notifications Table

```sql
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  property_name TEXT NOT NULL,
  occupant_name TEXT NOT NULL,
  occupant_email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('general', 'reminder', 'maintenance', 'payment', 'announcement')) DEFAULT 'general',
  status TEXT CHECK (status IN ('draft', 'sent', 'failed')) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_property_id ON public.notifications(property_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
```

### Step 4: Create Payments Table

```sql
-- Create payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  property_name TEXT NOT NULL,
  occupant_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'check')) NOT NULL,
  status TEXT CHECK (status IN ('completed', 'pending', 'failed')) DEFAULT 'completed',
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_property_id ON public.payments(property_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date DESC);
```

---

## Row Level Security (RLS) Policies

**Critical**: RLS ensures users can only access their own data. This prevents data leaks between accounts.

### Step 1: Enable RLS on All Tables

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Profiles Policies

```sql
-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

### Step 3: Create Properties Policies

```sql
-- Properties: Users can do everything with their own properties
CREATE POLICY "Users can view own properties"
  ON public.properties
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON public.properties
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON public.properties
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON public.properties
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 4: Create Notifications Policies

```sql
-- Notifications: Users can manage their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 5: Create Payments Policies

```sql
-- Payments: Users can manage their own payment records
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON public.payments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments"
  ON public.payments
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Authentication Setup

### Step 1: Configure Email Authentication

1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. **Email** should be enabled by default
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize "Confirm signup", "Magic link", etc.

### Step 2: Configure Email Settings (Production)

For production, configure SMTP:

1. Go to **Settings** > **Authentication**
2. Scroll to **SMTP Settings**
3. Choose an email provider:
   - **SendGrid**, **Resend**, **AWS SES**, etc.
4. Enter your SMTP credentials
5. Set sender email (e.g., `noreply@yourdomain.com`)

### Step 3: Configure Site URL and Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (development)
3. Set **Redirect URLs** (add both):
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/callback`
4. For production, add your production URLs

---

## Frontend Integration

### Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Step 2: Create Supabase Client Utility

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle error in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle error
          }
        },
      },
    }
  )
}
```

### Step 3: Update Auth Context to Use Supabase

Replace `contexts/auth-context.tsx`:

```typescript
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  isNewUser?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .single()

    if (profile) {
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        createdAt: profile.created_at,
        isNewUser: false,
      })
    }
    setIsLoading(false)
  }

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Mark as new user for onboarding
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name,
          createdAt: new Date().toISOString(),
          isNewUser: true,
        })
        return { success: true }
      }

      return { success: false, error: "Signup failed" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await loadUserProfile(data.user)
        return { success: true }
      }

      return { success: false, error: "Login failed" }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
```

### Step 4: Update Dashboard to Use Supabase

Update `app/dashboard/page.tsx` to fetch user-specific data:

```typescript
"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import DashboardLayout from "@/components/dashboard-layout"
// ... other imports

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const supabase = createClient()
  const [properties, setProperties] = useState<Property[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/")
        return
      }

      loadData()
    }
  }, [authLoading, isAuthenticated, user])

  const loadData = async () => {
    if (!user) return

    // Fetch properties
    const { data: propertiesData } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (propertiesData) {
      setProperties(propertiesData.map(transformProperty))
    }

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })

    if (notificationsData) {
      setNotifications(notificationsData.map(transformNotification))
    }

    // Fetch payments
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("payment_date", { ascending: false })

    if (paymentsData) {
      setPayments(paymentsData.map(transformPayment))
    }

    setIsLoading(false)
  }

  const handleAddProperty = async (property: Property) => {
    const { data, error } = await supabase
      .from("properties")
      .insert({
        user_id: user!.id,
        name: property.name,
        rent: property.rent,
        occupant: property.occupant,
        occupant_email: property.occupantEmail,
        occupant_phone: property.occupantPhone,
        stay_period: property.stayPeriod,
        lease_start_date: property.leaseStartDate,
        lease_end_date: property.leaseEndDate,
        status: property.status,
        property_type: property.propertyType,
        address: property.address,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        square_feet: property.squareFeet,
        payment_status: property.paymentStatus,
      })
      .select()
      .single()

    if (data) {
      setProperties([transformProperty(data), ...properties])
    }
  }

  // Add similar functions for edit, delete, notifications, payments...

  // Helper transform functions
  const transformProperty = (dbProperty: any): Property => ({
    id: dbProperty.id,
    name: dbProperty.name,
    rent: parseFloat(dbProperty.rent),
    occupant: dbProperty.occupant,
    occupantEmail: dbProperty.occupant_email,
    occupantPhone: dbProperty.occupant_phone,
    stayPeriod: dbProperty.stay_period,
    leaseStartDate: dbProperty.lease_start_date,
    leaseEndDate: dbProperty.lease_end_date,
    status: dbProperty.status,
    propertyType: dbProperty.property_type,
    address: dbProperty.address,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    squareFeet: dbProperty.square_feet,
    createdAt: dbProperty.created_at,
    lastPaymentDate: dbProperty.last_payment_date,
    nextPaymentDue: dbProperty.next_payment_due,
    paymentStatus: dbProperty.payment_status,
  })

  // ... rest of component
}
```

---

## Testing Your Setup

### 1. Test User Signup

```typescript
// In your browser console or test file
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'securepassword123',
  options: {
    data: { full_name: 'Test User' }
  }
})

console.log('Signup result:', data, error)
```

### 2. Test Property Creation

```typescript
const { data, error } = await supabase
  .from('properties')
  .insert({
    user_id: 'your-user-id',
    name: 'Test Property',
    rent: 50000,
    status: 'vacant'
  })
  .select()

console.log('Property created:', data, error)
```

### 3. Verify RLS is Working

Try to query another user's data:

```sql
-- This should return empty (no rows) if RLS is working
SELECT * FROM properties WHERE user_id != auth.uid();
```

---

## Troubleshooting

### Issue: "new row violates row-level security policy"

**Solution**: Ensure you're authenticated and the `user_id` matches `auth.uid()`.

### Issue: Properties from other users are visible

**Solution**: Check that RLS is enabled and policies are correctly applied:

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'properties';
```

### Issue: "relation 'public.profiles' does not exist"

**Solution**: Run the profiles table creation SQL script again.

### Issue: Auth emails not sending

**Solution**: 
1. Check SMTP settings in Supabase Dashboard
2. Verify email templates are configured
3. Check spam folder
4. For development, check Supabase logs

### Issue: Session expires too quickly

**Solution**: Adjust session timeout in **Authentication** > **Settings**:

```sql
-- Default is 1 week, you can change it
ALTER TABLE auth.refresh_tokens 
  ALTER COLUMN expires_at SET DEFAULT NOW() + INTERVAL '30 days';
```

---

## Production Checklist

Before going live:

- [ ] Enable SMTP with custom domain email
- [ ] Set up proper redirect URLs (production domain)
- [ ] Enable email confirmation for signups
- [ ] Configure password requirements
- [ ] Set up database backups (automatic in paid plans)
- [ ] Add database indexes for performance
- [ ] Enable real-time subscriptions (if needed)
- [ ] Set up monitoring and alerts
- [ ] Review and test all RLS policies
- [ ] Enable 2FA for Supabase dashboard access
- [ ] Set up staging environment for testing

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

## Support

If you encounter issues:

1. Check [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Review [Common Issues](https://supabase.com/docs/guides/getting-started/troubleshooting)
3. Contact support at support@supabase.com

---

**Last Updated**: January 2025
**Version**: 1.0.0
