import { Form, Formik, FormikConfig } from 'formik';
import * as Yup from 'yup';
import { Button, Grid, Alert, Typography, Divider } from '@mui/material';
import TextField from '@/components/ui/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { PriceListFolder } from '@/types';
import FolderPriceListDialog from '@/components/price-list/FolderPriceListDialog';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';

export default function FolderGeneralForm() {
  const {props: {priceList, priceListOptions, priceListOptionsTree, currentTenantId}} = usePage<PriceListPageProps>()
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  if (!priceList || !priceListOptionsTree) {
    return null;
  }

  const folder = priceList as PriceListFolder;

  const formik: FormikConfig<{
    name: string;
    saleable: boolean;
    parent_id: string | number;
  }> = {
    initialValues: {
      name: folder.name ?? '',
      saleable: folder.saleable ?? true,
      parent_id: folder.parent_id ?? ''
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Il nome è obbligatorio')
        .max(255, 'Massimo 255 caratteri'),
      parent_id: Yup.mixed()
        .nullable()
        .notRequired()
        .test('not-self', 'Una cartella non può essere genitore di se stessa', function(value) {
          // Allow empty/null values
          if (!value || value === '') return true;
          return value !== folder.id;
        }),
    }),
    onSubmit: (values) => {
      if (!folder.id) {
        router.post(
          route('app.price-lists.folders.store', { tenant: currentTenantId }),
          values,
          { preserveState: false });
      } else {
        router.put(
          route('app.price-lists.folders.update', { folder: folder.id, tenant: currentTenantId }),
          values,
          { preserveState: false }
        );
      }
    },
    enableReinitialize: true
  };

  const selectedFolder = priceListOptions?.find(p => p.value === formik.initialValues.parent_id);

  return (
    <Formik {...formik}>
      {({ values, setFieldValue }) => {

        const toggleFolderDialogOpen = () => {
          setFolderDialogOpen(!folderDialogOpen);
        };

        const handleFolderSelect = (folder: PriceListFolder) => {
          setFieldValue('parent_id', folder.id);
          toggleFolderDialogOpen();
        };

        const currentSelectedFolder = priceListOptions?.find(p => p.value === values.parent_id);

        return (
          <Form>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FolderIcon />
                  Configurazione Cartella
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Organizza i listini in modo gerarchico creando cartelle e sottocartelle
                </Typography>
              </Grid>

              <Grid size={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Cartella:</strong> Le cartelle servono ad organizzare i listini in modo gerarchico.
                    Puoi creare sottocartelle selezionando una cartella genitore.
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
                <TextField label="Nome della cartella" name="name" placeholder="Es: Abbonamenti, Servizi Extra, Promozioni" />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Cartella genitore
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Opzionale - seleziona una cartella genitore per creare una sottocartella
                </Typography>
              </Grid>

              <Grid size={6} display="flex" alignItems="center" gap={1}>
                <FolderIcon fontSize="medium" color="action" />
                <Select name="parent_id" label="Cartella genitore" options={priceListOptions} disabled />
                <Button
                  sx={{ ml: 1, px: 3 }}
                  variant="contained"
                  onClick={toggleFolderDialogOpen}
                >
                  Sfoglia
                </Button>
                <FolderPriceListDialog
                  priceListOptionsTree={priceListOptionsTree}
                  open={folderDialogOpen}
                  onSelect={handleFolderSelect}
                  onClose={toggleFolderDialogOpen}
                />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Configurazione vendita
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Le cartelle possono essere marcate come "vendibili" per permettere la vendita dei listini contenuti
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

              <Grid size={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Riepilogo
                </Typography>
              </Grid>

              <Grid size={12}>
                <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Nome:</strong> {values.name || 'Non specificato'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cartella genitore:</strong> {currentSelectedFolder?.label || 'Nessuna (cartella radice)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Vendibilità:</strong> {values.saleable ? 'Abilitata' : 'Disabilitata'}
                  </Typography>
                </div>
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
          </Form>
        );
      }}
    </Formik>
  );
};
