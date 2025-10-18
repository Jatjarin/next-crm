# EZ-ERP

A modern, comprehensive ERP and CRM system built for SAK Woodworks. This application manages customers, sales, inventory, employees, assets, and international trade operations with support for Thai, English, and Russian languages.

**Important**: This software is proprietary and developed for internal use at SAK Woodworks only. Do not modify, distribute, or use outside of SAK Woodworks without authorization.

## Features

### Core Modules

- **Customer Relationship Management (CRM)**
  - Customer database with contact management
  - Responsible persons tracking
  - Customer lifetime value analytics

- **Sales & Invoicing**
  - Sales invoices with payment tracking
  - Quotations and estimates
  - Cash receipts management
  - Outstanding invoices reporting

- **Inventory Management**
  - Product catalog with barcode/QR code support
  - Multi-warehouse management
  - Stock adjustments and transfers
  - Stock movement tracking
  - Inventory valuation reports
  - Stock turnover analytics

- **Purchasing**
  - Purchase orders
  - Supplier management
  - Cost tracking

- **International Trade**
  - **Import Shipments**: Pine wood tracking from Russia (CIF)
    - Container shipping and customs clearance
    - Landed cost calculation
    - Warehouse receipt integration
  - **Export Shipments**: Teak wood exports (FOB)
    - Export permits and documentation
    - Packing and shipping coordination
    - Customer invoice integration

- **Asset Management**
  - Office asset tracking with QR codes
  - Public asset pages (no login required)
  - Asset assignment and location tracking

- **Human Resources**
  - Employee database
  - Department management

- **Advanced Analytics**
  - Sales trends (daily/weekly/monthly/yearly)
  - Customer lifetime value (LTV)
  - Product performance metrics
  - Profit & Loss statements
  - Accounts receivable aging
  - Shipment analytics
  - Customs clearance statistics

- **Utilities**
  - QR code and barcode scanner
  - Multi-language support (Thai, English, Russian)
  - PDF generation for documents
  - Excel export functionality

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database & Authentication**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **Internationalization**: next-intl (cookie-based)
- **Testing**: Vitest + React Testing Library
- **PDF Generation**: jsPDF, pdf-lib
- **QR/Barcode**: qrcode.react, react-barcode, html5-qrcode
- **Spreadsheets**: exceljs

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jatjarin/next-crm.git
cd next-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations:

Execute the SQL files in your Supabase SQL editor:
- `database-import-export-module.sql` - Import/export shipments schema
- `database-advanced-analytics.sql` - Analytics RPC functions

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Production build
npm start                # Run production server
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
```

### Linting
```bash
npm run lint             # Run ESLint
```

### Running Specific Tests
```bash
npm test -- src/app/products/actions.test.ts
npm test -- --grep "invoice"
npm run test:watch -- src/app/products/actions.test.ts
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── customers/         # Customer management
│   ├── employees/         # HR management
│   ├── products/          # Product catalog
│   ├── warehouses/        # Warehouse management
│   ├── invoices/          # Sales invoices
│   ├── quotations/        # Quotes/estimates
│   ├── cash-bills/        # Cash receipts
│   ├── purchase-orders/   # Purchase orders
│   ├── suppliers/         # Supplier management
│   ├── stock-adjustments/ # Inventory adjustments
│   ├── assets/            # Asset tracking
│   ├── import-shipments/  # Import tracking
│   ├── export-shipments/  # Export tracking
│   ├── reports/           # Business reports
│   │   └── analytics/     # Advanced analytics
│   ├── scanner/           # QR/barcode scanner
│   └── public/            # Public pages (no auth)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── barcode/           # Barcode/QR components
│   └── Sidebar.tsx        # Navigation
├── lib/
│   ├── supabase/          # Supabase clients
│   └── utils.ts           # Utilities
└── test/
    └── setup.ts           # Vitest configuration

messages/
├── th.json                # Thai translations
├── en.json                # English translations
└── ru.json                # Russian translations
```

## Key Architectural Patterns

### Server Actions
All data mutations use Next.js Server Actions:

```typescript
"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createEntity(formData: FormData) {
  const supabase = await createClient()
  // ... database operations
  revalidatePath("/module")
  redirect("/module")
}
```

### Client Components
Interactive components use the `"use client"` directive:

```typescript
"use client"
import { useTranslations } from "next-intl"

export default function DeleteButton({ id }: { id: number }) {
  const t = useTranslations("ModuleName")
  // ... component logic
}
```

### Internationalization
Server components:
```typescript
import { getTranslations } from "next-intl/server"
const t = await getTranslations("ModuleName")
```

Client components:
```typescript
import { useTranslations } from "next-intl"
const t = useTranslations("ModuleName")
```

## Database Schema

Key features:
- Invoice numbering: `INVNo{YY}{NNN}{INITIALS}` (e.g., `INVNo25001PW`)
- Shipment numbering: `IMP{YY}{NNNN}` (imports), `EXP{YY}{NNNN}` (exports)
- Foreign key relationships via Supabase
- JSON columns for complex data (e.g., invoice items)
- RPC functions for analytics

## Docker Deployment

Build and run with Docker:

```bash
docker build -t next-crm .
docker run -p 3000:3000 next-crm
```

Ensure environment variables are set for the container.

## Authentication

- All routes protected except `/login` and `/public/*`
- Session refresh on every request
- Middleware-based route protection
- Public asset pages accessible without authentication

## Testing

Tests use Vitest with mocked Supabase clients. Each module has corresponding `actions.test.ts` files.

Example test structure:
```typescript
import { describe, it, expect, vi } from "vitest"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      // ... other mocked methods
    })),
  })),
}))
```

## Contributing

This is a proprietary internal project. Only authorized SAK Woodworks personnel should contribute.

## Credits

**Developed by**: BK-SAK Woodworks  
**Copyright**: © 2025 BK-SAK Woodworks. All rights reserved.

## License

Proprietary - All rights reserved by BK-SAK Woodworks. Unauthorized use, modification, or distribution is prohibited.

## Support

For internal support, contact the development team at BK-SAK Woodworks.

## Documentation

For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md).
