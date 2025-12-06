import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';


interface AuthUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    roles: string[];
    permissions: string[];
}

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
    isDemo: boolean;
}

const AuthorizationContext = createContext<Authorization | undefined>(undefined);

interface AuthorizationProviderProps {
    children: ReactNode;
}

/**
 * AuthorizationProvider - Provides authorization data throughout the app
 *
 * Wraps the entire application to provide permission, role, and feature checks
 */
export function AuthorizationProvider({ children }: AuthorizationProviderProps) {
    const { auth, tenant } = usePage<PageProps>().props;

    const authorization = useMemo((): Authorization => {
        const user = auth?.user;
        const userPermissions = user?.permissions || [];
        const userRoles = user?.roles || [];
        const activeFeatures = tenant?.active_features || [];
        const isDemo = tenant?.is_demo || false;

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
            isDemo,
        };
    }, [auth, tenant]);

    return (
        <AuthorizationContext.Provider value={authorization}>
            {children}
        </AuthorizationContext.Provider>
    );
}

/**
 * useAuthorization - Hook to access authorization data
 *
 * @example
 * const { can, hasRole, hasFeature, isOwner } = useAuthorization();
 *
 * if (can('sales.create')) {
 *   <CreateSaleButton />
 * }
 *
 * if (hasFeature('advanced_reporting')) {
 *   <AdvancedReportsModule />
 * }
 */
export function useAuthorization(): Authorization {
    const context = useContext(AuthorizationContext);

    if (context === undefined) {
        throw new Error('useAuthorization must be used within an AuthorizationProvider');
    }

    return context;
}
