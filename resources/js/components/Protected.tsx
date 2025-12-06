import { ReactNode } from 'react';
import { useAuthorization } from '@/contexts/AuthorizationContext';

interface ProtectedProps {
    children: ReactNode;

    // Permission-based access
    permission?: string | string[];
    requireAllPermissions?: boolean; // If true, user must have ALL permissions. Default: false (any permission)

    // Role-based access
    role?: string | string[];
    requireAllRoles?: boolean; // If true, user must have ALL roles. Default: false (any role)

    // Feature-based access
    feature?: string | string[];
    requireAllFeatures?: boolean; // If true, tenant must have ALL features. Default: false (any feature)

    // Fallback content when access is denied
    fallback?: ReactNode;
}

/**
 * Protected - Conditionally renders children based on user permissions, roles, and tenant features
 *
 * @example
 * // Render button only if user has permission
 * <Protected permission="sales.create">
 *   <CreateSaleButton />
 * </Protected>
 *
 * @example
 * // Render content only if user has ANY of the specified permissions
 * <Protected permission={['sales.view', 'sales.create']}>
 *   <SalesSection />
 * </Protected>
 *
 * @example
 * // Render content only if user has ALL specified permissions
 * <Protected permission={['sales.view', 'sales.edit']} requireAllPermissions>
 *   <EditSaleForm />
 * </Protected>
 *
 * @example
 * // Render content only if user has role
 * <Protected role="owner">
 *   <OwnerDashboard />
 * </Protected>
 *
 * @example
 * // Render content only if tenant has feature
 * <Protected feature="advanced_reporting">
 *   <AdvancedReportsModule />
 * </Protected>
 *
 * @example
 * // Combine permission and feature checks
 * <Protected permission="sales.view_profits" feature="advanced_reporting">
 *   <ProfitAnalysis />
 * </Protected>
 *
 * @example
 * // Show fallback content when access is denied
 * <Protected permission="sales.view" fallback={<UpgradePrompt />}>
 *   <SalesData />
 * </Protected>
 */
export default function Protected({
    children,
    permission,
    requireAllPermissions = false,
    role,
    requireAllRoles = false,
    feature,
    requireAllFeatures = false,
    fallback = null,
}: ProtectedProps): JSX.Element | null {
    const authorization = useAuthorization();

    // Check permission requirements
    if (permission) {
        const permissions = Array.isArray(permission) ? permission : [permission];
        const hasAccess = requireAllPermissions
            ? authorization.hasAllPermissions(permissions)
            : authorization.hasAnyPermission(permissions);

        if (!hasAccess) {
            return <>{fallback}</>;
        }
    }

    // Check role requirements
    if (role) {
        const roles = Array.isArray(role) ? role : [role];
        const hasAccess = requireAllRoles
            ? authorization.hasAllRoles(roles)
            : authorization.hasAnyRole(roles);

        if (!hasAccess) {
            return <>{fallback}</>;
        }
    }

    // Check feature requirements
    if (feature) {
        const features = Array.isArray(feature) ? feature : [feature];
        const hasAccess = requireAllFeatures
            ? authorization.hasAnyFeature(features) && features.every(f => authorization.hasFeature(f))
            : authorization.hasAnyFeature(features);

        if (!hasAccess) {
            return <>{fallback}</>;
        }
    }

    // All checks passed, render children
    return <>{children}</>;
}