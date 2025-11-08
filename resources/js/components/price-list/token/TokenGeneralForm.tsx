import React, { useState } from 'react';
import { Button, Divider, Grid, Box, Typography, Chip } from '@mui/material';
import { Form, Formik, FormikConfig, FormikProps } from 'formik';
import TextField from '@/components/ui/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import Select from '@/components/ui/Select';
import FormikSaveButton from '@/components/ui/FormikSaveButton';
import ColorInput from '@/components/ui/ColorInput';
import { router, usePage } from '@inertiajs/react';
import {
  PriceList,
  PriceListToken,
  PriceListFolder,
  PriceListFolderTree,
  VatRate
} from '@/types';
import Autocomplete from '@/components/ui/Autocomplete';
import FolderPriceListDialog from '@/components/price-list/FolderPriceListDialog';
import MoneyTextField from '@/components/ui/MoneyTextField';
import TokenProductSelector from '@/components/price-list/token/TokenProductSelector';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import PriceListActions from '@/components/price-list/PriceListActions';

export type FormikValues = {
  name: string;
  type: string;
  color: string;
  saleable: boolean;
  parent_id: number | string | null;
  vat_rate: number | VatRate | null;
  price: string | number;
  token_quantity: number;
  validity_days: number | null;
  applicable_products: number[];
  all_products: boolean;
}

interface TokenGeneralFormProps {
  priceList: PriceListToken;
  priceListOptions: PriceList[];
  priceListOptionsTree: Array<PriceListFolderTree>;
  vatCodes: VatRate[];
  ref: React.RefObject<FormikProps<FormikValues>>;
}

export default function TokenGeneralForm({
  priceList,
  priceListOptions,
  vatCodes,
  priceListOptionsTree,
  ref
}: TokenGeneralFormProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const page = usePage<PriceListPageProps>().props;
  const { baseProducts, courseProducts, bookableServices } = page;

  const formik: FormikConfig<FormikValues> = {
    initialValues: {
      name: priceList.name ?? '',
      type: priceList.type,
      color: priceList.color ?? '#2196F3',
      saleable: priceList.saleable ?? true,
      parent_id: priceList.parent_id ?? null,
      vat_rate: priceList.vat_rate_id ? vatCodes.find(item => (item as any).value === priceList.vat_rate_id)! : null,
      price: priceList.price ?? '',
      token_quantity: priceList.token_quantity ?? 10,
      validity_days: priceList.validity_days ?? 365,
      applicable_products: priceList.settings?.usage?.applicable_to ?? [],
      all_products: priceList.settings?.usage?.all_products ?? false
    },
    onSubmit: (values) => {
      const vat_rate_id = values.vat_rate && typeof values.vat_rate !== 'number'
        ? (values.vat_rate as any).value
        : values.vat_rate;

      // Omit vat_rate from values to avoid type mismatch
      const { vat_rate: _vat_rate, ...submitValues } = values;

      if (!priceList.id) {
        router.post(
          route('app.price-lists.tokens.store', { tenant: page.currentTenantId }),
          { ...submitValues, vat_rate_id },
          { preserveState: false }
        );
      } else {
        router.patch(
          route('app.price-lists.tokens.update', { token: priceList.id, tenant: page.currentTenantId }),
          { ...submitValues, vat_rate_id },
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

        return (
          <Form>
            <PriceListActions
              priceListId={priceList.id}
              priceListType={priceList.type}
              tenantId={page.currentTenantId}
            />

            <Grid container spacing={4}>
              <Grid size={12}>
                <TextField label={'Nome'} name={'name'} />
              </Grid>
              <Grid size={6} display={'flex'} alignItems={'center'}>
                <FolderIcon sx={{ mr: 1 }} fontSize={'medium'} />
                <Select name={'parent_id'} label={'Listino'} options={priceListOptions} disabled />
                <Button
                  sx={{ ml: 2, px: 3 }}
                  variant={'contained'}
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
              <Grid size={6} />
              <Grid size={12}>
                <ColorInput label={'Colore'} name={'color'} />
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <Autocomplete
                  label={'Reparto fiscale'}
                  name={'vat_rate'}
                  options={vatCodes}
                />
              </Grid>
              <Grid size={6}>
                <MoneyTextField
                  label={'Prezzo'}
                  name={'price'}
                />
              </Grid>
              <Grid size={6} />
              <Grid size={6}>
                <TextField
                  label={'Quantità token/ingressi'}
                  name={'token_quantity'}
                  type={'number'}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label={'Validità (giorni)'}
                  name={'validity_days'}
                  type={'number'}
                  helperText={'Lascia vuoto per nessuna scadenza'}
                />
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Prodotti applicabili
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Seleziona i prodotti per cui questo token può essere utilizzato
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setProductSelectorOpen(true)}
                  fullWidth
                >
                  {values.all_products
                    ? '✓ Tutti i prodotti'
                    : values.applicable_products.length > 0
                      ? `${values.applicable_products.length} prodotto/i selezionato/i`
                      : 'Seleziona prodotti'}
                </Button>

                {!values.all_products && values.applicable_products.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {values.applicable_products.map((productId) => {
                      // Find product in all available products
                      const allProducts = [
                        ...(baseProducts || []),
                        ...(courseProducts || []),
                        ...(bookableServices || [])
                      ];
                      const product = allProducts.find(p => p.id === productId);

                      if (!product) return null;

                      const isBookable = product.type === 'bookable_service' ||
                                        product.type === 'App\\Models\\Product\\BookableService';

                      return (
                        <Chip
                          key={productId}
                          label={product.name}
                          onDelete={() => {
                            setFieldValue(
                              'applicable_products',
                              values.applicable_products.filter(id => id !== productId)
                            );
                          }}
                          icon={isBookable ? <EventAvailableIcon /> : undefined}
                          color={isBookable ? 'secondary' : 'default'}
                        />
                      );
                    })}
                  </Box>
                )}

                <TokenProductSelector
                  open={productSelectorOpen}
                  onClose={() => setProductSelectorOpen(false)}
                  baseProducts={baseProducts || []}
                  courseProducts={courseProducts || []}
                  bookableServices={bookableServices || []}
                  selectedProducts={values.applicable_products}
                  allProductsSelected={values.all_products}
                  onSelect={(productId) => {
                    if (values.applicable_products.includes(productId)) {
                      setFieldValue(
                        'applicable_products',
                        values.applicable_products.filter(id => id !== productId)
                      );
                    } else {
                      setFieldValue(
                        'applicable_products',
                        [...values.applicable_products, productId]
                      );
                    }
                  }}
                  onToggleAll={() => {
                    setFieldValue('all_products', !values.all_products);
                    if (!values.all_products) {
                      setFieldValue('applicable_products', []);
                    }
                  }}
                />
              </Grid>
              <Grid size={12}>
                <Button onClick={() => {
                  setFieldValue('saleable', !values.saleable);
                }}>
                  {values.saleable
                    ? 'Disabilita la vendita'
                    : 'Abilita la vendita'}
                </Button>
              </Grid>
              <Grid size={12} sx={{ textAlign: 'end' }}>
                <Button size="small" sx={{ marginRight: 2 }} onClick={() => {
                }}>Annulla</Button>
                <FormikSaveButton />
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}
