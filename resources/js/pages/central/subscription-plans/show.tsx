import * as React from 'react';
import { PageProps, SubscriptionPlan } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { Box, Grid } from '@mui/material';
import MyCard from '@/components/ui/MyCard';

interface ShowProps extends PageProps {
  subscriptionPlan: SubscriptionPlan;
}

const Index: React.FC<ShowProps> = ({ auth, subscriptionPlan }) => {
  return (
    <CentralLayout user={auth.user}>
      <Box m={2}>
        <MyCard title="Dettagli Piano di Abbonamento">
          <Grid container spacing={2}>
            <Grid size={12}>
              <Box>
                <h2>{subscriptionPlan.name}</h2>
                <p>{subscriptionPlan.description}</p>
                <p>Prezzo: {subscriptionPlan.price ? `€ ${subscriptionPlan.price.toFixed(2)}` : 'Gratuito'}</p>
                <p>Valuta: {subscriptionPlan.currency || 'EUR'}</p>
                <p>Intervallo: {subscriptionPlan.interval || 'Mensile'}</p>
                <p>Giorni di prova: {subscriptionPlan.trial_days || 0}</p>
                <p>Attivo: {subscriptionPlan.is_active ? 'Sì' : 'No'}</p>
              </Box>
            </Grid>
          </Grid>
        </MyCard>
      </Box>
    </CentralLayout>
  );
};

export default Index;
