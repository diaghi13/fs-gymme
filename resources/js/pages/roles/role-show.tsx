import * as React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Security as PermissionIcon,
  Lock as SystemIcon,
} from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import RoleBadge from '@/components/users/RoleBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRolePermissionLabels } from '@/hooks/useRolePermissionLabels';

interface Permission {
  id: number;
  name: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Role {
  id: number;
  name: string;
  guard_name: string;
  is_system: boolean;
  description?: string;
  permissions: Permission[];
  users: User[];
}

interface RoleShowProps extends PageProps {
  role: Role;
}

const RoleShow: React.FC<RoleShowProps> = ({ auth, role }) => {
  const { props } = usePage<PageProps>();
  const tenantId = props.currentTenantId;
  const authorization = useAuthorization();
  const { getCategoryLabel, formatPermission, getRoleDescription } = useRolePermissionLabels();
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

  const handleDelete = () => {
    router.delete(
      route('app.roles.destroy', {
        role: role.id,
        tenant: tenantId,
      }),
      {
        onSuccess: () => {
          router.visit(route('app.roles.index', { tenant: tenantId }));
        },
      }
    );
  };

  // Group permissions by category
  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, Permission[]> = {};

    role.permissions.forEach((permission) => {
      const [category] = permission.name.split('.');
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
    });

    return groups;
  }, [role.permissions]);


  return (
    <AppLayout user={auth.user}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <RoleBadge role={role.name} size="medium" showIcon={true} />
                {role.is_system && (
                  <Chip
                    label="Ruolo di sistema"
                    size="small"
                    color="primary"
                    variant="outlined"
                    icon={<SystemIcon />}
                  />
                )}
              </Stack>
              <Stack direction="row" spacing={1}>
                {authorization.can('users.manage') && !role.is_system && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() =>
                        router.get(
                          route('app.roles.edit', {
                            role: role.id,
                            tenant: tenantId,
                          })
                        )
                      }
                    >
                      Modifica
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setOpenDeleteDialog(true)}
                      disabled={role.users.length > 0}
                    >
                      Elimina
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Grid>

          {role.is_system && (
            <Grid size={12}>
              <Alert severity="info" icon={<SystemIcon />}>
                Questo è un ruolo di sistema e non può essere modificato o eliminato. I permessi
                sono gestiti automaticamente dall'applicazione.
              </Alert>
            </Grid>
          )}

          {/* Role Info Card */}
          <Grid size={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Informazioni ruolo
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nome ruolo
                    </Typography>
                    <Typography variant="body1">{role.name}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Descrizione
                    </Typography>
                    <Typography variant="body1">
                      {getRoleDescription(role.name) || role.description || 'Nessuna descrizione'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Guard
                    </Typography>
                    <Typography variant="body1">{role.guard_name}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tipo
                    </Typography>
                    <Typography variant="body1">
                      {role.is_system ? 'Ruolo di sistema' : 'Ruolo personalizzato'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Card */}
          <Grid size={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Statistiche
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PeopleIcon color="action" />
                      <Typography variant="body1">Utenti assegnati</Typography>
                    </Stack>
                    <Chip label={role.users.length} color="primary" />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PermissionIcon color="action" />
                      <Typography variant="body1">Permessi attivi</Typography>
                    </Stack>
                    <Chip label={role.permissions.length} color="secondary" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Users with this role */}
          {role.users.length > 0 && (
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Utenti con questo ruolo ({role.users.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <List>
                    {role.users.map((user) => (
                      <ListItem
                        key={user.id}
                        button
                        onClick={() =>
                          router.get(
                            route('app.users.show', {
                              user: user.id,
                              tenant: tenantId,
                            })
                          )
                        }
                      >
                        <ListItemText
                          primary={`${user.first_name} ${user.last_name}`}
                          secondary={user.email}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Permissions */}
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Permessi ({role.permissions.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {role.permissions.length === 0 ? (
                  <Alert severity="warning">
                    Questo ruolo non ha permessi assegnati. Gli utenti con questo ruolo non
                    potranno accedere a nessuna funzionalità.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                      <Grid size={12} md={6} lg={4} key={category}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="primary"
                            gutterBottom
                          >
                            {getCategoryLabel(category)} ({permissions.length})
                          </Typography>
                          <List dense>
                            {permissions.map((permission) => (
                              <ListItem key={permission.id} sx={{ px: 0 }}>
                                <ListItemText
                                  primary={formatPermission(permission.name).actionLabel}
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                    color: 'text.secondary',
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            Elimina ruolo
            <IconButton onClick={() => setOpenDeleteDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Attenzione:</strong> Questa azione è irreversibile.
          </Alert>

          <Typography variant="body1" gutterBottom>
            Sei sicuro di voler eliminare il ruolo <strong>{role.name}</strong>?
          </Typography>

          {role.users.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Questo ruolo è assegnato a {role.users.length}{' '}
              {role.users.length === 1 ? 'utente' : 'utenti'}. Non è possibile eliminarlo.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annulla</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={role.users.length > 0}
          >
            Elimina definitivamente
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default RoleShow;
