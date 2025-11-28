import { useMemo } from 'react';

/**
 * Role labels and descriptions in Italian
 */
const roleLabels: Record<string, { label: string; description: string }> = {
  owner: {
    label: 'Proprietario',
    description: 'Accesso completo a tutte le funzionalità',
  },
  manager: {
    label: 'Manager',
    description: 'Gestione completa eccetto impostazioni fiscali',
  },
  back_office: {
    label: 'Back Office',
    description: 'Gestione amministrativa e contabile',
  },
  staff: {
    label: 'Staff',
    description: 'Accesso base senza permessi predefiniti',
  },
  trainer: {
    label: 'Trainer',
    description: 'Gestione clienti assegnati e allenamenti',
  },
  receptionist: {
    label: 'Receptionist',
    description: 'Check-in e operazioni base',
  },
  customer: {
    label: 'Cliente',
    description: 'Accesso limitato per clienti finali',
  },
  'super-admin': {
    label: 'Super Admin',
    description: 'Amministratore di sistema',
  },
  admin: {
    label: 'Amministratore',
    description: 'Amministratore del tenant',
  },
  instructor: {
    label: 'Istruttore',
    description: 'Gestione corsi e lezioni',
  },
};

/**
 * Permission category labels in Italian
 */
const categoryLabels: Record<string, string> = {
  sales: 'Vendite',
  customers: 'Clienti',
  products: 'Prodotti',
  pricelists: 'Listini Prezzi',
  reports: 'Report',
  settings: 'Impostazioni',
  users: 'Utenti',
  training: 'Allenamenti',
  checkin: 'Check-in',
};

/**
 * Individual permission labels in Italian
 * Format: 'category.action' => 'Translated label'
 */
const permissionLabels: Record<string, string> = {
  // Sales
  'sales.view': 'Visualizza vendite',
  'sales.create': 'Crea vendite',
  'sales.edit': 'Modifica vendite',
  'sales.delete': 'Elimina vendite',
  'sales.view_profits': 'Visualizza profitti',

  // Customers
  'customers.view_all': 'Visualizza tutti i clienti',
  'customers.view_assigned': 'Visualizza clienti assegnati',
  'customers.create': 'Crea clienti',
  'customers.edit': 'Modifica clienti',
  'customers.delete': 'Elimina clienti',
  'customers.view_financial': 'Visualizza dati finanziari clienti',

  // Products
  'products.view': 'Visualizza prodotti',
  'products.manage': 'Gestisci prodotti',

  // Price Lists
  'pricelists.view': 'Visualizza listini',
  'pricelists.manage': 'Gestisci listini',

  // Reports
  'reports.view_financial': 'Visualizza report finanziari',
  'reports.view_operational': 'Visualizza report operativi',
  'reports.export': 'Esporta report',

  // Settings
  'settings.view': 'Visualizza impostazioni',
  'settings.manage_general': 'Gestisci impostazioni generali',
  'settings.manage_billing': 'Gestisci impostazioni fatturazione',
  'settings.manage_fiscal': 'Gestisci impostazioni fiscali',

  // Users
  'users.view': 'Visualizza utenti',
  'users.invite': 'Invita utenti',
  'users.manage': 'Gestisci utenti',
  'users.delete': 'Elimina utenti',

  // Training
  'training.view_all': 'Visualizza tutti gli allenamenti',
  'training.view_assigned': 'Visualizza allenamenti assegnati',
  'training.manage': 'Gestisci allenamenti',

  // Check-in
  'checkin.perform': 'Effettua check-in',
};

interface UseRolePermissionLabelsReturn {
  /**
   * Get the translated label for a role
   */
  getRoleLabel: (roleName: string) => string;

  /**
   * Get the translated description for a role
   */
  getRoleDescription: (roleName: string) => string;

  /**
   * Get both label and description for a role
   */
  getRole: (roleName: string) => { label: string; description: string };

  /**
   * Get the translated label for a permission category
   */
  getCategoryLabel: (category: string) => string;

  /**
   * Get the translated label for a specific permission
   */
  getPermissionLabel: (permissionName: string) => string;

  /**
   * Get the short action label from a permission (e.g., 'view' from 'sales.view')
   */
  getPermissionActionLabel: (permissionName: string) => string;

