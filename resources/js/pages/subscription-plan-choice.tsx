import { Head, router } from '@inertiajs/react';
import { Box, Button, Chip, Container, CssBaseline, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import * as React from 'react';

import { PageProps, SubscriptionPlan } from '@/types';
import { Str } from '@/support/Str';

interface SubscriptionPlanChoiceProps extends PageProps {
  plans: SubscriptionPlan[];
}

const SubscriptionPlanChoice: React.FC<SubscriptionPlanChoiceProps> = ({ plans, auth }) => {
  const theme = useTheme();
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('yearly');

  // Group plans by display_group or tier
  const groupedPlans = React.useMemo(() => {
    const groups: Record<string, SubscriptionPlan[]> = {};

    plans.forEach(plan => {
      const groupKey = plan.display_group || plan.tier || 'default';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(plan);
    });

    return groups;
  }, [plans]);

  // Get visible plans based on selected interval
  const visiblePlans = React.useMemo(() => {
    return Object.entries(groupedPlans).map(([groupKey, groupPlans]) => {
      // Try to find plan with selected interval
      let selectedPlan = groupPlans.find(p => p.interval === billingInterval);

      // Fallback to first plan if interval not found
      if (!selectedPlan) {
        selectedPlan = groupPlans[0];
      }

      return selectedPlan;
    }).filter(Boolean) as SubscriptionPlan[];
  }, [groupedPlans, billingInterval]);

  // Calculate savings for yearly plans
  const getSavings = (plan: SubscriptionPlan): number | null => {
    if (plan.interval !== 'yearly') return null;

    const groupKey = plan.display_group || plan.tier || 'default';
    const monthlyPlan = groupedPlans[groupKey]?.find(p => p.interval === 'monthly');

    if (!monthlyPlan) return null;

    const yearlyPrice = plan.price;
    const monthlyYearlyEquivalent = monthlyPlan.price * 12;

    return monthlyYearlyEquivalent - yearlyPrice;
  };

  const intervalLabels: Record<string, string> = {
    monthly: 'Mensile',
    yearly: 'Annuale',
  };

  return (
    <React.Fragment>
      <Head title="Piani di Abbonamento" />
      <CssBaseline />

      <Box
        sx={{
          minWidth: '100%',
          minHeight: '100vh',
          background: theme.palette.primary.dark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container component="main" maxWidth="lg">
          <Stack spacing={4} alignItems="center">
            {/* Billing Interval Toggle */}
            <Box>
              <ToggleButtonGroup
                value={billingInterval}
                exclusive
                onChange={(_, newValue) => newValue && setBillingInterval(newValue)}
                aria-label="Intervallo di fatturazione"
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  '& .MuiToggleButton-root': {
                    px: 4,
                    py: 1.5,
                  },
                }}
              >
                <ToggleButton value="monthly" aria-label="Mensile">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>Mensile</Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="yearly" aria-label="Annuale">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>Annuale</Typography>
                    <Chip label="Risparmia" size="small" color="success" />
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Plans Grid */}
            <Grid container spacing={3}>
              {visiblePlans.map((plan) => {
                const savings = getSavings(plan);

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 3,
                        borderRadius: 2,
                        boxShadow: 3,
                        backgroundColor: theme.palette.background.paper,
                        height: '100%',
                        position: 'relative',
                      }}
                    >
                      {/* Savings Badge */}
                      {savings && savings > 0 && (
                        <Chip
                          label={`Risparmia ${Str.EURO(savings).format()}`}
                          color="success"
                          size="small"
                          sx={{ position: 'absolute', top: 16, right: 16 }}
                        />
                      )}

                      <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }} mb={2}>
                        {plan.name}
                      </Typography>

                      <Typography variant="body2" color="textSecondary" align="center" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                        {plan.description}
                      </Typography>

                      <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mt: 'auto' }}>
                        {Str.EURO(plan.price).format()}
                      </Typography>

                      <Typography variant="body2" color="textSecondary" align="center">
                        / {intervalLabels[plan.interval] || plan.interval}
                      </Typography>

                      {plan.trial_days > 0 && (
                        <Typography variant="body2" color="success.main" align="center" sx={{ mt: 1 }}>
                          Prova gratuita di {plan.trial_days} giorni
                        </Typography>
                      )}

                      <Box sx={{ mt: 3, width: '100%' }}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          onClick={() =>
                            router.get(
                              route('app.subscription-plans.payment', {
                                tenant: auth.user.company!.id,
                                subscriptionPlan: plan.id,
                              })
                            )
                          }
                        >
                          Scegli questo piano
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        </Container>
      </Box>
    </React.Fragment>
  );
};

export default SubscriptionPlanChoice;
