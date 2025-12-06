/**
 * Application Roles
 * These roles are defined in the tenant database
 */
export enum Role {
    OWNER = 'owner',
    MANAGER = 'manager',
    BACK_OFFICE = 'back_office',
    STAFF = 'staff',
    TRAINER = 'trainer',
    RECEPTIONIST = 'receptionist',
    CUSTOMER = 'customer',
}

/**
 * Application Permissions
 * These permissions are defined in the tenant database
 */
export enum Permission {
    // Check-in permissions
    CHECKIN_PERFORM = 'checkin.perform',

    // Customer permissions
    CUSTOMERS_VIEW_ALL = 'customers.view_all',
    CUSTOMERS_VIEW_ASSIGNED = 'customers.view_assigned',
    CUSTOMERS_CREATE = 'customers.create',
    CUSTOMERS_EDIT = 'customers.edit',
    CUSTOMERS_DELETE = 'customers.delete',
    CUSTOMERS_VIEW_FINANCIAL = 'customers.view_financial',

    // Price list permissions
    PRICELISTS_VIEW = 'pricelists.view',
    PRICELISTS_MANAGE = 'pricelists.manage',

    // Product permissions
    PRODUCTS_VIEW = 'products.view',
    PRODUCTS_MANAGE = 'products.manage',

    // Report permissions
    REPORTS_VIEW_FINANCIAL = 'reports.view_financial',
    REPORTS_VIEW_OPERATIONAL = 'reports.view_operational',
    REPORTS_EXPORT = 'reports.export',

    // Sales permissions
    SALES_VIEW = 'sales.view',
    SALES_CREATE = 'sales.create',
    SALES_EDIT = 'sales.edit',
    SALES_DELETE = 'sales.delete',
    SALES_VIEW_PROFITS = 'sales.view_profits',

    // Settings permissions
    SETTINGS_VIEW = 'settings.view',
    SETTINGS_MANAGE_GENERAL = 'settings.manage_general',
    SETTINGS_MANAGE_BILLING = 'settings.manage_billing',
    SETTINGS_MANAGE_FISCAL = 'settings.manage_fiscal',

    // Training permissions
    TRAINING_VIEW_ALL = 'training.view_all',
    TRAINING_VIEW_ASSIGNED = 'training.view_assigned',
    TRAINING_MANAGE = 'training.manage',

    // User permissions
    USERS_VIEW = 'users.view',
    USERS_INVITE = 'users.invite',
    USERS_MANAGE = 'users.manage',
    USERS_DELETE = 'users.delete',

    // Accounting permissions
    ACCOUNTING_VIEW_JOURNAL = 'accounting.view_journal',
    ACCOUNTING_VIEW_RECEIVABLES = 'accounting.view_receivables',
    ACCOUNTING_MANAGE_PAYMENTS = 'accounting.manage_payments',
    ACCOUNTING_EXPORT = 'accounting.export',
}

/**
 * Helper type to get all permission values
 */
export type PermissionValue = `${Permission}`;

/**
 * Helper type to get all role values
 */
export type RoleValue = `${Role}`;