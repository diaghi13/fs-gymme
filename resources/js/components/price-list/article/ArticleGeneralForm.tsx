import React, { useState } from 'react';
import { Button, Divider, Grid, Typography, Alert, Box } from '@mui/material';
import { Form, Formik, FormikConfig, FormikProps } from 'formik';
import * as Yup from 'yup';
import TextField from '@/components/ui/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import ColorInput from '@/components/ui/ColorInput';
import { router, usePage } from '@inertiajs/react';
import {
  AutocompleteOption,
  AutocompleteOptions, PageProps, PriceList,
  PriceListArticle,
  PriceListFolder,
  PriceListFolderTree,
  PriceListMembershipFee, VatRate
} from '@/types';
import Autocomplete from '@/components/ui/Autocomplete';
import FolderPriceListDialog from '@/components/price-list/FolderPriceListDialog';
import { ARTICLE, MEMBERSHIP } from '@/pages/price-lists/price-lists';
import MoneyTextField from '@/components/ui/MoneyTextField';

export type FormikValues = {
  name: string;
  type: string;
  color: string;
  saleable: boolean;
  parent_id: number | string | null;
  vat_rate: number | AutocompleteOption<number> | null;
  price: string | number;
  duration_months?: number;
}

interface ArticleGeneralFormProps {
  priceList: PriceListArticle | PriceListMembershipFee;
  priceListOptions: PriceList[]
  priceListOptionsTree: Array<PriceListFolderTree>;
  vatCodes: VatRate[],
  ref: React.RefObject<FormikProps<FormikValues>>;
}

export default function ArticleGeneralForm(
  {
    priceList,
    priceListOptions,
    vatCodes,
    priceListOptionsTree,
    ref
  }: ArticleGeneralFormProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const page = usePage<PageProps>().props;

  const isArticle = priceList.type === ARTICLE;
  const isMembership = priceList.type === MEMBERSHIP;

  const initialValues = {
    name: priceList.name ?? '',
    type: priceList.type,
    color: priceList.color ?? (isArticle ? '#FF9800' : '#9C27B0'),
    saleable: priceList.saleable ?? true,
    parent_id: priceList.parent_id ?? null,
    vat_rate: priceList.vat_rate_id ? vatCodes.find(item => item.value === priceList.vat_rate_id)! : null,
    price: priceList.price ?? ''
  };

  const formik: FormikConfig<FormikValues> = {
    initialValues: isArticle
      ? initialValues
      : { ...initialValues, duration_months: priceList.duration_months ?? 12 },
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
      duration_months: isMembership
        ? Yup.number()
            .required('La durata è obbligatoria')
            .min(1, 'La durata deve essere almeno 1 mese')
            .max(120, 'La durata massima è 120 mesi')
        : Yup.number().nullable(),
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
          route(priceList.type === ARTICLE ? 'app.price-lists.articles.store' : 'app.price-lists.memberships.store', { tenant: page.currentTenantId}),
          { ...values, vat_rate_id },
          { preserveState: false }
        );
      } else {
        router.patch(
          route(priceList.type === ARTICLE ? 'app.price-lists.articles.update' : 'app.price-lists.memberships.update',
            priceList.type === ARTICLE ? { article: priceList.id, tenant: page.currentTenantId } : { membership: priceList.id, tenant: page.currentTenantId }
          ),
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
                {isArticle ? <ShoppingCartIcon /> : <CardMembershipIcon />}
                Configurazione {isArticle ? 'Articolo' : 'Membership'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {isArticle
                  ? 'Configura un prodotto fisico o servizio singolo vendibile in reception'
                  : 'Configura una quota associativa con durata mensile'}
              </Typography>

              <Grid container spacing={3}>
                <Grid size={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>{isArticle ? 'Articolo:' : 'Membership:'}</strong> {isArticle
                        ? 'Prodotto o servizio vendibile singolarmente (es: integratori, abbigliamento, servizi extra)'
                        : 'Quota associativa periodica con rinnovo mensile (es: quota tesseramento annuale)'
                      }
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
                    label={`Nome ${isArticle ? "dell'articolo" : 'della membership'}`}
                    name="name"
                    placeholder={isArticle ? "Es: Proteina Whey 1kg, T-shirt, Asciugamano" : "Es: Quota Associativa Annuale"}
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

                {isMembership && (
                  <>
                    <Grid size={12}>
                      <Divider />
                    </Grid>

                    <Grid size={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Durata
                      </Typography>
                    </Grid>

                    <Grid size={6}>
                      <TextField
                        label="Durata in mesi"
                        name="duration_months"
                        type="number"
                        helperText="Durata della membership in mesi"
                      />
                    </Grid>
                  </>
                )}

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
                    {isMembership && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Durata:</strong> {values.duration_months || 0} mesi
                      </Typography>
                    )}
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
};
