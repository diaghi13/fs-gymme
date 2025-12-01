import { Head, router } from '@inertiajs/react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { PageProps, SubscriptionPlan } from '@/types';
import axios from 'axios';

interface SubscriptionStatusProps extends PageProps {
  subscriptionTenant: {
    id: string;
    name: string;
    email: string;
  };
  activeSubscription: SubscriptionPlan & {
    pivot: {
      starts_at: string;
      ends_at: string;
      is_active: boolean;
      is_trial: boolean;
      trial_ends_at: string | null;
      status: string;
    };
  } | null;
  cashierSubscription: {
    id: string;
    status: string;
    on_trial: boolean;
    trial_ends_at: string | null;
    on_grace_period: boolean;
    ends_at: string | null;
    canceled: boolean;
    active: boolean;
    recurring: boolean;
  } | null;
  availablePlans: SubscriptionPlan[];
}

export default function SubscriptionStatus({
  auth,
  subscriptionTenant,
  activeSubscription,
  cashierSubscription,
  availablePlans,
}: SubscriptionStatusProps) {
  const tenant = subscriptionTenant;
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      await axios.post(
        route('subscription.cancel', { tenant: tenant.id }),
        { tenant_id: tenant.id }
      );

      router.reload();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setLoading(false);
      setCancelDialogOpen(false);
    }
  };

  const handleResumeSubscription = async () => {
    setLoading(true);
    try {
      await axios.post(
        route('subscription.resume', { tenant: tenant.id }),
        { tenant_id: tenant.id }
      );

      router.reload();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (plan: SubscriptionPlan, action: 'upgrade' | 'downgrade') => {
    setLoading(true);
    try {
      await axios.post(
        route('subscription.change-plan', { tenant: tenant.id }),
        {
          tenant_id: tenant.id,
          plan_id: plan.id,
          action,
        }
      );

      router.reload();
    } catch (error) {
      console.error('Failed to change plan:', error);
    } finally {
      setLoading(false);
      setChangePlanDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
        return 'warning';
      case 'canceled':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AppLayout user={auth.user} title="Subscription Status">
      <Head title="Subscription Status" />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Stato Abbonamento
        </Typography>

        {!activeSubscription && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Non hai un abbonamento attivo. Seleziona un piano per iniziare.
            <Button
              variant="contained"
              size="small"
              sx={{ ml: 2 }}
              onClick={() => router.get(route('app.subscription-plans.index', { tenant: tenant.id }))}
            >
              Scegli un piano
            </Button>
          </Alert>
        )}

        {activeSubscription && (
          <>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card>
                  <CardContent>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {activeSubscription.name}
                        </Typography>
                        <Chip
                          label={activeSubscription.pivot.status}
                          color={getStatusColor(activeSubscription.pivot.status)}
                          size="small"
                        />
                        {activeSubscription.is_trial_plan && (
                          <Chip
                            label="PIANO DEMO"
                            color="info"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>

                      <Divider />

                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Prezzo
                        </Typography>
                        <Typography variant="h5">
                          {activeSubscription.price === 0 ? 'Gratuito' : `€${(activeSubscription.price / 100).toFixed(2)} / ${activeSubscription.interval}`}
                        </Typography>
                      </Box>

                      {activeSubscription.pivot.is_trial && cashierSubscription?.on_trial && (
                        <Alert severity="info">
                          Periodo di prova fino al {formatDate(cashierSubscription.trial_ends_at)}
                        </Alert>
                      )}

                      {cashierSubscription?.on_grace_period && (
                        <Alert severity="warning">
                          L'abbonamento è stato cancellato e terminerà il {formatDate(cashierSubscription.ends_at)}
                        </Alert>
                      )}

                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Data inizio
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(activeSubscription.pivot.starts_at)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Prossimo rinnovo
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(activeSubscription.pivot.ends_at)}
                        </Typography>
                      </Box>

                      <Divider />

                      <Stack direction="row" spacing={2}>
                        {cashierSubscription?.on_grace_period ? (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={handleResumeSubscription}
                            disabled={loading}
                          >
                            Riattiva Abbonamento
                          </Button>
                        ) : (
                          <>
                            {activeSubscription.is_trial_plan ? (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => router.get(route('app.subscription-plans.index', { tenant: tenant.id }))}
                                disabled={loading}
                              >
                                Passa a Piano Pagamento
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="outlined"
                                  onClick={() => setChangePlanDialogOpen(true)}
                                  disabled={loading}
                                >
                                  Cambia Piano
                                </Button>
                                {cashierSubscription && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setCancelDialogOpen(true)}
                                    disabled={loading}
                                  >
                                    Cancella Abbonamento
                                  </Button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Informazioni Account
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Azienda
                        </Typography>
                        <Typography variant="body1">{tenant.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Email
                        </Typography>
                        <Typography variant="body1">{tenant.email}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
          <DialogTitle>Conferma Cancellazione</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sei sicuro di voler cancellare il tuo abbonamento? L'abbonamento rimarrà attivo fino
              alla fine del periodo di fatturazione corrente.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)} disabled={loading}>
              Annulla
            </Button>
            <Button onClick={handleCancelSubscription} color="error" disabled={loading} autoFocus>
              Conferma Cancellazione
            </Button>
          </DialogActions>
        </Dialog>

        {/* Change Plan Dialog */}
        <Dialog
          open={changePlanDialogOpen}
          onClose={() => setChangePlanDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Cambia Piano</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {availablePlans
                .filter((plan) => plan.id !== activeSubscription?.id)
                .map((plan) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={plan.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <CardContent>
                        <Typography variant="h6">{plan.name}</Typography>
                        <Typography variant="h5" color="primary" sx={{ my: 1 }}>
                          €{plan.price.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {plan.interval}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                          {plan.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePlanDialogOpen(false)} disabled={loading}>
              Annulla
            </Button>
            {selectedPlan && (
              <>
                {selectedPlan.price > (activeSubscription?.price ?? 0) ? (
                  <Button
                    onClick={() => handleChangePlan(selectedPlan, 'upgrade')}
                    color="primary"
                    variant="contained"
                    disabled={loading}
                  >
                    Upgrade
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleChangePlan(selectedPlan, 'downgrade')}
                    color="primary"
                    variant="contained"
                    disabled={loading}
                  >
                    Downgrade
                  </Button>
                )}
              </>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
}