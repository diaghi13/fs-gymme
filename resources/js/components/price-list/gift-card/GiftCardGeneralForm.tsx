import React, { useState } from 'react';
import { Button, Divider, Grid, Typography, Alert, Box } from '@mui/material';
import { Form, Formik, FormikConfig, FormikProps } from 'formik';
import * as Yup from 'yup';
import TextField from '@/components/ui/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import ColorInput from '@/components/ui/ColorInput';
import { router, usePage } from '@inertiajs/react';
import {
  AutocompleteOption,
  PageProps,
  PriceList,
  PriceListGiftCard,
  PriceListFolder,
  PriceListFolderTree,
  VatRate
} from '@/types';
import Autocomplete from '@/components/ui/Autocomplete';
import FolderPriceListDialog from '@/components/price-list/FolderPriceListDialog';
import MoneyTextField from '@/components/ui/MoneyTextField';

export type FormikValues = {
  name: string;
  type: string;
  color: string;
  saleable: boolean;
  parent_id: number | string | null;
  vat_rate: number | AutocompleteOption<number> | null;
  price: string | number;
  validity_months: number | null;
}

interface GiftCardGeneralFormProps {
  priceList: PriceListGiftCard;
  priceListOptions: PriceList[];
  priceListOptionsTree: Array<PriceListFolderTree>;
  vatCodes: VatRate[];
  ref: React.RefObject<FormikProps<FormikValues>>;
}

export default function GiftCardGeneralForm({
  priceList,
  priceListOptions,
  vatCodes,
  priceListOptionsTree,
  ref
}: GiftCardGeneralFormProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const page = usePage<PageProps>().props;

  const formik: FormikConfig<FormikValues> = {
    initialValues: {
      name: priceList.name ?? '',
      type: priceList.type,
      color: priceList.color ?? '#E91E63',
      saleable: priceList.saleable ?? true,
      parent_id: priceList.parent_id ?? null,
      vat_rate: priceList.vat_rate_id ? vatCodes.find(item => item.value === priceList.vat_rate_id)! : null,
      price: priceList.price ?? '',
      validity_months: priceList.validity_months ?? 12
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Il nome è obbligatorio')
        .max(255, 'Massimo 255 caratteri'),
      color: Yup.string()
        .required('Il colore è obbligatorio')
        .matches(/^#[0-9A-F]{6}$/i, 'Formato colore non valido'),
      parent_id: Yup.mixed()
        .nullable()
        .test('not-self', 'Non puoi selezionare se stesso come parent', (value) => {
          if (!value || !priceList.id) return true;
          return value !== priceList.id;
        }),
      vat_rate: Yup.mixed()
        .required('Il reparto fiscale è obbligatorio'),
      price: Yup.string()
        .required('Il prezzo è obbligatorio'),
      validity_months: Yup.number()
        .nullable()
        .min(1, 'La validità deve essere almeno 1 mese')
        .max(120, 'La validità massima è 120 mesi (10 anni)'),
    }),
    onSubmit: (values) => {
      let vat_rate_id = null;

      if (values.vat_rate && typeof values.vat_rate !== 'number') {
        vat_rate_id = values.vat_rate.value;
      } else {
        vat_rate_id = values.vat_rate;
      }

      if (!priceList.id) {
        router.post(
          route('app.price-lists.gift-cards.store', { tenant: page.currentTenantId }),
          { ...values, vat_rate_id },
          { preserveState: false }
        );
      } else {
        router.patch(
          route('app.price-lists.gift-cards.update', { gift_card: priceList.id, tenant: page.currentTenantId }),
          { ...values, vat_rate_id },
          { preserveState: false }
        );
      }
    },
    enableReinitialize: true
  };

  return (
    <Formik {...formik} innerRef={ref}>
      {({ values, setFieldValue }) => {
        const toggleFolderDialogOpen = () => {
          setFolderDialogOpen(!folderDialogOpen);
        };

        const handleFolderSelect = (folder: PriceListFolder) => {
          setFieldValue('parent_id', folder.id);
          toggleFolderDialogOpen();
        };

        const selectedFolder = priceListOptions.find(p => p.value === values.parent_id);

        return (
          <Form>
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CardGiftcardIcon />
                Configurazione Gift Card
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Crea buoni regalo riscattabili per servizi e prodotti
              </Typography>

              <Grid container spacing={3}>
                <Grid size={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Gift Card:</strong> Buono regalo prepagato riscattabile per servizi, prodotti o abbonamenti.
                      Perfetto come regalo per amici e familiari.
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
                  <TextField
                    label="Nome della Gift Card"
                    name="name"
                    placeholder="Es: Buono Regalo 50€, Gift Card Premium"
                  />
                </Grid>

                <Grid size={6} display="flex" alignItems="center" gap={1}>
                  <FolderIcon fontSize="medium" color="action" />
                  <Select
                    name="parent_id"
                    label="Cartella"
                    options={priceListOptions}
                    disabled
                  />
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
                    Valore e validità
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <MoneyTextField
                    label="Valore della Gift Card"
                    name="price"
                  />
                </Grid>

                <Grid size={6}>
                  <TextField
                    label="Validità (mesi)"
                    name="validity_months"
                    type="number"
                    helperText="Lascia vuoto per nessuna scadenza, oppure specifica i mesi di validità"
                  />
                </Grid>

                <Grid size={12}>
                  <Divider />
                </Grid>

                <Grid size={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fiscalità
                  </Typography>
                </Grid>

                <Grid size={12}>
                  <Autocomplete
                    label="Reparto fiscale"
                    name="vat_rate"
                    options={vatCodes}
                  />
                </Grid>

                <Grid size={12}>
                  <Divider />
                </Grid>

                <Grid size={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Riepilogo
                  </Typography>
                </Grid>

                <Grid size={12}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Nome:</strong> {values.name || 'Non specificato'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Cartella:</strong> {selectedFolder?.label || 'Nessuna cartella'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Valore:</strong> €{values.price ? Number(values.price).toFixed(2) : '0.00'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Validità:</strong> {values.validity_months ? `${values.validity_months} mesi` : 'Nessuna scadenza'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Vendibilità:</strong> {values.saleable ? 'Attivo' : 'Disabilitato'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={12}>
                  <Divider />
                </Grid>

                <Grid size={12} sx={{ textAlign: 'end', mt: 2 }}>
                  <FormikSaveButton />
                </Grid>
              </Grid>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
}
