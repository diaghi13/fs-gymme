import { useMemo } from 'react';
import { MenuItem } from '@/layouts';
import { useAuthorization } from '@/contexts/AuthorizationContext';

/**
 * useFilteredMenu - Filters menu items based on user permissions, roles, and tenant features
 *
 * @param menuItems - Raw menu structure with permission/feature/role requirements
 * @returns Filtered menu items that the user can access
 *
 * @example
 * const filteredMenu = useFilteredMenu(menuList(tenant));
 */
export function useFilteredMenu(menuItems: MenuItem[]): MenuItem[] {
    const authorization = useAuthorization();

    return useMemo(() => {
        const filterMenuItem = (item: MenuItem): MenuItem | null => {
            // Check permission requirement
            if (item.permission) {
                const permissions = Array.isArray(item.permission) ? item.permission : [item.permission];
                if (!authorization.hasAnyPermission(permissions)) {
                    return null;
                }
            }

            // Check feature requirement
            if (item.feature) {
                const features = Array.isArray(item.feature) ? item.feature : [item.feature];
                if (!authorization.hasAnyFeature(features)) {
                    return null;
                }
            }

            // Check role requirement
            if (item.role) {
                const roles = Array.isArray(item.role) ? item.role : [item.role];
                if (!authorization.hasAnyRole(roles)) {
                    return null;
                }
            }

            // Filter sub-items if present
            if (item.items) {
                const filteredSubItems = item.items
                    .map(subItem => filterMenuItem(subItem as MenuItem))
                    .filter((subItem): subItem is MenuItem => subItem !== null);

                // If parent has sub-items but all are filtered out, hide the parent
                if (filteredSubItems.length === 0) {
                    return null;
                }

                return {
                    ...item,
                    items: filteredSubItems,
                };
            }

            return item;
        };

        return menuItems
            .map(item => filterMenuItem(item))
            .filter((item): item is MenuItem => item !== null);
    }, [menuItems, authorization]);
}