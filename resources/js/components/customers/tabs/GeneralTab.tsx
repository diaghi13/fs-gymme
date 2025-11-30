import * as React from 'react';
import { Box, Grid } from '@mui/material';
import DetailsCard from '@/components/customers/cards/DetailsCard';
import SubscriptionsCard from '@/components/customers/cards/SubscriptionsCard';
import SalesCard from '@/components/customers/cards/SalesCard';
import PrivacyCard from '@/components/customers/cards/PrivacyCard';
import MedicalCertificationCard from '@/components/customers/cards/MedicalCertificationCard';
import MembershipFeeCard from '@/components/customers/cards/MembershipFeeCard';
import SportsRegistrationCard from '@/components/customers/cards/SportsRegistrationCard';
import ActivityTimeline from '@/components/customers/ActivityTimeline';
import NotesCard from '@/components/customers/cards/NotesCard';

const GeneralTab = () => {
  return (
    <Box sx={{ px: 2 }}>
      <Grid container spacing={2}>
        {/* Colonna 1 - Anagrafica */}
        <Grid size={4}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <DetailsCard />
            </Grid>
            <Grid size={12}>
              <NotesCard />
            </Grid>
          </Grid>
        </Grid>

        {/* Colonna 2 - Attività e Vendite */}
        <Grid size={4}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <SubscriptionsCard />
            </Grid>
            <Grid size={12}>
              <SalesCard />
            </Grid>
          </Grid>
        </Grid>

        {/* Colonna 3 - Documenti e Status */}
        <Grid size={4}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <MembershipFeeCard />
            </Grid>
            <Grid size={12}>
              <SportsRegistrationCard />
            </Grid>
            <Grid size={12}>
              <MedicalCertificationCard />
            </Grid>
            <Grid size={12}>
              <PrivacyCard />
            </Grid>
            <Grid size={12}>
              <ActivityTimeline />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralTab
