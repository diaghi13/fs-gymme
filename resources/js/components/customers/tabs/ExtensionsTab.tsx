import * as React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Delete, Pause, AddCircleOutline, Edit as EditIcon } from '@mui/icons-material';
import { usePage, router } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { CustomerSubscriptionSuspension, CustomerSubscriptionExtension, Subscription } from '@/types';
import AddSuspensionDialog from '@/components/customers/dialogs/AddSuspensionDialog';
import AddExtensionDialog from '@/components/customers/dialogs/AddExtensionDialog';
import FormattedDate from '@/components/ui/FormattedDate';

interface ExtensionsTabProps {}

const ExtensionsTab: React.FC<ExtensionsTabProps> = () => {
  const { customer } = usePage<CustomerShowProps>().props;
  const [suspensionDialogOpen, setSuspensionDialogOpen] = React.useState(false);
  const [extensionDialogOpen, setExtensionDialogOpen] = React.useState(false);
  const [selectedSubscription, setSelectedSubscription] = React.useState<Subscription | null>(null);
  const [selectedSuspension, setSelectedSuspension] = React.useState<CustomerSubscriptionSuspension | null>(null);
  const [selectedExtension, setSelectedExtension] = React.useState<CustomerSubscriptionExtension | null>(null);

  const activeSubscriptions = customer.active_subscriptions || [];

  const handleOpenSuspensionDialog = (subscription: Subscription, suspension?: CustomerSubscriptionSuspension) => {
    setSelectedSubscription(subscription);
    setSelectedSuspension(suspension || null);
    setSuspensionDialogOpen(true);
  };

  const handleOpenExtensionDialog = (subscription: Subscription, extension?: CustomerSubscriptionExtension) => {
    setSelectedSubscription(subscription);
    setSelectedExtension(extension || null);
    setExtensionDialogOpen(true);
  };

  const handleCloseSuspensionDialog = () => {
    setSuspensionDialogOpen(false);
    setSelectedSuspension(null);
  };

  const handleCloseExtensionDialog = () => {
    setExtensionDialogOpen(false);
    setSelectedExtension(null);
  };

  const handleDeleteSuspension = (suspension: CustomerSubscriptionSuspension) => {
    if (!confirm('Sei sicuro di voler eliminare questa sospensione?')) return;

    router.delete(
      route('api.v1.customer-subscriptions.suspensions.destroy', { suspension: suspension.id }),
      {
        preserveScroll: true,
      }
    );
  };

  const handleDeleteExtension = (extension: CustomerSubscriptionExtension) => {
    if (!confirm('Sei sicuro di voler eliminare questa proroga?')) return;

    router.delete(
      route('api.v1.customer-subscriptions.extensions.destroy', { extension: extension.id }),
      {
        preserveScroll: true,
      }
    );
  };


  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {/* Active Subscriptions */}
      <Grid size={12}>
        <Card>
          <CardHeader
            title="Abbonamenti Attivi"
            subheader="Gestisci sospensioni e proroghe degli abbonamenti del cliente"
          />
          <CardContent>
            {activeSubscriptions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                Nessun abbonamento attivo
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Abbonamento</TableCell>
                      <TableCell>Data Inizio</TableCell>
                      <TableCell>Data Scadenza</TableCell>
                      <TableCell>Scadenza Effettiva</TableCell>
                      <TableCell align="center">Giorni Sospesi</TableCell>
                      <TableCell align="center">Giorni Prorogati</TableCell>
                      <TableCell align="right">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {subscription.price_list?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {subscription.entity?.name || ''}
                          </Typography>
                        </TableCell>
                        <TableCell>{subscription.start_date ? <FormattedDate value={subscription.start_date} /> : '-'}</TableCell>
                        <TableCell>{subscription.end_date ? <FormattedDate value={subscription.end_date} /> : '-'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {subscription.effective_end_date || subscription.end_date ? <FormattedDate value={(subscription.effective_end_date || subscription.end_date)!} /> : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={subscription.suspended_days || 0}
                            size="small"
                            color={subscription.suspended_days ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={subscription.extended_days || 0}
                            size="small"
                            color={subscription.extended_days ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              startIcon={<Pause />}
                              onClick={() => handleOpenSuspensionDialog(subscription)}
                            >
                              Sospendi
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<AddCircleOutline />}
                              onClick={() => handleOpenExtensionDialog(subscription)}
                            >
                              Proroga
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Suspensions History */}
      <Grid size={6}>
        <Card>
          <CardHeader title="Storico Sospensioni" />
          <CardContent>
            {activeSubscriptions.every(sub => !sub.suspensions || sub.suspensions.length === 0) ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Nessuna sospensione registrata
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Abbonamento</TableCell>
                      <TableCell>Dal</TableCell>
                      <TableCell>Al</TableCell>
                      <TableCell>Giorni</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell align="right">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeSubscriptions.flatMap(subscription =>
                      (subscription.suspensions || []).map(suspension => (
                        <TableRow key={suspension.id}>
                          <TableCell>
                            <Typography variant="caption">
                              {subscription.price_list?.name}
                            </Typography>
                          </TableCell>
                          <TableCell>{suspension.start_date ? <FormattedDate value={suspension.start_date} /> : '-'}</TableCell>
                          <TableCell>{suspension.end_date ? <FormattedDate value={suspension.end_date} /> : '-'}</TableCell>
                          <TableCell>
                            <Chip label={suspension.days_suspended} size="small" color="warning" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" noWrap>
                              {suspension.reason || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenSuspensionDialog(subscription, suspension)}
                                title="Modifica"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteSuspension(suspension)}
                                title="Elimina"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Extensions History */}
      <Grid size={6}>
        <Card>
          <CardHeader title="Storico Proroghe" />
          <CardContent>
            {activeSubscriptions.every(sub => !sub.extensions || sub.extensions.length === 0) ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Nessuna proroga registrata
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Abbonamento</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Giorni</TableCell>
                      <TableCell>Nuova Scadenza</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell align="right">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeSubscriptions.flatMap(subscription =>
                      (subscription.extensions || []).map(extension => (
                        <TableRow key={extension.id}>
                          <TableCell>
                            <Typography variant="caption">
                              {subscription.price_list?.name}
                            </Typography>
                          </TableCell>
                          <TableCell>{extension.extended_at ? <FormattedDate value={extension.extended_at} /> : '-'}</TableCell>
                          <TableCell>
                            <Chip label={extension.days_extended} size="small" color="success" />
                          </TableCell>
                          <TableCell>{extension.new_end_date ? <FormattedDate value={extension.new_end_date} /> : '-'}</TableCell>
                          <TableCell>
                            <Typography variant="caption" noWrap>
                              {extension.reason || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenExtensionDialog(subscription, extension)}
                                title="Modifica"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteExtension(extension)}
                                title="Elimina"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Dialogs */}
      {selectedSubscription && (
        <>
          <AddSuspensionDialog
            open={suspensionDialogOpen}
            onClose={handleCloseSuspensionDialog}
            subscription={selectedSubscription}
            suspension={selectedSuspension || undefined}
          />
          <AddExtensionDialog
            open={extensionDialogOpen}
            onClose={handleCloseExtensionDialog}
            subscription={selectedSubscription}
            extension={selectedExtension || undefined}
          />
        </>
      )}
    </Grid>
  );
};

export default ExtensionsTab;
