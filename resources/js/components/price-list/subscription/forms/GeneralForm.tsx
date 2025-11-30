import * as React from 'react';
import { useState } from 'react';
import { Form, useFormikContext } from 'formik';
import { Button, Divider, Grid, Typography, Alert, Box } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import Select from '@/components/ui/Select';
import FolderPriceListDialog from '@/components/price-list/FolderPriceListDialog';
import ColorInput from '@/components/ui/ColorInput';
import SubscriptionTable from '@/components/price-list/subscription/content-table/SubscriptionTable';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import { usePage } from '@inertiajs/react';
import { FOLDER, PriceListPageProps } from '@/pages/price-lists/price-lists';
import { SubscriptionGeneralFormValues } from '@/components/price-list/subscription/tabs/SubscriptionGeneralTab';
import { PriceListFolder } from '@/types';

interface SubscriptionGeneralFormProps {
  onDismiss: () => void;
}

const GeneralForm: React.FC<SubscriptionGeneralFormProps> = ({ onDismiss }) => {
  const {
    priceList,
    priceListOptions,
    priceListOptionsTree,
    vatRateOptions,
    baseProducts,
    courseProducts,
    articles,
    membershipFees,
    currentTenantId
  } = usePage<PriceListPageProps>().props;

  const { values, setFieldValue } = useFormikContext<SubscriptionGeneralFormValues>();
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const toggleFolderDialogOpen = () => {
    setFolderDialogOpen(!folderDialogOpen);
  };

  const handleFolderSelect = (folder: PriceListFolder) => {
    setFieldValue('parent_id', folder.id);
    toggleFolderDialogOpen();
  };

  if (!priceListOptions || !priceListOptionsTree || !vatRateOptions || !baseProducts || !courseProducts || !membershipFees || !articles) {
    return null;
  }

  return (
    <Form>
      <Box>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CardMembershipIcon />
          Configurazione Abbonamento
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configura abbonamenti con contenuti, regole di accesso e validità
        </Typography>

        <Grid container spacing={3}>
          <Grid size={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Abbonamento:</strong> Piano ricorrente che include uno o più servizi/prodotti.
                Configura la durata, i contenuti inclusi, le regole di accesso e le restrizioni temporali.
              </Typography>
            </Alert>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" gutterBottom>
              Informazioni generali
            </Typography>
          </Grid>

          <Grid size={12}>
            <TextField label="Nome dell'abbonamento" name="name" placeholder="Es: Abbonamento Base, Premium, Mensile" />
          </Grid>

          <Grid size={6} display="flex" alignItems="center" gap={1}>
            <FolderIcon fontSize="medium" color="action" />
            <Select name="parent_id" label="Cartella" options={priceListOptions} disabled />
            <Button
              sx={{ ml: 1, px: 3 }}
              variant="contained"
              onClick={toggleFolderDialogOpen}
            >
              Seleziona
            </Button>
            <FolderPriceListDialog
              priceListOptionsTree={priceListOptionsTree}
              open={folderDialogOpen}
              onSelect={handleFolderSelect}
              onClose={toggleFolderDialogOpen}
            />
          </Grid>

          <Grid size={6}>
            <ColorInput label="Colore" name="color" />
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" gutterBottom>
              Contenuti dell'abbonamento
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Aggiungi prodotti, servizi e quote associative con regole di accesso personalizzate
            </Typography>
          </Grid>

          {priceList?.type !== FOLDER && (
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="body2" fontWeight="bold">
                Totale: € {(values.standard_content || []).reduce(
                  (acc, item) => (item && !item.isDirty) ? (item.price ? parseFloat(String(item.price)) : 0) + acc : acc,
                  0
                ).toFixed(2).replace('.', ',')}
              </Typography>
            </Grid>
          )}

          <Grid size={12}>
            <SubscriptionTable contentType={'standard'} />
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle2" gutterBottom>
              Configurazione vendita
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Abilita o disabilita la vendita di questo abbonamento
            </Typography>
            <Button
              variant={values.saleable ? 'contained' : 'outlined'}
              onClick={() => {
                setFieldValue('saleable', !values.saleable);
              }}
            >
              {values.saleable
                ? '✓ Vendita abilitata'
                : 'Vendita disabilitata'}
            </Button>
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onDismiss}
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

export default GeneralForm;
