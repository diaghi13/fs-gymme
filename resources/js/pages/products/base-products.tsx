import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Alert, Box, Grid, Tab } from '@mui/material';
import AppLayout from '@/layouts/AppLayout';
import { AutocompleteOptions, BaseProduct, PageProps, ProductListItem } from '@/types';
import ProductListCard from '@/components/products/ProductListCard';
import MyCard from '@/components/ui/MyCard';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import GeneralTab from '@/components/products/base-product/GeneralTab';
import ScheduleTab from '@/components/products/base-product/ScheduleTab';
import SaleTab from '@/components/products/base-product/SaleTab';
import { useSearchParams } from '@/hooks/useSearchParams';

const tabs = {
  baseProductTabs: [
    { label: 'Generale', value: '1', name: 'general' },
    { label: 'Orari', value: '2', name: 'schedule' },
    { label: 'Vendita', value: '3', name: 'sale' }
  ]
};

export interface BaseProductPageProps extends PageProps {
  products: Array<ProductListItem>;
  product?: BaseProduct;
  vatRateOptions?: AutocompleteOptions<number>;
}

export default function BaseProductPage({ auth, products, product }: BaseProductPageProps) {
  const tab = useSearchParams('tab')?.toString();
  const title = 'Prodotti base';
  const [tabValue, setTabValue] = React.useState(tab || '1');
  const isNew = !product?.id;

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    history.pushState({}, '', `${location.pathname}?tab=${newValue}`);

    setTabValue(newValue);
  };

  function handleSelect(selectedProduct: ProductListItem) {
    router.get(
      route('base-products.show', selectedProduct.id),
      undefined,
      { preserveState: true }
    );
    setTabValue('1');
  }

  function handleCreate() {
    router.get(
      route('base-products.create'),
      undefined,
      { preserveState: true }
    );
  }

  function handleDismiss() {
    router.get(
      route('base-products.index'),
      undefined,
      { preserveState: true }
    );
  }

  return (
    <AppLayout user={auth.user}>
      <Head><title>{title}</title></Head>

      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={4}>
          <ProductListCard
            products={products}
            onSelect={handleSelect}
            selectedId={null}
            onCreate={handleCreate}
            title="Prodotti base"
          />
        </Grid>
        <Grid size={8}>
          {product && (
            <MyCard sx={{ p: 0 }} title={product.name} bgColor={product.color}>
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                <TabContext value={tabValue}>
                  <TabList
                    onChange={handleTabChange}
                    aria-label="lab API tabs example"
                    orientation={'vertical'}
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                  >
                    <Tab label="Generale" value="1" />
                    {!isNew && tabs.baseProductTabs.slice(1).map(
                      (tab, index) => <Tab key={index} label={tab.label} value={tab.value} />
                    )}

                  </TabList>
                  <TabPanel value="1" sx={{ width: '100%' }}>
                    {!product.visible && (
                      <Box sx={{ mb: 2 }}>
                        <Alert severity="warning">Questo prodotto non è visibile nelle liste</Alert>
                      </Box>
                    )}
                    <GeneralTab product={product} onDismiss={handleDismiss} />
                  </TabPanel>

                  {!isNew && (
                    <>
                      <TabPanel value="2" sx={{ width: '100%' }}>
                        <ScheduleTab product={product} onDismiss={handleDismiss} />
                      </TabPanel>
                      <TabPanel value="3" sx={{ width: '100%' }}>
                        <SaleTab product={product} onDismiss={handleDismiss} />
                      </TabPanel>
                    </>
                  )}

                </TabContext>
              </Box>
            </MyCard>
          )}
        </Grid>
      </Grid>
    </AppLayout>
  );
};