  /**
   * Format a permission for display: returns { category, action, fullLabel }
   */
  formatPermission: (permissionName: string) => {
    category: string;
    action: string;
    categoryLabel: string;
    actionLabel: string;
    fullLabel: string;
  };

  /**
   * All category labels
   */
  categoryLabels: Record<string, string>;

  /**
   * All role labels
   */
  roleLabels: Record<string, { label: string; description: string }>;
}

/**
 * Hook for translating roles and permissions to human-readable Italian labels
 *
 * @example
 * const { getRoleLabel, getPermissionLabel } = useRolePermissionLabels();
 *
 * getRoleLabel('owner') // => 'Proprietario'
 * getPermissionLabel('sales.view') // => 'Visualizza vendite'
 */
export function useRolePermissionLabels(): UseRolePermissionLabelsReturn {
  const getRoleLabel = useMemo(
    () => (roleName: string): string => {
      return roleLabels[roleName]?.label || formatRoleName(roleName);
    },
    []
  );

  const getRoleDescription = useMemo(
    () => (roleName: string): string => {
      return roleLabels[roleName]?.description || '';
    },
    []
  );

  const getRole = useMemo(
    () =>
      (roleName: string): { label: string; description: string } => {
        return (
          roleLabels[roleName] || {
            label: formatRoleName(roleName),
            description: '',
          }
        );
      },
    []
  );

  const getCategoryLabel = useMemo(
    () => (category: string): string => {
      return categoryLabels[category] || capitalizeFirst(category);
    },
    []
  );

  const getPermissionLabel = useMemo(
    () => (permissionName: string): string => {
      return permissionLabels[permissionName] || formatPermissionName(permissionName);
    },
    []
  );

  const getPermissionActionLabel = useMemo(
    () => (permissionName: string): string => {
      const [, action] = permissionName.split('.');
      if (!action) return permissionName;

      // Check if we have a full translation, extract just the action part
      const fullLabel = permissionLabels[permissionName];
      if (fullLabel) {
        // Return the action part of the translation (after the verb)
        return fullLabel;
      }

      return formatActionName(action);
    },
    []
  );

  const formatPermission = useMemo(
    () =>
      (
        permissionName: string
      ): {
        category: string;
        action: string;
        categoryLabel: string;
        actionLabel: string;
        fullLabel: string;
      } => {
        const [category, action] = permissionName.split('.');
        return {
          category: category || '',
          action: action || '',
          categoryLabel: getCategoryLabel(category || ''),
          actionLabel: formatActionName(action || ''),
          fullLabel: getPermissionLabel(permissionName),
        };
      },
    [getCategoryLabel, getPermissionLabel]
  );

  return {
    getRoleLabel,
    getRoleDescription,
    getRole,
    getCategoryLabel,
    getPermissionLabel,
    getPermissionActionLabel,
    formatPermission,
    categoryLabels,
    roleLabels,
  };
}

// Helper functions
function formatRoleName(roleName: string): string {
  return roleName
    .split(/[_-]/)
    .map(capitalizeFirst)
    .join(' ');
}

function formatPermissionName(permissionName: string): string {
  const [category, action] = permissionName.split('.');
  if (!action) return capitalizeFirst(permissionName);

  const categoryLabel = categoryLabels[category] || capitalizeFirst(category);
  const actionLabel = formatActionName(action);

  return `${categoryLabel} - ${actionLabel}`;
}

function formatActionName(action: string): string {
  const actionTranslations: Record<string, string> = {
    view: 'Visualizza',
    view_all: 'Visualizza tutto',
    view_assigned: 'Visualizza assegnati',
    view_financial: 'Dati finanziari',
    view_profits: 'Visualizza profitti',
    create: 'Crea',
    edit: 'Modifica',
    delete: 'Elimina',
    manage: 'Gestisci',
    manage_general: 'Generali',
    manage_billing: 'Fatturazione',
    manage_fiscal: 'Fiscali',
    invite: 'Invita',
    export: 'Esporta',
    perform: 'Esegui',
  };

  return actionTranslations[action] || capitalizeFirst(action.replace(/_/g, ' '));
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default useRolePermissionLabels;
