import { useMemo } from 'react';

type Permission = { name: string };
type Role = { name: string; permissions?: Permission[] };
type User = {
  roles?: Role[];
  permissions?: Permission[];
};

export function useRolesPermissions(user?: User) {
  // Set di ruoli dell'utente
  const userRoles = useMemo(
    () => new Set(user?.roles?.map(r => r.name) ?? []),
    [user]
  );

  // Set di permessi diretti dell'utente
  const userPermissions = useMemo(
    () => new Set(user?.permissions?.map(p => p.name) ?? []),
    [user]
  );

  // Set di permessi derivati dai ruoli dell'utente
  const rolePermissions = useMemo(() => {
    if (!user?.roles) return new Set<string>();

    return new Set(
      user.roles.flatMap(r => r.permissions?.map(p => p.name) ?? [])
    );
  }, [user]);

  // Verifica se l'utente ha un ruolo specifico
  function role(roleName: string): boolean {
    return userRoles.has(roleName);
  }

  // Verifica se l'utente ha un permesso specifico
  function can(permissionName: string): boolean {
    return userPermissions.has(permissionName) || rolePermissions.has(permissionName);
  }

  return { role, can };
}
