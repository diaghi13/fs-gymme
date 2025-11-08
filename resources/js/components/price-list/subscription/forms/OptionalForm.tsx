import React from 'react';
import { Form } from 'formik';
import { Button, Grid, Typography, Alert, Box, Divider } from '@mui/material';
import SubscriptionTable from '@/components/price-list/subscription/content-table/SubscriptionTable';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';

interface SubscriptionGeneralFormProps {
  onDismiss: () => void;
}

const OptionalForm: React.FC<SubscriptionGeneralFormProps> = ({ onDismiss }) => {
  const { currentTenantId } = usePage<PriceListPageProps>().props;

  return (
    <Form>
      <Box>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PlaylistAddIcon />
          Contenuti Opzionali
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configura contenuti opzionali che possono essere aggiunti all'abbonamento
        </Typography>

        <Grid container spacing={3}>
          <Grid size={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Contenuti Opzionali:</strong> Prodotti, servizi o quote associative che possono essere aggiunti facoltativamente all'abbonamento base.
                Ogni contenuto opzionale ha un costo aggiuntivo.
              </Typography>
            </Alert>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" gutterBottom>
              Tabella contenuti opzionali
            </Typography>
          </Grid>

          <Grid size={12}>
            <SubscriptionTable contentType={'optional'} />
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => router.get(route('app.price-lists.index', { tenant: currentTenantId }))}
            >
              Annulla
            </Button>
            <FormikSaveButton />
          </Grid>
        </Grid>
      </Box>
    </Form>
  );
};

export default OptionalForm;
