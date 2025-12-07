import * as React from 'react';
import { PageProps } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Str } from '@/support/Str';
import { router } from '@inertiajs/react';
import PlanCard from '@/components/central/subscription-plans/PlanCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface PlanFeature {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  feature_type: string;
  is_included: boolean;
  quota_limit: number | null;
  price: number | null;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  trial_days: number;
  tier: string | null;
  is_active: boolean;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  sort_order: number | null;
}

interface ShowProps extends PageProps {
  subscriptionPlan: SubscriptionPlan;
  planFeatures: PlanFeature[];
}

const Show: React.FC<ShowProps> = ({ auth, subscriptionPlan, planFeatures }) => {
  const tierLabels: Record<string, string> = {
    demo: 'Demo',
    base: 'Base',
    gold: 'Gold',
    platinum: 'Platinum',
  };

  const intervalLabels: Record<string, string> = {
    month: 'Mensile',
    year: 'Annuale',
    week: 'Settimanale',
    day: 'Giornaliero',
  };

  const featureTypeLabels: Record<string, string> = {
    boolean: 'Sì/No',
    quota: 'Con Quota',
    metered: 'A Consumo',
  };

  const includedFeatures = planFeatures.filter(f => f.is_included);
  const notIncludedFeatures = planFeatures.filter(f => !f.is_included);

  return (
    <CentralLayout user={auth.user}>
      <Box m={2}>
        <Grid container spacing={3}>
          {/* Header with Actions */}
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" fontWeight="bold">
                {subscriptionPlan.name}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => router.get(route('central.subscription-plans.index'))}
                >
                  Indietro
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.get(route('central.subscription-plans.edit', subscriptionPlan.id))}
                >
                  Modifica
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Plan Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <MyCard title="Dettagli Piano">
              <Grid container spacing={2}>
                {/* Basic Info */}
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nome
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {subscriptionPlan.name}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Slug
                  </Typography>
                  <Typography variant="body1" fontWeight="mono">
                    {subscriptionPlan.slug}
                  </Typography>
                </Grid>

                {subscriptionPlan.description && (
                  <Grid size={12}>
                    <Typography variant="body2" color="text.secondary">
                      Descrizione
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {subscriptionPlan.description}
                    </Typography>
                  </Grid>
                )}

                <Grid size={12}>
                  <Divider />
                </Grid>

                {/* Pricing Info */}
                <Grid size={4}>
                  <Typography variant="body2" color="text.secondary">
                    Prezzo
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {Str.EURO(subscriptionPlan.price).format()}
                  </Typography>
                </Grid>

                <Grid size={4}>
                  <Typography variant="body2" color="text.secondary">
                    Valuta
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {subscriptionPlan.currency}
                  </Typography>
                </Grid>

                <Grid size={4}>
                  <Typography variant="body2" color="text.secondary">
                    Intervallo
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {intervalLabels[subscriptionPlan.interval] || subscriptionPlan.interval}
                  </Typography>
                </Grid>

                <Grid size={12}>
                  <Divider />
                </Grid>

                {/* Additional Info */}
                <Grid size={4}>
                  <Typography variant="body2" color="text.secondary">
                    Giorni di Prova
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {subscriptionPlan.trial_days || 0} giorni
                  </Typography>
                </Grid>

                {subscriptionPlan.tier && (
                  <Grid size={4}>
                    <Typography variant="body2" color="text.secondary">
                      Livello
                    </Typography>
                    <Chip
                      label={tierLabels[subscriptionPlan.tier] || subscriptionPlan.tier}
                      size="small"
                      color="primary"
                    />
                  </Grid>
                )}

                <Grid size={4}>
                  <Typography variant="body2" color="text.secondary">
                    Stato
                  </Typography>
                  <Chip
                    label={subscriptionPlan.is_active ? 'Attivo' : 'Non Attivo'}
                    size="small"
                    color={subscriptionPlan.is_active ? 'success' : 'default'}
                  />
                </Grid>

                {(subscriptionPlan.stripe_product_id || subscriptionPlan.stripe_price_id) && (
                  <>
                    <Grid size={12}>
                      <Divider />
                    </Grid>
                    {subscriptionPlan.stripe_product_id && (
                      <Grid size={12}>
                        <Typography variant="body2" color="text.secondary">
                          Stripe Product ID
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                          {subscriptionPlan.stripe_product_id}
                        </Typography>
                      </Grid>
                    )}
                    {subscriptionPlan.stripe_price_id && (
                      <Grid size={12}>
                        <Typography variant="body2" color="text.secondary">
                          Stripe Price ID
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                          {subscriptionPlan.stripe_price_id}
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </MyCard>

            {/* Features Table */}
            <MyCard title="Caratteristiche del Piano" sx={{ mt: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Feature</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="center">Inclusa</TableCell>
                      <TableCell align="right">Quota Limite</TableCell>
                      <TableCell align="right">Prezzo Addon</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {planFeatures.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            Nessuna feature configurata
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      planFeatures.map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" fontWeight="bold">
                                {feature.display_name}
                              </Typography>
                              {feature.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {feature.description}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={featureTypeLabels[feature.feature_type]}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {feature.is_included ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <CancelIcon color="disabled" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {feature.quota_limit || '-'}
                          </TableCell>
                          <TableCell align="right">
                            {feature.price ? Str.EURO(feature.price).format() : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Feature Summary */}
              <Box mt={3}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Features Incluse
                      </Typography>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {includedFeatures.length}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Features Addon
                      </Typography>
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {notIncludedFeatures.length}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </MyCard>
          </Grid>

          {/* Card Preview */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Purchase Variant Preview */}
              <MyCard title="Preview Card - Acquisto">
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Card in stile Material-UI per la selezione del piano
                </Typography>
                <PlanCard
                  name={subscriptionPlan.name}
                  description={subscriptionPlan.description}
                  price={subscriptionPlan.price}
                  currency={subscriptionPlan.currency}
                  interval={subscriptionPlan.interval}
                  trial_days={subscriptionPlan.trial_days}
                  tier={subscriptionPlan.tier || undefined}
                  is_active={subscriptionPlan.is_active}
                  features={planFeatures}
                  highlighted={subscriptionPlan.tier === 'gold'}
                  showSelectButton={true}
                  selectButtonText="Scegli questo piano"
                  variant="purchase"
                />
              </MyCard>

              {/* Marketing Variant Preview */}
              <MyCard title="Preview Card - Marketing">
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Card in stile landing page per pubblicità
                </Typography>
                <Box sx={{ bgcolor: '#0F1419', p: 2, borderRadius: 2 }}>
                  <PlanCard
                    name={subscriptionPlan.name}
                    description={subscriptionPlan.description}
                    price={subscriptionPlan.price}
                    currency={subscriptionPlan.currency}
                    interval={subscriptionPlan.interval}
                    trial_days={subscriptionPlan.trial_days}
                    tier={subscriptionPlan.tier || undefined}
                    is_active={subscriptionPlan.is_active}
                    features={planFeatures}
                    highlighted={subscriptionPlan.tier === 'gold'}
                    showSelectButton={true}
                    selectButtonText="PROVA GRATIS"
                    variant="marketing"
                  />
                </Box>
              </MyCard>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </CentralLayout>
  );
};

export default Show;
