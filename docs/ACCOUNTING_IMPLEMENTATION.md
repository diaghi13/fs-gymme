# Accounting Section - Sprint 1 Implementation

## Overview
This document details the complete implementation of Sprint 1 for the Accounting section, which provides essential financial tracking and receivables management for gym operations.

## Completed Features

### 1. Prima Nota (Journal Entries)
**Route**: `/accounting/journal-entries`
**Permission**: `accounting.view_journal`

A chronological view of all financial movements, displaying both sales and received payments grouped by day.

**Features**:
- Date range filtering (default: last 30 days)
- Daily grouping with subtotals
- Overall period total
- Distinguishes between sales (blue) and payments (green)
- Click on entry to view sale details
- Financial resource/payment method display

**Key Files**:
- Controller: `app/Http/Controllers/Application/AccountingController.php::journalEntries()`
- Frontend: `resources/js/pages/accounting/journal-entries.tsx`

### 2. Pagamenti In Sospeso (Pending Payments)
**Route**: `/accounting/pending-payments`
**Permission**: `accounting.view_receivables`

Tracks all unpaid receivables with focus on overdue and upcoming payments.

**Features**:
- Three tabs: Overdue / Upcoming (7 days) / All
- Statistics dashboard:
  - Total receivables amount
  - Number of overdue payments
  - Number of customers with overdue payments
  - Average days overdue
- DataGrid with sorting and pagination
- Color-coded overdue indicators
- Click on row to view sale details

**Key Files**:
- Controller: `app/Http/Controllers/Application/AccountingController.php::pendingPayments()`
- Frontend: `resources/js/pages/accounting/pending-payments.tsx`

## Permissions System

Four new permissions created under the `accounting.*` namespace:

| Permission | Description | Assigned Roles |
|------------|-------------|----------------|
| `accounting.view_journal` | View Prima Nota | owner, manager, back_office |
| `accounting.view_receivables` | View pending payments | owner, manager, back_office |
| `accounting.manage_payments` | Mark payments as paid | owner, manager |
| `accounting.export` | Export accounting data | owner, manager, back_office |

**Rationale**: Separate from `sales.*` permissions to allow different access patterns. Back office staff can view financial data but cannot manage payments directly.

## Database Changes

### New Migration
`database/migrations/2025_12_06_164613_add_accounting_permissions_to_permissions_table.php`

Creates the 4 accounting permissions in the tenant database.

### Model Enhancement
Added `sale()` relationship to `Payment` model for easier data loading in accounting queries.

```php
public function sale()
{
    return $this->belongsTo(Sale::class);
}
```

## Test Data

### AccountingTestDataSeeder
Located at: `database/seeders/Tenant/AccountingTestDataSeeder.php`

**What it creates**:
- 10 test customers
- 50 sales spread over last 60 days
- Random payment installments (1-3 per sale)
- ~15 overdue payments (past due date, unpaid)
- ~10 upcoming payments (due in next 7 days)
- Mix of paid and unpaid installments

**Usage**:
```bash
php artisan tenants:seed --tenants=<tenant-id> --class=Database\\Seeders\\Tenant\\AccountingTestDataSeeder
```

## Frontend Components

### Technologies
- **React 19** with TypeScript
- **Material-UI (MUI)** for UI components
- **MUI DataGrid** for pending payments table
- **date-fns** for date manipulation and formatting
- **Inertia.js** for server-client communication

### Key Patterns Used
- Server-side filtering with Inertia preserveState/preserveScroll
- FormattedCurrency component for monetary values
- Italian locale (it) for date formatting
- Tab-based navigation with URL state persistence

## Authorization

All routes are protected with Laravel's `authorize()` method:

```php
$this->authorize('accounting.view_journal');
$this->authorize('accounting.view_receivables');
```

Frontend menu items use the Permission enum:

```typescript
permission: [Permission.ACCOUNTING_VIEW_JOURNAL, Permission.ACCOUNTING_VIEW_RECEIVABLES]
```

## API Specifications

### Journal Entries Endpoint
**URL**: `GET /accounting/journal-entries`
**Query Parameters**:
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `financial_resource_id` (optional): Filter by financial resource

