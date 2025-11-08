import React, { useState } from 'react';
import { Button, Divider, Grid, Typography, Alert, Box } from '@mui/material';
import { Form, Formik, FormikConfig, FormikProps } from 'formik';
import * as Yup from 'yup';
import TextField from '@/components/ui/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import ColorInput from '@/components/ui/ColorInput';
import { router, usePage } from '@inertiajs/react';
import {
  AutocompleteOption,
  PageProps,
  PriceList,
  PriceListDayPass,
  PriceListFolder,
  PriceListFolderTree,
  VatRate
} from '@/types';
import Autocomplete from '@/components/ui/Autocomplete';
import FolderPriceListDialog from '@/components/price-list/FolderPriceListDialog';
import MoneyTextField from '@/components/ui/MoneyTextField';
import PriceListActions from '@/components/price-list/PriceListActions';

export type FormikValues = {
  name: string;
  type: string;
  color: string;
  saleable: boolean;
  parent_id: number | string | null;
  vat_rate: number | AutocompleteOption<number> | null;
  price: string | number;
}

interface DayPassGeneralFormProps {
  priceList: PriceListDayPass;
  priceListOptions: PriceList[];
  priceListOptionsTree: Array<PriceListFolderTree>;
  vatCodes: VatRate[];
  ref: React.RefObject<FormikProps<FormikValues>>;
}

export default function DayPassGeneralForm({
  priceList,
  priceListOptions,
  vatCodes,
  priceListOptionsTree,
  ref
}: DayPassGeneralFormProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const page = usePage<PageProps>().props;

  const formik: FormikConfig<FormikValues> = {
    initialValues: {
      name: priceList.name ?? '',
      type: priceList.type,
      color: priceList.color ?? '#4CAF50',
      saleable: priceList.saleable ?? true,
      parent_id: priceList.parent_id ?? null,
      vat_rate: priceList.vat_rate_id ? vatCodes.find(item => item.value === priceList.vat_rate_id)! : null,
      price: priceList.price ?? ''
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
          route('app.price-lists.day-passes.store', { tenant: page.currentTenantId }),
          { ...values, vat_rate_id },
          { preserveState: false }
        );
      } else {
        router.patch(
          route('app.price-lists.day-passes.update', { day_pass: priceList.id, tenant: page.currentTenantId }),
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
                <ConfirmationNumberIcon />
                Configurazione Day Pass
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configura l'ingresso giornaliero con accesso completo alle strutture
              </Typography>

              <PriceListActions
                priceListId={priceList.id}
                priceListType={priceList.type}
                tenantId={page.currentTenantId}
              />

              <Grid container spacing={3}>
                <Grid size={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Day Pass:</strong> Ingresso valido per un'intera giornata con accesso a tutte le aree della palestra.
                      Ideale per clienti occasionali o visitatori.
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
                    label="Nome del Day Pass"
                    name="name"
                    placeholder="Es: Ingresso Giornaliero, Day Pass Weekend"
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
                    Prezzo e IVA
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <MoneyTextField
                    label="Prezzo"
                    name="price"
                  />
                </Grid>

                <Grid size={6}>
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
                      <strong>Prezzo:</strong> €{values.price ? Number(values.price).toFixed(2) : '0.00'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Vendibilità:</strong> {values.saleable ? 'Attivo' : 'Disabilitato'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={12}>
                  <Divider />
                </Grid>

                <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => router.get(route('app.price-lists.index', { tenant: page.currentTenantId }))}
                  >
                    Annulla
                  </Button>
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
