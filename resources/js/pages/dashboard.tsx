import * as React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types';
import StyledCard from '@/components/ui/StyledCard';
import { Str } from '@/support/Str';

interface DashboardProps extends PageProps {
  activeCustomersCount: number;
  dailyCollectionSum: number;
  dailyCollectionDiffSum: Array<number>;
  pendingPaymentsCount: number;
  activeSubscriptions: number;
  subscriptionDiffPerDate: Array<number>;

  active_membership_fees: number;
  active_subscriptions: number;
  daily_collection_sum: number;
  pending_payments_count: number;
  subscription_diff_per_date: Array<number>;
  daily_collection_diff_sum: Array<number>;
}

export default function Dashboard(
  {
    auth,
    activeCustomersCount,
    dailyCollectionSum,
    dailyCollectionDiffSum,
    pendingPaymentsCount,
    activeSubscriptions,
    subscriptionDiffPerDate
  }: DashboardProps
) {
  return (
    <AppLayout user={auth.user}>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={3}>
            <StyledCard
              color="secondary"
              loading={false}
              description="Atleti Attivi"
              content={activeCustomersCount}
            />
          </Grid>
          <Grid size={3}>
            <StyledCard
              description="Incasso Giornaliero"
              content={Str.EURO(dailyCollectionSum).format()}
              details={dailyCollectionDiffSum}
            />
          </Grid>
          <Grid size={3}>
            <StyledCard
              description="Pagamenti In Sospeso"
              content={pendingPaymentsCount}
            />
          </Grid>
          <Grid size={3}>
            <StyledCard
              description="Abbonamenti Attivi"
              content={activeSubscriptions}
              details={subscriptionDiffPerDate}
            />
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
  );
}