**Response**:
```typescript
{
  entriesByDate: Record<string, {
    entries: Array<{
      id: string | number,
      type: 'sale' | 'payment',
      time: string,
      customer_name: string,
      customer_id: number,
      amount: number,
      financial_resource: string,
      sale_number: string,
      payment_id?: number
    }>,
    daily_total: number
  }>,
  periodTotal: number,
  filters: { date_from?: string, date_to?: string, financial_resource_id?: number }
}
```

### Pending Payments Endpoint
**URL**: `GET /accounting/pending-payments`
**Query Parameters**:
- `status` (optional): 'overdue' | 'upcoming' | 'all' (default: 'overdue')
- `customer_id` (optional): Filter by customer

**Response**:
```typescript
{
  payments: Array<{
    id: number,
    sale_id: number,
    sale_number: string,
    customer: {
      id: number,
      name: string,
      email: string,
      phone: string
    },
    amount: number,
    due_date: string,
    days_overdue: number,
    status: string,
    payment_method: string
  }>,
  statistics: {
    total_receivables: number,
    overdue_count: number,
    customers_with_overdue: number,
    average_days_overdue: number
  },
  filters: { status?: string, customer_id?: number }
}
```

## Implementation Notes

### Currency Handling
- Backend stores amounts in **cents** (integers)
- Frontend receives cents and displays as **euros** (divided by 100)
- `FormattedCurrency` component handles regional formatting

### Multi-tenancy
- All queries automatically scoped to current tenant
- Permissions stored per-tenant in tenant database
- Seeder runs in tenant context

### Performance Considerations
- Eager loading of relationships: `with(['customer', 'financialResource', 'payments'])`
- Limited date ranges prevent large dataset issues
- DataGrid pagination on frontend

## Known Limitations (Sprint 1)

The following features are **disabled** and planned for Sprint 2:
1. **Export functionality**: "Esporta" buttons are disabled
2. **Mark as paid**: "Pagato" button in pending payments is disabled
3. **Email reminders**: Not yet implemented

## Testing Completed

1. ✅ Backend permissions created and assigned to roles
2. ✅ Routes registered and authorized
3. ✅ Controller methods return correct data structure
4. ✅ Frontend pages render without errors
5. ✅ Frontend build successful (`npm run build`)
6. ✅ Test data seeder generates realistic data

## Files Modified/Created

### Backend
- `app/Http/Controllers/Application/AccountingController.php` (new)
- `app/Models/Sale/Payment.php` (added relationship)
- `routes/tenant/web/routes.php` (added accounting routes)
- `database/migrations/2025_12_06_164613_add_accounting_permissions_to_permissions_table.php` (new)
- `database/seeders/Tenant/TenantRolePermissionSeeder.php` (modified)
- `database/seeders/Tenant/AccountingTestDataSeeder.php` (new)

### Frontend
- `resources/js/pages/accounting/journal-entries.tsx` (new)
- `resources/js/pages/accounting/pending-payments.tsx` (new)
- `resources/js/types/permissions.ts` (added accounting permissions)
- `resources/js/layouts/index.ts` (updated menu permissions)

### Documentation
- `docs/ACCOUNTING_ROADMAP.md` (new)
- `docs/ACCOUNTING_IMPLEMENTATION.md` (this file)

## Next Steps (Sprint 2)

See `ACCOUNTING_ROADMAP.md` for detailed Sprint 2 planning:
1. Export to Excel/PDF functionality
2. "Mark as paid" action with optimistic UI updates
3. Email reminder system for overdue payments
4. Bulk payment management

## Usage Instructions

### For Developers
1. Run migrations on tenant: `php artisan tenants:migrate`
2. Seed test data: `php artisan tenants:seed --tenants=<id> --class=Database\\Seeders\\Tenant\\AccountingTestDataSeeder`
3. Access pages at:
   - Prima Nota: `/accounting/journal-entries`
   - Pagamenti In Sospeso: `/accounting/pending-payments`

### For Users
1. Navigate to **Contabilità** in the main menu
2. Choose **Prima Nota** to view chronological financial movements
3. Choose **Pagamenti In Sospeso** to manage receivables
4. Use filters and tabs to find specific data

## Support

For questions or issues related to the accounting implementation, refer to:
- This implementation document
- `ACCOUNTING_ROADMAP.md` for future enhancements
- `CLAUDE.md` for general Laravel + Inertia patterns
