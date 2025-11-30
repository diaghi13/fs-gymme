import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { PageProps } from '@/types';

interface AuthUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    roles: string[];
    permissions: string[];
}

// interface TenantData {
//     subscription_plan?: {
//         name: string;
//         features: string[];
//     };
//     active_features: string[];
// }

// interface PageProps {
//     auth: {
//         user: AuthUser;
//     };
//     tenant: TenantData;
// }

export interface Authorization {
    // Permission checks
    can: (permission: string) => boolean;
    cannot: (permission: string) => boolean;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;

    // Role checks
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    hasAllRoles: (roles: string[]) => boolean;

    // Subscription feature checks
    hasFeature: (feature: string) => boolean;
    hasAnyFeature: (features: string[]) => boolean;
    canAccessFeature: (feature: string) => boolean;

    // Helper shortcuts
    isOwner: boolean;
    isManager: boolean;
    isBackOffice: boolean;
    isStaff: boolean;
    isTrainer: boolean;
    isReceptionist: boolean;
    isCustomer: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewFinancialData: boolean;

    // Raw data
    user: AuthUser;
    userPermissions: string[];
    userRoles: string[];
    activeFeatures: string[];
}

/**
 * Unified authorization hook for permissions, roles, and subscription features
 *
 * @example
 * const { can, hasRole, hasFeature, isOwner } = useAuthorization();
 *
 * // Check permission
 * if (can('sales.create')) {
 *   <CreateSaleButton />
 * }
 *
 * // Check role
 * if (hasRole('trainer')) {
 *   <TrainerDashboard />
 * }
 *
 * // Check subscription feature
 * if (hasFeature('advanced_reports')) {
 *   <AdvancedReportsModule />
 * } else {
 *   <UpgradeBanner />
 * }
 *
 * // Combined check
 * if (can('sales.view_profits') && hasFeature('financial_analytics')) {
 *   <ProfitMarginDashboard />
 * }
 */
export function useAuthorization(): Authorization {
    const { auth, tenant } = usePage<PageProps>().props;
  console.log('useAuthorization auth:', auth);

    return useMemo(() => {
        const user = auth?.user;
        const userPermissions = user?.permissions || [];
        const userRoles = user?.roles || [];
        const activeFeatures = tenant?.active_features || [];

        // Permission checks
        const hasPermission = (permission: string): boolean => {
            return userPermissions.includes(permission);
        };

        const can = hasPermission;

        const cannot = (permission: string): boolean => {
            return !hasPermission(permission);
        };

        const hasAnyPermission = (permissions: string[]): boolean => {
            return permissions.some(permission => hasPermission(permission));
        };

        const hasAllPermissions = (permissions: string[]): boolean => {
            return permissions.every(permission => hasPermission(permission));
        };

        // Role checks
        const hasRole = (role: string): boolean => {
            return userRoles.includes(role);
        };

        const hasAnyRole = (roles: string[]): boolean => {
            return roles.some(role => hasRole(role));
        };

        const hasAllRoles = (roles: string[]): boolean => {
            return roles.every(role => hasRole(role));
        };

        // Subscription feature checks
        const hasFeature = (feature: string): boolean => {
            return activeFeatures.includes(feature);
        };

        const hasAnyFeature = (features: string[]): boolean => {
            return features.some(feature => hasFeature(feature));
        };

        const canAccessFeature = hasFeature;

        // Helper shortcuts for roles
        const isOwner = hasRole('owner');
        const isManager = hasRole('manager');
        const isBackOffice = hasRole('back_office');
        const isStaff = hasRole('staff');
        const isTrainer = hasRole('trainer');
        const isReceptionist = hasRole('receptionist');
        const isCustomer = hasRole('customer');

        // Helper shortcuts for common permissions
        const canManageUsers = hasPermission('users.manage') || isOwner || isManager;
        const canManageSettings = hasPermission('settings.manage_general') || isOwner || isManager;
        const canViewFinancialData = hasPermission('customers.view_financial') ||
                                      hasPermission('sales.view_profits') ||
                                      isOwner ||
                                      isManager ||
                                      isBackOffice;

        return {
            // Permission checks
            can,
            cannot,
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,

            // Role checks
            hasRole,
            hasAnyRole,
            hasAllRoles,

            // Feature checks
            hasFeature,
            hasAnyFeature,
            canAccessFeature,

            // Helper shortcuts
            isOwner,
            isManager,
            isBackOffice,
            isStaff,
            isTrainer,
            isReceptionist,
            isCustomer,
            canManageUsers,
            canManageSettings,
            canViewFinancialData,

            // Raw data
            user: user!,
            userPermissions,
            userRoles,
            activeFeatures,
        };
    }, [auth, tenant]);
}
