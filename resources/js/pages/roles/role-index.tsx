import * as React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  AdminPanelSettings as RoleIcon,
  People as PeopleIcon,
  Security as PermissionIcon,
  Lock as SystemIcon,
} from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import RoleBadge from '@/components/users/RoleBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRolePermissionLabels } from '@/hooks/useRolePermissionLabels';

interface Role {
  id: number;
  name: string;
  guard_name: string;
  users_count: number;
  permissions_count: number;
  is_system: boolean;
  description?: string;
}

interface RoleIndexProps extends PageProps {
  roles: Role[];
}

const RoleIndex: React.FC<RoleIndexProps> = ({ auth, roles }) => {
  const authorization = useAuthorization();
  const { getRoleLabel, getRoleDescription } = useRolePermissionLabels();
  const { props } = usePage<PageProps>();
  const tenantId = props.currentTenantId;

  // Sort roles: system roles first, then custom roles
  const sortedRoles = React.useMemo(() => {
    return [...roles].sort((a, b) => {
      if (a.is_system && !b.is_system) return -1;
      if (!a.is_system && b.is_system) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [roles]);

  const systemRolesCount = roles.filter((r) => r.is_system).length;
  const customRolesCount = roles.filter((r) => !r.is_system).length;
  const totalUsers = roles.reduce((sum, role) => sum + role.users_count, 0);

  return (
    <AppLayout user={auth.user}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Gestione Ruoli</Typography>
            {authorization.can('users.manage') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  router.get(
                    route('app.roles.create', { tenant: tenantId })
                  );
                }}
              >
                Crea ruolo personalizzato
              </Button>
            )}
          </Stack>

          {/* Stats Cards */}
          <Grid container spacing={2}>
            <Grid size={{sm: 12, md: 3}}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <RoleIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{roles.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ruoli totali
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{sm: 12, md: 3}}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <SystemIcon color="info" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{systemRolesCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ruoli di sistema
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{sm: 12, md: 3}}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AddIcon color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{customRolesCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ruoli personalizzati
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{sm: 12, md: 3}}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PeopleIcon color="secondary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{totalUsers}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Utenti assegnati
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Roles Grid */}
          <Grid container spacing={2}>
            {sortedRoles.map((role) => (
              <Grid size={{ sm: 12, md: 6, lg: 4 }} key={role.id}>
                <Card
                  sx={{
                    height: '100%',
                    border: role.is_system ? '2px solid' : '1px solid',
                    borderColor: role.is_system ? 'primary.main' : 'divider',
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      router.get(
                        route('app.roles.show', {
                          role: role.id,
                          tenant: tenantId,
                        })
                      );
                    }}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        {/* Role Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                          <RoleBadge role={role.name} size="medium" showIcon={true} />
                          {role.is_system && (
                            <Chip
                              label="Sistema"
                              size="small"
                              color="primary"
                              variant="outlined"
                              icon={<SystemIcon />}
                            />
                          )}
                        </Stack>

                        {/* Description */}
                        <Typography variant="body2" color="text.secondary">
                          {getRoleDescription(role.name) || role.description}
                        </Typography>

                        {/* Stats */}
                        <Stack direction="row" spacing={2}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {role.users_count} {role.users_count === 1 ? 'utente' : 'utenti'}
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <PermissionIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {role.permissions_count}{' '}
                              {role.permissions_count === 1 ? 'permesso' : 'permessi'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Box>
    </AppLayout>
  );
};

export default RoleIndex;
