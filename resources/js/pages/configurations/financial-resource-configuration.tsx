import * as React from 'react';
import Layout from '@/layouts/configurations/Layout';
import { FinancialResource, PageProps } from '@/types';
import { Grid } from '@mui/material';
import FinancialResourcesCard from '@/components/configurations/FinancialResourcesCard';
import MyCard from '@/components/ui/MyCard';

interface FinancialResourceConfigurationProps extends PageProps {
  financialResources: FinancialResource[];
}

const FinancialResourceConfiguration: React.FC<FinancialResourceConfigurationProps> = (
  {
    auth,
    financialResources
  }) => {

  return (
    <Layout user={auth.user}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <FinancialResourcesCard financialResources={financialResources} />
        </Grid>
        <Grid size={12}>
          <MyCard title="Condizioni di pagamento">

          </MyCard>
        </Grid>
        <Grid size={12}>
          <MyCard title="Metodi di pagamento">

          </MyCard>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default FinancialResourceConfiguration;
