import { Head, router } from '@inertiajs/react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
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
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types';
import FormattedCurrency from '@/components/ui/FormattedCurrency';
import {
  ShoppingCart,
  CheckCircle,
  Cancel,
  TrendingUp,
} from '@mui/icons-material';

interface AddonFeature {
  id: number;
  name: string;
  display_name: string;
  description: string;
  feature_type: 'boolean' | 'quota' | 'metered';
  included_in_plan: boolean;
  plan_quota: number | null;
  addon_price: number;
  addon_quota: number | null;
  has_active_addon: boolean;
  current_addon: {
    id: number;
    quota_limit: number | null;
    price_cents: number;
    starts_at: string;
    ends_at: string | null;
  } | null;
  current_usage: number;
}

interface CurrentAddon {
  id: number;
  feature_name: string;
  quota_limit: number | null;
  price_cents: number;
  starts_at: string;
  ends_at: string | null;
  current_usage: number;
  is_unlimited: boolean;
}

interface AddonsPageProps extends PageProps {
  currentPlan: {
    id: number;
    name: string;
    tier: string;
  };
  availableAddons: AddonFeature[];
  currentAddons: CurrentAddon[];
  error?: string;
}

export default function Addons({
  auth,
  currentPlan,
  availableAddons,
  currentAddons,
  error,
}: AddonsPageProps) {
  const [loading, setLoading] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<AddonFeature | null>(null);
  const [selectedCancelAddon, setSelectedCancelAddon] = useState<CurrentAddon | null>(null);

  const handlePurchaseAddon = async () => {
    if (!selectedAddon) return;

    setLoading(true);
    try {
      router.post(
        route('addons.store', { tenant: auth.current_tenant_id }),
        {
          feature_id: selectedAddon.id,
          payment_method: 'stripe',
        },
        {
          onFinish: () => {
            setLoading(false);
            setPurchaseDialogOpen(false);
            setSelectedAddon(null);
          },
        }
      );
    } catch (error) {
      console.error('Failed to purchase addon:', error);
      setLoading(false);
    }
  };

  const handleCancelAddon = async () => {
    if (!selectedCancelAddon) return;

    setLoading(true);
    try {
      router.delete(
        route('addons.destroy', {
          tenant: auth.current_tenant_id,
          addon: selectedCancelAddon.id,
        }),
        {
          onFinish: () => {
            setLoading(false);
            setCancelDialogOpen(false);
            setSelectedCancelAddon(null);
          },
        }
      );
    } catch (error) {
      console.error('Failed to cancel addon:', error);
      setLoading(false);
    }
  };

  const getUsagePercentage = (usage: number, limit: number | null): number => {
    if (limit === null) return 0; // Unlimited
    if (limit === 0) return 100;
    return Math.min((usage / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): 'success' | 'warning' | 'error' => {
    if (percentage < 70) return 'success';
    if (percentage < 90) return 'warning';
    return 'error';
  };

  return (
    <AppLayout>
      <Head title="Addons & Features" />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h4" gutterBottom>
              Addons & Features
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Piano corrente: <strong>{currentPlan.name}</strong>
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Current Addons */}
          {currentAddons.length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" />
                Addons Attivi
              </Typography>
              <Grid container spacing={2}>
                {currentAddons.map((addon) => (
                  <Grid item xs={12} md={6} key={addon.id}>
                    <Card>
                      <CardContent>
                        <Stack spacing={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Typography variant="h6">{addon.feature_name}</Typography>
                            <Chip label="Attivo" color="success" size="small" />
                          </Box>

                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Prezzo mensile
                            </Typography>
                            <Typography variant="h6" color="primary">
                              <FormattedCurrency value={addon.price_cents / 100} showSymbol />
                              <Typography component="span" variant="body2" color="text.secondary">
                                /mese
                              </Typography>
                            </Typography>
                          </Box>

                          {!addon.is_unlimited && addon.quota_limit !== null && (
                            <Box>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">
                                  Utilizzo
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {addon.current_usage} / {addon.quota_limit}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={getUsagePercentage(addon.current_usage, addon.quota_limit)}
                                color={getUsageColor(
                                  getUsagePercentage(addon.current_usage, addon.quota_limit)
                                )}
                              />
                            </Box>
                          )}

                          {addon.is_unlimited && (
                            <Chip label="Illimitato" color="info" variant="outlined" />
                          )}

                          <Typography variant="caption" color="text.secondary">
                            Attivo dal {new Date(addon.starts_at).toLocaleDateString('it-IT')}
                          </Typography>
                        </Stack>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => {
                            setSelectedCancelAddon(addon);
                            setCancelDialogOpen(true);
                          }}
                        >
                          Cancella
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Available Addons */}
          <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCart />
              Addons Disponibili
            </Typography>
            <Grid container spacing={2}>
              {availableAddons
                .filter((addon) => !addon.included_in_plan && !addon.has_active_addon)
                .map((addon) => (
                  <Grid item xs={12} md={6} lg={4} key={addon.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Stack spacing={2}>
                          <Typography variant="h6">{addon.display_name}</Typography>

                          <Typography variant="body2" color="text.secondary">
                            {addon.description}
                          </Typography>

                          <Divider />

                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Prezzo mensile
                            </Typography>
                            <Typography variant="h5" color="primary">
                              <FormattedCurrency value={addon.addon_price / 100} showSymbol />
                              <Typography component="span" variant="body2" color="text.secondary">
                                /mese
                              </Typography>
                            </Typography>
                          </Box>

                          {addon.feature_type === 'quota' && addon.addon_quota !== null && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Quota inclusa: <strong>{addon.addon_quota}</strong>
                              </Typography>
                            </Box>
                          )}

                          {addon.feature_type === 'boolean' && (
                            <Chip label="Feature On/Off" size="small" variant="outlined" />
                          )}
                        </Stack>
                      </CardContent>
                      <CardActions>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          onClick={() => {
                            setSelectedAddon(addon);
                            setPurchaseDialogOpen(true);
                          }}
                        >
                          Acquista
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}

              {availableAddons.filter((addon) => !addon.included_in_plan && !addon.has_active_addon)
                .length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Non ci sono addons disponibili per il tuo piano. Tutti gli addons sono già inclusi o attivi!
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Included Features */}
          {availableAddons.filter((addon) => addon.included_in_plan).length > 0 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" />
                Incluso nel Piano {currentPlan.name}
              </Typography>
              <Grid container spacing={2}>
                {availableAddons
                  .filter((addon) => addon.included_in_plan)
                  .map((addon) => (
                    <Grid item xs={12} md={6} lg={4} key={addon.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="start">
                              <Typography variant="h6">{addon.display_name}</Typography>
                              <Chip label="Incluso" color="success" size="small" variant="outlined" />
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                              {addon.description}
                            </Typography>

                            {addon.plan_quota !== null && (
                              <Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    Utilizzo
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {addon.current_usage} / {addon.plan_quota === null ? '∞' : addon.plan_quota}
                                  </Typography>
                                </Box>
                                {addon.plan_quota !== null && (
                                  <LinearProgress
                                    variant="determinate"
                                    value={getUsagePercentage(addon.current_usage, addon.plan_quota)}
                                    color={getUsageColor(
                                      getUsagePercentage(addon.current_usage, addon.plan_quota)
                                    )}
                                  />
                                )}
                              </Box>
                            )}

                            {addon.plan_quota === null && (
                              <Chip label="Illimitato" color="success" variant="outlined" />
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}
        </Stack>
      </Container>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)}>
        <DialogTitle>Conferma Acquisto Addon</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler acquistare <strong>{selectedAddon?.display_name}</strong> per{' '}
            <FormattedCurrency value={(selectedAddon?.addon_price ?? 0) / 100} showSymbol /> al mese?
            {selectedAddon?.addon_quota !== null && (
              <>
                <br />
                <br />
                Quota inclusa: <strong>{selectedAddon.addon_quota}</strong>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handlePurchaseAddon} variant="contained" disabled={loading} autoFocus>
            {loading ? 'Acquisto...' : 'Conferma Acquisto'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Conferma Cancellazione Addon</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler cancellare l'addon <strong>{selectedCancelAddon?.feature_name}</strong>?
            <br />
            <br />
            L'addon rimarrà attivo fino alla fine del periodo di fatturazione corrente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleCancelAddon} color="error" variant="contained" disabled={loading} autoFocus>
            {loading ? 'Cancellazione...' : 'Conferma Cancellazione'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
