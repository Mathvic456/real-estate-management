# Upscaling Guide: Real Estate Management System

This guide provides a comprehensive roadmap for transforming the frontend-only real estate management system into a production-ready, full-stack application.

## Table of Contents

1. [Phase 1: Backend Infrastructure](#phase-1-backend-infrastructure)
2. [Phase 2: Database Integration](#phase-2-database-integration)
3. [Phase 3: Authentication & Security](#phase-3-authentication--security)
4. [Phase 4: Advanced Features](#phase-4-advanced-features)
5. [Phase 5: Scalability & Performance](#phase-5-scalability--performance)
6. [Phase 6: Production Deployment](#phase-6-production-deployment)

---

## Phase 1: Backend Infrastructure

### 1.1 API Routes Setup

Replace localStorage with Next.js API routes to handle server-side logic.

**Create API Routes:**

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── session/route.ts
├── properties/
│   ├── route.ts              # GET all, POST new
│   └── [id]/route.ts         # GET, PUT, DELETE by ID
├── payments/
│   ├── route.ts              # GET all, POST new payment
│   └── [id]/route.ts         # GET, PUT payment by ID
├── stats/route.ts            # GET statistics
├── notifications/
│   ├── route.ts              # GET all notifications
│   ├── send/route.ts         # POST send notification (with email)
│   └── bulk/route.ts         # POST send bulk notifications
└── send-notification/
    └── route.ts              # Email notification endpoint
```

**Example Property API Route:**

```typescript
// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Fetch properties from database
  const properties = await db.query('SELECT * FROM properties')
  return NextResponse.json(properties)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // Validate and insert into database
  const newProperty = await db.insert('properties', body)
  return NextResponse.json(newProperty, { status: 201 })
}
```

### 1.2 Environment Variables

Create `.env.local` for configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/realestate

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email Service (Resend - Recommended)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Alternative: SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx

# Alternative: Mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Cron Job Secret (for scheduled tasks)
CRON_SECRET=your-cron-secret-key

# File Upload (Vercel Blob)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

---

## Phase 2: Database Integration

### 2.1 Database Selection

**Recommended Options:**

1. **PostgreSQL** (Recommended for production)
   - Robust, scalable, open-source
   - Excellent for relational data
   - Providers: Supabase, Neon, AWS RDS

2. **MongoDB**
   - Flexible schema
   - Good for rapid development
   - Provider: MongoDB Atlas

3. **MySQL**
   - Widely supported
   - Good performance
   - Provider: PlanetScale, AWS RDS

### 2.2 Database Schema

**PostgreSQL Schema Example:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'manager',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  rent DECIMAL(10, 2) NOT NULL,
  occupant VARCHAR(255),
  occupant_email VARCHAR(255),
  occupant_phone VARCHAR(50),
  stay_period VARCHAR(100),
  lease_start_date DATE,
  lease_end_date DATE,
  status VARCHAR(50) DEFAULT 'vacant',
  property_type VARCHAR(50),
  address TEXT,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_feet INTEGER,
  payment_status VARCHAR(50) DEFAULT 'paid',
  next_payment_due DATE,
  last_payment_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  property_name VARCHAR(255) NOT NULL,
  occupant_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  receipt_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  property_name VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification Preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  types_enabled TEXT[] DEFAULT ARRAY['all'],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_payments_property_id ON payments(property_id);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);
CREATE INDEX idx_notifications_property_id ON notifications(property_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 2.3 ORM Integration (Optional)

**Using Prisma:**

```bash
npm install @prisma/client prisma
npx prisma init
```

**Prisma Schema:**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("manager")
  properties Property[]
  notifications Notification[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Property {
  id                String   @id @default(uuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  name              String
  rent              Float
  occupant          String?
  occupantEmail     String?
  occupantPhone     String?
  stayPeriod        String?
  leaseStartDate    DateTime?
  leaseEndDate      DateTime?
  status            String   @default("vacant")
  propertyType      String?
  address           String?
  bedrooms          Int?
  bathrooms         Float?
  squareFeet        Int?
  paymentStatus     String   @default("paid")
  nextPaymentDue    DateTime?
  lastPaymentDate   DateTime?
  notifications     Notification[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@index([propertyType])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}

model Payment {
  id             String   @id @default(uuid())
  propertyId     String
  property       Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  propertyName   String
  occupantName   String
  amount         Float
  paymentDate    DateTime
  paymentMethod  String
  status         String   @default("completed")
  receiptNumber  String?
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([propertyId])
  @@index([paymentDate(sort: Desc)])
}

model Notification {
  id             String   @id @default(uuid())
  propertyId     String
  property       Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  propertyName   String
  recipientName  String
  recipientEmail String?
  subject        String
  message        String
  type           String
  status         String   @default("pending")
  sentAt         DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([propertyId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}

model NotificationPreference {
  id               String   @id @default(uuid())
  propertyId       String
  property         Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  emailEnabled     Boolean  @default(true)
  smsEnabled       Boolean  @default(false)
  notificationTypes Jsonb    @default('{"payment": true, "maintenance": true, "general": true, "announcement": true}')
  quietHoursStart  DateTime? @default(dbgenerated("'22:00'::time"))
  quietHoursEnd    DateTime? @default(dbgenerated("'08:00'::time"))
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([propertyId])
}
```

Run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Phase 3: Authentication & Security

### 3.1 NextAuth.js Setup

**Install Dependencies:**

```bash
npm install next-auth @auth/prisma-adapter bcrypt
npm install -D @types/bcrypt
```

**Configure NextAuth:**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 3.2 Protected Routes Middleware

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/api/properties/:path*', '/api/notifications/:path*']
}
```

### 3.3 Security Best Practices

**Input Validation:**

```bash
npm install zod
```

```typescript
// lib/validations/property.ts
import { z } from 'zod'

const baseSchema = z.object({
  name: z.string().min(3).max(255),
  rent: z.number().positive(),
  propertyType: z.enum(['apartment', 'house', 'commercial', 'land']),
  address: z.string().optional(),
  status: z.enum(['vacant', 'occupied', 'maintenance']),
})

export const apartmentSchema = baseSchema.extend({
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(10),
  squareFeet: z.number().int().positive().optional(),
})

export const commercialSchema = baseSchema.extend({
  squareFeet: z.number().int().positive(),
  zoning: z.string().optional(),
})

export const landSchema = baseSchema.extend({
  squareFeet: z.number().int().positive(),
  zoning: z.string().optional(),
  terrain: z.string().optional(),
})

export function getSchemaForPropertyType(type: string) {
  switch (type) {
    case 'apartment':
    case 'house':
      return apartmentSchema
    case 'commercial':
      return commercialSchema
    case 'land':
      return landSchema
    default:
      return baseSchema
  }
}
```

**Rate Limiting:**

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

---

## Phase 4: Advanced Features

### 4.1 Multi-Tenancy

Add organization support for multiple management companies:

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE properties ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

### 4.1 Dynamic Property Forms

The system includes dynamic property forms that adapt based on property type:

**Current Implementation:**
- **Apartment/House**: Shows all fields including bedrooms, bathrooms, and residential details
- **Commercial**: Focuses on square footage and location (hides bedroom/bathroom fields)
- **Land**: Shows plot size and address (hides bedroom/bathroom fields)

**Enhancement for Production:**

```typescript
// lib/property-fields-config.ts
export const propertyFieldsByType = {
  apartment: {
    required: ['name', 'rent', 'address', 'bedrooms', 'bathrooms'],
    optional: ['squareFeet', 'floor', 'parkingSpaces', 'amenities'],
    hidden: [],
  },
  house: {
    required: ['name', 'rent', 'address', 'bedrooms', 'bathrooms'],
    optional: ['squareFeet', 'lotSize', 'yearBuilt', 'garageSpaces'],
    hidden: [],
  },
  commercial: {
    required: ['name', 'rent', 'address', 'squareFeet'],
    optional: ['zoning', 'parkingSpaces', 'loading docks', 'officeCount'],
    hidden: ['bedrooms', 'bathrooms'],
  },
  land: {
    required: ['name', 'rent', 'address', 'squareFeet'],
    optional: ['zoning', 'utilities', 'terrain', 'accessibility'],
    hidden: ['bedrooms', 'bathrooms'],
  },
}

export function getFieldsForPropertyType(type: string) {
  return propertyFieldsByType[type] || propertyFieldsByType.apartment
}
```

**Validation Schema by Type:**

```typescript
// lib/validations/property.ts
import { z } from 'zod'

const baseSchema = z.object({
  name: z.string().min(3).max(255),
  rent: z.number().positive(),
  propertyType: z.enum(['apartment', 'house', 'commercial', 'land']),
  address: z.string().optional(),
  status: z.enum(['vacant', 'occupied', 'maintenance']),
})

export const apartmentSchema = baseSchema.extend({
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(10),
  squareFeet: z.number().int().positive().optional(),
})

export const commercialSchema = baseSchema.extend({
  squareFeet: z.number().int().positive(),
  zoning: z.string().optional(),
})

export const landSchema = baseSchema.extend({
  squareFeet: z.number().int().positive(),
  zoning: z.string().optional(),
  terrain: z.string().optional(),
})

export function getSchemaForPropertyType(type: string) {
  switch (type) {
    case 'apartment':
    case 'house':
      return apartmentSchema
    case 'commercial':
      return commercialSchema
    case 'land':
      return landSchema
    default:
      return baseSchema
  }
}
```

### 4.2 Real Email Notification System

The system includes a working email notification API ready for production integration.

#### 4.2.1 Email Service Integration (Resend - Recommended)

**Install Resend:**

```bash
npm install resend
```

**Update the Email API Route:**

```typescript
// app/api/send-notification/route.ts
import { NextResponse } from "next/server"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, message, propertyName, occupantName } = body

    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: 'Property Management <notifications@yourdomain.com>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Property Notification</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #6b7280;"><strong>Property:</strong> ${propertyName}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Resident:</strong> ${occupantName}</p>
            </div>
            
            <div style="color: #374151; line-height: 1.6; white-space: pre-wrap;">
              ${message}
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated notification from your property management system.
              If you have questions, please contact your property manager directly.
            </p>
          </div>
        </div>
      `
    })

    if (error) {
      console.error("[v0] Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Email notification sent successfully",
      messageId: data?.id,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email notification" }, { status: 500 })
  }
}
```

**Setup Instructions:**

1. Sign up for Resend at https://resend.com
2. Get your API key from the dashboard
3. Add `RESEND_API_KEY` to your `.env.local` file
4. Verify your domain for production use (Resend provides a test mode for development)
5. Update the `from` email address to match your verified domain

#### 4.2.2 Alternative: SendGrid Integration

```bash
npm install @sendgrid/mail
```

```typescript
// lib/email-sendgrid.ts
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmailWithSendGrid({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await sgMail.send({
      to,
      from: 'notifications@yourdomain.com',
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('SendGrid error:', error)
    return { success: false, error }
  }
}
```

#### 4.2.3 Notification Templates

Create reusable email templates for common scenarios:

```typescript
// lib/email-templates.ts
export const emailTemplates = {
  rentReminder: ({
    occupantName,
    amount,
    dueDate,
    propertyName,
  }: {
    occupantName: string
    amount: number
    dueDate: string
    propertyName: string
  }) => ({
    subject: 'Rent Payment Reminder',
    message: `Dear ${occupantName},

This is a friendly reminder that your rent payment of ₦${amount.toLocaleString()} is due on ${dueDate} for ${propertyName}.

Please ensure payment is made on time to avoid any late fees.

Thank you for your prompt attention to this matter.

Best regards,
Property Management Team`,
  }),
  
  maintenanceNotice: ({
    occupantName,
    date,
    description,
    propertyName,
  }: {
    occupantName: string
    date: string
    description: string
    propertyName: string
  }) => ({
    subject: 'Scheduled Maintenance Notice',
    message: `Dear ${occupantName},

We will be performing scheduled maintenance at ${propertyName} on ${date}.

Work to be performed: ${description}

Please ensure access to your unit during this time. We appreciate your cooperation and apologize for any inconvenience.

If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
Property Management Team`,
  }),
  
  leaseRenewal: ({
    occupantName,
    expiryDate,
    propertyName,
  }: {
    occupantName: string
    expiryDate: string
    propertyName: string
  }) => ({
    subject: 'Lease Renewal Notice',
    message: `Dear ${occupantName},

Your current lease agreement for ${propertyName} will expire on ${expiryDate}.

If you wish to renew your lease, please contact us at your earliest convenience to discuss terms and conditions.

We value you as a tenant and hope to continue our relationship.

Best regards,
Property Management Team`,
  }),

  paymentConfirmation: ({
    occupantName,
    amount,
    date,
    receiptNumber,
    propertyName,
  }: {
    occupantName: string
    amount: number
    date: string
    receiptNumber: string
    propertyName: string
  }) => ({
    subject: 'Payment Confirmation',
    message: `Dear ${occupantName},

This confirms that we have received your rent payment of ₦${amount.toLocaleString()} for ${propertyName} on ${date}.

Receipt Number: ${receiptNumber}

Thank you for your timely payment. Your receipt has been recorded in our system.

Best regards,
Property Management Team`,
  }),

  welcomeMessage: ({
    occupantName,
    propertyName,
    leaseStartDate,
    monthlyRent,
  }: {
    occupantName: string
    propertyName: string
    leaseStartDate: string
    monthlyRent: number
  }) => ({
    subject: 'Welcome to Your New Property!',
    message: `Dear ${occupantName},

Welcome to ${propertyName}!

We're excited to have you as our tenant. Your lease begins on ${leaseStartDate}, and your monthly rent is ₦${monthlyRent.toLocaleString()}.

Here are some important reminders:
• Rent is due on the 1st of each month
• Please keep your unit in good condition
• Report any maintenance issues promptly
• Keep us updated with your contact information

If you have any questions or need assistance, please don't hesitate to reach out.

Welcome home!

Best regards,
Property Management Team`,
  }),
}
```

**Usage in Component:**

```typescript
import { emailTemplates } from '@/lib/email-templates'

// In your notification dialog
const template = emailTemplates.rentReminder({
  occupantName: property.occupant,
  amount: property.rent,
  dueDate: property.nextPaymentDue,
  propertyName: property.name,
})

setSubject(template.subject)
setMessage(template.message)
```

#### 4.2.4 Bulk Notifications

Send notifications to multiple tenants at once:

```typescript
// app/api/notifications/bulk/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { properties, subject, message, type } = await request.json()

    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return NextResponse.json({ error: 'No properties provided' }, { status: 400 })
    }

    const results = await Promise.allSettled(
      properties.map(async (property) => {
        if (!property.occupantEmail) {
          throw new Error(`No email for ${property.name}`)
        }

        return resend.emails.send({
          from: 'Property Management <notifications@yourdomain.com>',
          to: [property.occupantEmail],
          subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${subject}</h2>
              <p><strong>Property:</strong> ${property.name}</p>
              <div style="margin: 20px 0; padding: 20px; background: #f3f4f6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          `,
        })
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      total: results.length,
      successful,
      failed,
      details: results,
    })
  } catch (error) {
    console.error('[v0] Bulk notification error:', error)
    return NextResponse.json({ error: 'Failed to send bulk notifications' }, { status: 500 })
  }
}
```

#### 4.2.5 Scheduled Notifications with Cron Jobs

Automate rent reminders using Vercel Cron Jobs:

**Create Cron Job Configuration:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/rent-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/lease-expiry-alerts",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

**Rent Reminder Cron Job:**

```typescript
// app/api/cron/rent-reminders/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { emailTemplates } from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get properties from localStorage simulation or database
    // In production, fetch from your database
    const properties = [] // Fetch from DB

    // Find properties with rent due in 3 days
    const today = new Date()
    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(today.getDate() + 3)

    const propertiesNeedingReminders = properties.filter((property) => {
      if (!property.nextPaymentDue || !property.occupantEmail) return false
      
      const dueDate = new Date(property.nextPaymentDue)
      return dueDate <= threeDaysFromNow && dueDate > today
    })

    // Send reminders
    const results = await Promise.allSettled(
      propertiesNeedingReminders.map(async (property) => {
        const template = emailTemplates.rentReminder({
          occupantName: property.occupant,
          amount: property.rent,
          dueDate: property.nextPaymentDue,
          propertyName: property.name,
        })

        return resend.emails.send({
          from: 'Property Management <notifications@yourdomain.com>',
          to: [property.occupantEmail!],
          subject: template.subject,
          html: template.message.replace(/\n/g, '<br>'),
        })
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length

    return NextResponse.json({
      success: true,
      remindersSent: successful,
      total: propertiesNeedingReminders.length,
    })
  } catch (error) {
    console.error('[v0] Cron job error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
```

#### 4.2.6 SMS Notifications (Optional)

For urgent notifications, integrate SMS using Twilio:

```bash
npm install twilio
```

```typescript
// lib/sms.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS(to: string, message: string) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('SMS send error:', error)
    return { success: false, error }
  }
}
```

**Multi-Channel Notification Function:**

```typescript
// lib/notifications.ts
import { sendEmailWithResend } from './email' // Assuming you have this function
import { sendSMS } from './sms'

export async function sendMultiChannelNotification({
  email,
  phone,
  subject,
  message,
  channels = ['email'],
}: {
  email?: string
  phone?: string
  subject: string
  message: string
  channels: ('email' | 'sms')[]
}) {
  const results = {
    email: { sent: false, error: null },
    sms: { sent: false, error: null },
  }

  if (channels.includes('email') && email) {
    // You'll need to implement sendEmailWithResend or use your preferred email service function
    const emailResult = await sendEmailWithResend({ to: email, subject, html: message }) 
    results.email = emailResult
  }

  if (channels.includes('sms') && phone) {
    const smsResult = await sendSMS(phone, `${subject}: ${message}`)
    results.sms = smsResult
  }

  return results
}
```

#### 4.2.7 Notification Preferences

Allow tenants to manage their notification preferences:

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  notification_types JSONB DEFAULT '{"payment": true, "maintenance": true, "general": true, "announcement": true}',
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 Payment Integration (Paystack for Nigeria)

For Nigerian Naira transactions, use Paystack:

```bash
npm install paystack-api
```

```typescript
// lib/paystack.ts
import { Paystack } from 'paystack-api'

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!)

export async function initializePayment({
  email,
  amount,
  reference,
  metadata,
}: {
  email: string
  amount: number
  reference: string
  metadata: any
}) {
  try {
    const response = await paystack.transaction.initialize({
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      metadata,
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error }
  }
}
```

### 4.4 File Upload (Property Images)

**Using Vercel Blob:**

```bash
npm install @vercel/blob
```

```typescript
// app/api/properties/[id]/images/route.ts
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  const form = await request.formData()
  const file = form.get('file') as File
  
  const blob = await put(`properties/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })
  
  return Response.json({ url: blob.url })
}
```

### 4.5 Payment Integration (Stripe)

**Stripe Setup:**

```bash
npm install stripe @stripe/stripe-js
```

```typescript
// app/api/payments/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { amount, propertyId } = await request.json()
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',
    metadata: { propertyId },
  })
  
  return Response.json({ clientSecret: paymentIntent.client_secret })
}
```

### 4.6 Advanced Notification Features

#### 4.5.1 Scheduled Notifications (Handled in 4.2.5)

#### 4.5.2 Notification Preferences (Handled in 4.2.7)

### 4.6 Search & Filtering

**Full-text search with PostgreSQL:**

```sql
-- Add search vector
ALTER TABLE properties ADD COLUMN search_vector tsvector;

-- Create trigger to update search vector
CREATE FUNCTION properties_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.occupant, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_search_vector_update
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION properties_search_update();

-- Create index
CREATE INDEX properties_search_idx ON properties USING GIN(search_vector);
```

**API Route for Search:**

```typescript
// app/api/properties/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { query } = request.nextUrl.searchParams
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  }

  const properties = await prisma.property.findMany({
    where: {
      search_vector: {
        search: query,
      },
    },
  })

  return NextResponse.json(properties)
}
```

---

## Phase 5: Scalability & Performance

### 5.1 Caching Strategy

**Redis for caching:**

```bash
npm install ioredis
```

```typescript
// lib/redis.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function getCachedProperties(userId: string) {
  const cached = await redis.get(`properties:${userId}`)
  if (cached) return JSON.parse(cached)
  
  const properties = await prisma.property.findMany({
    where: { userId },
  })
  await redis.setex(`properties:${userId}`, 300, JSON.stringify(properties))
  
  return properties
}

export async function getCachedNotificationCount(userId: string) {
  const cached = await redis.get(`notifications:count:${userId}`)
  if (cached) return parseInt(cached)
  
  const count = await prisma.notification.count({
    where: { property: { userId } }
  })
  
  await redis.setex(`notifications:count:${userId}`, 300, count.toString())
  return count
}
```

### 5.2 Database Optimization

- **Connection Pooling**: Use PgBouncer or built-in pool
- **Indexes**: Add indexes on frequently queried columns
- **Query Optimization**: Use EXPLAIN ANALYZE
- **Read Replicas**: Separate read/write databases

### 5.3 CDN & Image Optimization

- Use Vercel's built-in CDN
- Implement next/image for automatic optimization
- Serve static assets from CDN

### 5.4 Monitoring & Logging

**Sentry for error tracking:**

```bash
npm install @sentry/nextjs
```

**Vercel Analytics:**

```bash
npm install @vercel/analytics
```

```typescript
// lib/analytics.ts
export async function logNotification({
  type,
  channel,
  success,
  propertyId,
  error,
}: {
  type: string
  channel: 'email' | 'sms'
  success: boolean
  propertyId: string
  error?: string
}) {
  // Log to your analytics service
  console.log('[v0] Notification:', { type, channel, success, propertyId, error })
  
  // In production, send to analytics service
  // await analytics.track('notification_sent', { ... })
}
```

---

## Phase 6: Production Deployment

### 6.1 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] CORS policies set
- [ ] Rate limiting enabled
- [ ] Monitoring tools integrated
- [ ] Backup strategy in place
- [ ] Load testing completed

### 6.1 Deployment Checklist

**Before Deployment:**
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up email service (Resend/SendGrid)
- [ ] Configure domain for email sending
- [ ] Test all API routes
- [ ] Test email notifications end-to-end
- [ ] Set up cron jobs for scheduled notifications
- [ ] Configure SMS service (if using)
- [ ] Test dynamic property forms for all types
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup system
- [ ] Set up SSL certificates
- [ ] Configure CDN for assets

### 6.2 Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 6.2 Email Service Production Setup

**Resend Production Checklist:**
1. Verify your domain in Resend dashboard
2. Add DNS records (SPF, DKIM, DMARC)
3. Update `from` address to use verified domain
4. Test email delivery to multiple providers (Gmail, Outlook, etc.)
5. Monitor bounce rates and spam complaints
6. Set up webhook for delivery status updates

**Email Best Practices:**
- Use authenticated sender domains
- Include unsubscribe links for marketing emails
- Monitor email delivery rates
- Keep email templates mobile-responsive
- Use transactional email for notifications
- Implement email queue for high volume

### 6.3 Environment Configuration

**Production `.env`:**

```env
DATABASE_URL=postgresql://prod-url
NEXTAUTH_SECRET=strong-random-secret
NEXTAUTH_URL=https://yourdomain.com
REDIS_URL=redis://prod-redis-url
RESEND_API_KEY=your-resend-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
CRON_SECRET=your-cron-secret
```

### 6.4 Database Migration Strategy

**Prisma Migrate:**

```bash
# Generate migration
npx prisma migrate dev --name feature_name

# Deploy to production
npx prisma migrate deploy
```

### 6.5 Backup & Disaster Recovery

- Automated daily database backups
- Point-in-time recovery enabled
- Backup retention policy (30 days)
- Regular restore testing

### 6.6 Post-Deployment

- Monitor error rates
- Check performance metrics
- Verify all features working
- Set up alerts for critical issues

---

## Cost Estimation

### Minimal Setup (< 1000 users)
- **Hosting**: Vercel Hobby ($0) or Pro ($20/mo)
- **Database**: Neon Free tier or Supabase ($0-$25/mo)
- **Total**: $0-$45/month

### Medium Scale (1000-10000 users)
- **Hosting**: Vercel Pro ($20/mo)
- **Database**: Supabase Pro ($25/mo)
- **Redis**: Upstash ($10/mo)
- **Email**: SendGrid ($15/mo)
- **Total**: $70/month

### Large Scale (10000+ users)
- **Hosting**: Vercel Enterprise (Custom)
- **Database**: AWS RDS ($100+/mo)
- **Redis**: AWS ElastiCache ($50+/mo)
- **CDN**: CloudFront ($50+/mo)
- **Total**: $200+/month

### Email Service Costs

**Resend:**
- Free: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Enterprise: Custom pricing

**SendGrid:**
- Free: 100 emails/day
- Essentials: $19.95/month for 50,000 emails
- Pro: $89.95/month for 100,000 emails

**Twilio SMS:**
- $0.0075 per SMS in Nigeria
- $0.0079 per SMS in US

### Infrastructure Costs (100 properties)

**Vercel:**
- Hobby: Free (sufficient for development)
- Pro: $20/month (recommended for production)
- Enterprise: Custom pricing

**Database:**
- Supabase: Free tier (500MB, suitable for start)
- Neon: $20/month (3GB)
- AWS RDS: ~$25-50/month

**Total Estimated Monthly Cost (100 properties):**
- Vercel Pro: $20
- Database: $20
- Email (Resend Pro): $20
- SMS (optional, 100 messages): $0.75
- **Total: ~$60-80/month**

---

## Testing Strategy

### Unit Tests
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Integration Tests
```bash
npm install -D cypress
```

### E2E Tests
```bash
npx cypress open
```

---

## Conclusion

This upscaling guide provides a comprehensive roadmap for transforming the real estate management system into a production-ready application. The current system already includes:

✅ Dynamic property forms based on type
✅ Email notification infrastructure ready for production
✅ Payment tracking and management
✅ Lease expiration monitoring
✅ Multi-tab dashboard with comprehensive statistics

**Next Steps:**
1. Set up production database (Supabase/Neon recommended)
2. Configure Resend for email delivery
3. Implement authentication with NextAuth.js
4. Deploy to Vercel
5. Set up monitoring and analytics
6. Test all features end-to-end
7. Launch with beta users

For questions or support, consult the Vercel, Next.js, and Resend documentation.

This upscaling guide provides a comprehensive roadmap from a frontend-only prototype to a production-ready application with full notification capabilities. The notification system can be expanded to include:

- **Email delivery** with transactional email services (Resend, SendGrid, AWS SES)
- **SMS notifications** for urgent messages
- **Push notifications** for mobile app integration
- **Scheduled notifications** using cron jobs
- **Bulk messaging** for announcements
- **Notification preferences** for residents
- **Delivery tracking** and analytics

**Key Takeaways:**
- Start with API routes and database integration
- Implement proper authentication early
- Add email notifications with a reliable service
- Use job queues for scheduled and bulk notifications
- Focus on security and performance
- Monitor delivery rates and optimize continuously

For additional help, consult the official documentation:
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Resend Docs](https://resend.com/docs)
- [Vercel Docs](https://vercel.com/docs)
