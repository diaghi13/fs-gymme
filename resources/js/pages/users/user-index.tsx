import * as React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridInitialState,
  useGridApiRef,
  GridRowParams,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  MenuItem,
  Typography,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as RoleIcon,
} from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import RoleBadge from '@/components/users/RoleBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRolePermissionLabels } from '@/hooks/useRolePermissionLabels';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: Array<{ id: number; name: string }>;
  is_active: boolean;
  created_at: string;
}

interface UserIndexProps extends PageProps {
  users: User[];
}

const UserIndex: React.FC<UserIndexProps> = ({ auth, users }) => {
  const page = usePage<PageProps>().props;
  const apiRef = useGridApiRef();
  const authorization = useAuthorization();
  const { getRoleLabel } = useRolePermissionLabels();

  const [initialState, setInitialState] = React.useState<GridInitialState>();
  const [filterRole, setFilterRole] = React.useState<string>('all');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Filter users based on role, status, and search query
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // Role filter
      if (filterRole !== 'all') {
        const hasRole = user.roles.some((role) => role.name === filterRole);
        if (!hasRole) return false;
      }

      // Status filter
      if (filterStatus !== 'all') {
        const isActive = filterStatus === 'active';
        if (user.is_active !== isActive) return false;
      }

      // Search query (name or email)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const email = user.email.toLowerCase();
        if (!fullName.includes(query) && !email.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [users, filterRole, filterStatus, searchQuery]);

  const columns: GridColDef<User>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'full_name',
      headerName: 'Nome completo',
      width: 200,
      valueGetter: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },
    {
      field: 'roles',
      headerName: 'Ruoli',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        if (!params.row.roles || params.row.roles.length === 0) {
          return (
            <Typography variant="body2" color="text.secondary">
              Nessun ruolo
            </Typography>
          );
        }
        return (
          <Stack direction="row" spacing={0.5}>
            {params.row.roles.map((role) => (
              <RoleBadge key={role.id} role={role.name} size="small" showIcon={false} />
            ))}
          </Stack>
        );
      },
    },
    {
      field: 'is_active',
      headerName: 'Stato',
      width: 120,
      renderCell: (params) => {
        return (
          <Chip
            label={params.row.is_active ? 'Attivo' : 'Disattivato'}
            color={params.row.is_active ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'created_at',
      headerName: 'Creato il',
      width: 150,
      valueFormatter: (value) => {
        return new Date(value).toLocaleDateString('it-IT');
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Azioni',
      width: 120,
      getActions: (params: GridRowParams<User>) => {
        const actions = [];

        if (authorization.can('users.manage')) {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Modifica"
              onClick={() => {
                router.get(
                  route('app.users.edit', {
                    user: params.row.id,
                    tenant: page.currentTenantId,
                  })
                );
              }}
            />
          );

          actions.push(
            <GridActionsCellItem
              icon={<RoleIcon />}
              label="Gestisci ruolo"
              onClick={() => {
                router.get(
                  route('app.users.show', {
                    user: params.row.id,
                    tenant: page.currentTenantId,
                  })
                );
              }}
              showInMenu
            />
          );

          // Don't allow deleting yourself
          if (params.row.id !== auth.user?.id) {
            actions.push(
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Elimina"
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare questo utente?')) {
                    router.delete(
                      route('app.users.destroy', {
                        user: params.row.id,
                        tenant: page.currentTenantId,
                      })
                    );
                  }
                }}
                showInMenu
              />
            );
          }
        }

        return actions;
      },
    },
  ];

  const saveSnapshot = React.useCallback(() => {
    if (apiRef?.current?.exportState && localStorage) {
      const currentState = apiRef.current.exportState();
      localStorage.setItem('userDataGridState', JSON.stringify(currentState));
    }
  }, [apiRef]);

  React.useLayoutEffect(() => {
    const stateFromLocalStorage = localStorage?.getItem('userDataGridState');
    setInitialState(stateFromLocalStorage ? JSON.parse(stateFromLocalStorage) : {});

    window.addEventListener('beforeunload', saveSnapshot);

    return () => {
      window.removeEventListener('beforeunload', saveSnapshot);
      saveSnapshot();
    };
  }, [saveSnapshot]);

  if (!initialState) {
    return <CircularProgress />;
  }

  return (
    <AppLayout user={auth.user}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Gestione Utenti</Typography>
            {authorization.can('users.manage') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  router.get(route('app.users.create', { tenant: page.currentTenantId }));
                }}
              >
                Invita utente
              </Button>
            )}
          </Stack>

          {/* Filters */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Cerca"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nome o email..."
              sx={{ minWidth: 250 }}
            />

            <TextField
              select
              label="Ruolo"
              variant="outlined"
              size="small"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Tutti</MenuItem>
              <MenuItem value="owner">{getRoleLabel('owner')}</MenuItem>
              <MenuItem value="manager">{getRoleLabel('manager')}</MenuItem>
              <MenuItem value="back_office">{getRoleLabel('back_office')}</MenuItem>
              <MenuItem value="staff">{getRoleLabel('staff')}</MenuItem>
              <MenuItem value="trainer">{getRoleLabel('trainer')}</MenuItem>
              <MenuItem value="receptionist">{getRoleLabel('receptionist')}</MenuItem>
              <MenuItem value="customer">{getRoleLabel('customer')}</MenuItem>
            </TextField>

            <TextField
              select
              label="Stato"
              variant="outlined"
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">Tutti</MenuItem>
              <MenuItem value="active">Attivi</MenuItem>
              <MenuItem value="inactive">Disattivati</MenuItem>
            </TextField>
          </Stack>

          {/* DataGrid */}
          <Box sx={{ height: 600 }}>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              initialState={{
                ...initialState,
                pagination: {
                  paginationModel: {
                    pageSize: 25,
                  },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              apiRef={apiRef}
              onRowClick={(params) => {
                if (authorization.can('users.manage')) {
                  router.get(
                    route('app.users.show', {
                      user: params.row.id,
                      tenant: page.currentTenantId,
                    })
                  );
                }
              }}
              sx={{
                '& .MuiDataGrid-row': {
                  cursor: authorization.can('users.manage') ? 'pointer' : 'default',
                },
              }}
            />
          </Box>
        </Stack>
      </Box>
    </AppLayout>
  );
};

export default UserIndex;
