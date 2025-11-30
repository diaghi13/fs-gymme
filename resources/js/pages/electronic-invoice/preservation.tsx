import React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PreservationDashboard, { PreservationStats } from '@/components/electronic-invoice/PreservationDashboard';
import { Container } from '@mui/material';

interface PreservationPageProps extends PageProps {
  stats: PreservationStats;
}

export default function PreservationPage({ auth, stats, currentTenantId }: PreservationPageProps) {
  return (
    <AppLayout
      user={auth.user}
      title="Conservazione Sostitutiva"
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <PreservationDashboard stats={stats} tenantId={currentTenantId} />
      </Container>
    </AppLayout>
  );
}

