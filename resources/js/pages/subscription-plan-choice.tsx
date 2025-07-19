import { Head, router } from '@inertiajs/react';
import { Box, Button, Container, CssBaseline, Grid, Typography, useTheme } from '@mui/material';
import * as React from 'react';

import { PageProps, SubscriptionPlan } from '@/types';

interface SubscriptionPlanChoiceProps extends PageProps {
  plans: SubscriptionPlan[];
}

const SubscriptionPlanChoice: React.FC<SubscriptionPlanChoiceProps> = ({ plans, auth }) => {
  const theme = useTheme();

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
          justifyContent: 'center'
        }}
      >
        <Container
          component="main"
          maxWidth="lg"
        >
          <Grid container spacing={2}>
            {plans.map((plan) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.id}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 2,
                    borderRadius: 1,
                    boxShadow: 3,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Typography component="h1" variant="h5" sx={{textAlign: 'center'}} mb={2}>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" align="center" sx={{whiteSpace: 'pre-line'}}>
                    {plan.description}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    {plan.price.toFixed(2).replace('.', ',')} {plan.currency}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" align="center">
                    {plan.interval}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                    {plan.trial_days > 0 ? `Prova gratuita di ${plan.trial_days} giorni` : 'Nessun periodo di prova'}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => router.get(route('app.subscription-plans.payment', {
                        tenant: auth.user.company!.id,
                        subscriptionPlan: plan.id
                      }))}
                    >
                      Scegli questo piano
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </React.Fragment>
  );
};

export default SubscriptionPlanChoice;
