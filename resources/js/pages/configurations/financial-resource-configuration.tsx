import * as React from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/layouts/configurations/Layout';
import { FinancialResource, PageProps } from '@/types';
import { Grid, Alert, Typography, Box } from '@mui/material';
import FinancialResourcesCard from '@/components/configurations/FinancialResourcesCard';
import MyCard from '@/components/ui/MyCard';
import { InfoIcon } from 'lucide-react';

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
      <Head>
        <title>Configurazione Risorse Finanziarie</title>
      </Head>

      <Grid container spacing={2}>
        {/* Info Alert */}
        <Grid size={12}>
          <Alert severity="info" icon={<InfoIcon size={20} />}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Le risorse finanziarie sono obbligatorie per le vendite
              </Typography>
              <Typography variant="body2">
                Ogni vendita deve essere associata a una risorsa finanziaria (conto bancario, cassa, POS, etc.)
                per tracciare il flusso di cassa. Assicurati di configurare almeno una risorsa e impostala come default.
              </Typography>
            </Box>
          </Alert>
        </Grid>

        <Grid size={12}>
          <FinancialResourcesCard financialResources={financialResources} />
        </Grid>

        <Grid size={12}>
          <MyCard title="Condizioni di pagamento">
            {/* TODO: Implementare gestione condizioni di pagamento */}
          </MyCard>
        </Grid>

        <Grid size={12}>
          <MyCard title="Metodi di pagamento">
            {/* TODO: Implementare gestione metodi di pagamento */}
          </MyCard>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default FinancialResourceConfiguration;
