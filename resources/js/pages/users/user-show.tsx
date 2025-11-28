import * as React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Edit as EditIcon,
  AdminPanelSettings as RoleIcon,
  Close as CloseIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Security as PermissionIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import RoleBadge from '@/components/users/RoleBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRolePermissionLabels } from '@/hooks/useRolePermissionLabels';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Role {
  id: number;
  name: string;
  permissions: Array<{ id: number; name: string }>;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  main_role: Role | null;
  extra_permissions: string[];
  all_permissions: string[];
}

interface UserShowProps extends PageProps {
  user: User;
  available_roles: Array<{ id: number; name: string; description: string }>;
  all_available_permissions: Array<{
    id: number;
    name: string;
    category: string;
  }>;
}

const UserShow: React.FC<UserShowProps> = ({
  auth,
  user,
  available_roles,
  all_available_permissions,
}) => {
  const { props } = usePage<PageProps>();
  const tenantId = props.currentTenantId;
  const authorization = useAuthorization();
  const { getCategoryLabel, getPermissionLabel, formatPermission } = useRolePermissionLabels();
  const [openRoleDialog, setOpenRoleDialog] = React.useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState(user.main_role?.name || '');
  const [selectedPermissions, setSelectedPermissions] = React.useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get role permission names for comparison
  const rolePermissionNames = React.useMemo(() => {
    return user.main_role?.permissions.map((p) => p.name) || [];
  }, [user.main_role]);

  // Initialize selected permissions when dialog opens
  React.useEffect(() => {
    if (openPermissionsDialog) {
      // Get IDs of current extra permissions
      const extraPermissionIds = all_available_permissions
        .filter((p) => user.extra_permissions.includes(p.name))
        .map((p) => p.id);
      setSelectedPermissions(extraPermissionIds);
    }
  }, [openPermissionsDialog, user.extra_permissions, all_available_permissions]);

  // Group available permissions by category (excluding role permissions)
  const groupedAvailablePermissions = React.useMemo(() => {
    const groups: Record<string, typeof all_available_permissions> = {};

    all_available_permissions.forEach((permission) => {
      // Skip permissions already granted by role
      if (rolePermissionNames.includes(permission.name)) {
        return;
      }

      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }
      groups[permission.category].push(permission);
    });

    return groups;
  }, [all_available_permissions, rolePermissionNames]);

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = () => {
    setIsSubmitting(true);
    router.put(
      route('app.users.permissions.update', {
        user: user.id,
        tenant: tenantId,
      }),
      { permissions: selectedPermissions },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSubmitting(false);
          setOpenPermissionsDialog(false);
        },
      }
    );
  };

  const currentRole = user.main_role?.name || 'Nessun ruolo';

  const handleChangeRole = () => {
    if (!selectedRole || selectedRole === currentRole) {
      setOpenRoleDialog(false);
      return;
    }

    setIsSubmitting(true);
    router.put(
      route('app.users.role.update', {
        user: user.id,
        tenant: tenantId,
      }),
      { role: selectedRole },
      {
        preserveScroll: true,
        onFinish: () => {
          setIsSubmitting(false);
          setOpenRoleDialog(false);
        },
      }
    );
  };

  const handleToggleStatus = () => {
    if (
      confirm(
        user.is_active
          ? 'Sei sicuro di voler disattivare questo utente?'
          : 'Sei sicuro di voler riattivare questo utente?'
      )
    ) {
      router.patch(
        route('app.users.update', {
          user: user.id,
          tenant: tenantId,
        }),
        { is_active: !user.is_active },
        {
          preserveScroll: true,
        }
      );
    }
  };

  // Group permissions by category
  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, string[]> = {};

    user.all_permissions.forEach((permissionName) => {
      const [category] = permissionName.split('.');
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permissionName);
    });

    return groups;
  }, [user.all_permissions]);


  return (
    <AppLayout user={auth.user}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">
                {user.first_name} {user.last_name}
              </Typography>
              <Stack direction="row" spacing={1}>
                {authorization.can('users.manage') && user.id !== auth.user?.id && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={user.is_active ? <InactiveIcon /> : <ActiveIcon />}
                      onClick={handleToggleStatus}
                      color={user.is_active ? 'error' : 'success'}
                    >
                      {user.is_active ? 'Disattiva' : 'Attiva'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() =>
                        router.get(
                          route('app.users.edit', {
                            user: user.id,
                            tenant: tenantId,
                          })
                        )
                      }
                    >
                      Modifica
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Grid>

          {/* User Info Card */}
          <Grid size={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Informazioni generali
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{user.email}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Stato
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={user.is_active ? 'Attivo' : 'Disattivato'}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Creato il
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(user.created_at), "dd MMMM yyyy 'alle' HH:mm", {
                        locale: it,
                      })}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ultimo aggiornamento
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(user.updated_at), "dd MMMM yyyy 'alle' HH:mm", {
                        locale: it,
                      })}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Role Card */}
          <Grid size={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    Ruolo
                  </Typography>
                  {authorization.can('users.manage') && user.id !== auth.user?.id && (
                    <IconButton
                      size="small"
                      onClick={() => setOpenRoleDialog(true)}
                      color="primary"
                    >
                      <RoleIcon />
                    </IconButton>
                  )}
                </Stack>
                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Ruolo corrente
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <RoleBadge role={currentRole} size="medium" showIcon={true} />
                    </Box>
                  </Box>

                  {user.main_role?.permissions && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Permessi del ruolo: {user.main_role.permissions.length}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Permessi extra: {user.extra_permissions.length}
                      </Typography>
                      {authorization.can('users.manage') && user.id !== auth.user?.id && (
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => setOpenPermissionsDialog(true)}
                        >
                          Gestisci
                        </Button>
                      )}
                    </Stack>
                    {user.extra_permissions.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1, gap: 0.5 }}>
                        {user.extra_permissions.map((permission) => (
                          <Chip
                            key={permission}
                            label={getPermissionLabel(permission)}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Permissions Card */}
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Permessi attivi ({user.all_permissions.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {user.all_permissions.length === 0 ? (
                  <Alert severity="warning">
                    Questo utente non ha permessi attivi. Assegna un ruolo o aggiungi permessi
                    manuali per consentire l'accesso alle funzionalità.
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
                            {getCategoryLabel(category)}
                          </Typography>
                          <List dense>
                            {permissions.map((permission) => (
                              <ListItem key={permission} sx={{ px: 0 }}>
                                <ListItemText
                                  primary={formatPermission(permission).actionLabel}
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

      {/* Change Role Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            Cambia ruolo utente
            <IconButton onClick={() => setOpenRoleDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Modificando il ruolo, i permessi dell'utente verranno aggiornati automaticamente in
              base al nuovo ruolo selezionato.
            </Alert>

            <TextField
              select
              fullWidth
              label="Nuovo ruolo"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {available_roles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  <div>
                    <Typography variant="body1">{role.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {role.description}
                    </Typography>
                  </div>
                </MenuItem>
              ))}
            </TextField>

            {selectedRole && selectedRole !== currentRole && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Nuovo ruolo:
                </Typography>
                <RoleBadge role={selectedRole} size="medium" showIcon={true} />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Annulla</Button>
          <Button
            onClick={handleChangeRole}
            variant="contained"
            disabled={isSubmitting || !selectedRole || selectedRole === currentRole}
          >
            Conferma
          </Button>
        </DialogActions>
      </Dialog>

      {/* Extra Permissions Dialog */}
      <Dialog
        open={openPermissionsDialog}
        onClose={() => setOpenPermissionsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <PermissionIcon color="primary" />
              <Typography variant="h6">Gestisci permessi extra</Typography>
            </Stack>
            <IconButton onClick={() => setOpenPermissionsDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              I permessi extra sono permessi aggiuntivi assegnati direttamente all'utente, oltre a
              quelli ereditati dal ruolo. I permessi già inclusi nel ruolo{' '}
              <strong>{currentRole}</strong> non sono mostrati qui.
            </Alert>

            {Object.keys(groupedAvailablePermissions).length === 0 ? (
              <Alert severity="success">
                Il ruolo corrente include già tutti i permessi disponibili. Non ci sono permessi
                extra da assegnare.
              </Alert>
            ) : (
              Object.entries(groupedAvailablePermissions).map(([category, permissions]) => (
                <Accordion key={category} defaultExpanded={permissions.length <= 5}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={600}>{getCategoryLabel(category)}</Typography>
                      <Chip
                        label={`${permissions.filter((p) => selectedPermissions.includes(p.id)).length}/${permissions.length}`}
                        size="small"
                        color={
                          permissions.some((p) => selectedPermissions.includes(p.id))
                            ? 'primary'
                            : 'default'
                        }
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      {permissions.map((permission) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={permission.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => handleTogglePermission(permission.id)}
                                size="small"
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {formatPermission(permission.name).actionLabel}
                              </Typography>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))
            )}

            {selectedPermissions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Permessi extra selezionati ({selectedPermissions.length}):
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {selectedPermissions.map((id) => {
                    const permission = all_available_permissions.find((p) => p.id === id);
                    return permission ? (
                      <Chip
                        key={id}
                        label={getPermissionLabel(permission.name)}
                        size="small"
                        color="secondary"
                        onDelete={() => handleTogglePermission(id)}
                      />
                    ) : null;
                  })}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPermissionsDialog(false)}>Annulla</Button>
          <Button onClick={handleSavePermissions} variant="contained" disabled={isSubmitting}>
            Salva permessi
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default UserShow;
