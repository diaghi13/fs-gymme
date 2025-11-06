import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Alert, Box, Grid, Tab } from '@mui/material';
import AppLayout from '@/layouts/AppLayout';
import { BookableService, PageProps, ProductListItem } from '@/types';
import ProductListCard from '@/components/products/ProductListCard';
import MyCard from '@/components/ui/MyCard';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import GeneralTab from '@/components/products/bookable-service/GeneralTab';
import BookingsTab from '@/components/products/bookable-service/BookingsTab';
import AvailabilityTab from '@/components/products/bookable-service/AvailabilityTab';
import SaleTab from '@/components/products/bookable-service/SaleTab';
import { useQueryParam } from '@/hooks/useQueryParam';
import DeleteIconButton from '@/components/ui/DeleteIconButton';

const tabs = {
  bookableServiceTabs: [
    { label: 'Generale', value: '1', name: 'general' },
    { label: 'Prenotazioni', value: '2', name: 'bookings' },
    { label: 'Disponibilità', value: '3', name: 'availability' },
    { label: 'Vendita', value: '4', name: 'sale' }
  ]
};

export interface BookableServicePageProps extends PageProps {
  services: Array<ProductListItem>;
  service?: BookableService;
  currentTenantId: string;
}

export default function BookableServicePage({ auth, services, service, currentTenantId }: BookableServicePageProps) {
  const [tab, setTab] = useQueryParam('tab');
  const title = 'Servizi Prenotabili';
  const [tabValue, setTabValue] = React.useState(tab || '1');
  const isNew = !service?.id;
  const props = usePage<PageProps>().props;

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
    setTabValue(newValue);
  };

  function handleSelect(selectedService: ProductListItem) {
    router.get(
      route('app.bookable-services.show', { bookable_service: selectedService.id, tenant: props.currentTenantId }),
      undefined,
      { preserveState: true }
    );
    setTabValue('1');
  }

  function handleCreate() {
    router.get(
      route('app.bookable-services.create', { tenant: props.currentTenantId }),
      undefined,
      { preserveState: true }
    );
  }

  function handleDismiss() {
    router.get(
      route('app.bookable-services.index', { tenant: props.currentTenantId }),
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
            products={services}
            onSelect={handleSelect}
            selectedId={null}
            onCreate={handleCreate}
            title="Servizi Prenotabili"
          />
        </Grid>
        <Grid size={8}>
          {service && (
            <MyCard sx={{ p: 0 }} title={service.name} bgColor={service.color} action={
              <DeleteIconButton
                routeName="app.bookable-services.destroy"
                urlParams={[
                  {key: "tenant", value: currentTenantId },
                  {key: "bookable_service", value: service.id},
                ]} />
            }>
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                <TabContext value={tabValue}>
                  <TabList
                    onChange={handleTabChange}
                    aria-label="bookable service tabs"
                    orientation={'vertical'}
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                  >
                    <Tab label="Generale" value="1" />
                    {!isNew && tabs.bookableServiceTabs.slice(1).map(
                      (tab, index) => <Tab key={index} label={tab.label} value={tab.value} />
                    )}
                  </TabList>
                  <TabPanel value="1" sx={{ width: '100%' }}>
                    {!service.is_active && (
                      <Box sx={{ mb: 2 }}>
                        <Alert severity="warning">Questo servizio non è visibile nelle liste</Alert>
                      </Box>
                    )}
                    <GeneralTab service={service} onDismiss={handleDismiss} />
                  </TabPanel>

                  {!isNew && (
                    <>
                      <TabPanel value="2" sx={{ width: '100%' }}>
                        <BookingsTab service={service} onDismiss={handleDismiss} />
                      </TabPanel>
                      <TabPanel value="3" sx={{ width: '100%' }}>
                        <AvailabilityTab service={service} onDismiss={handleDismiss} />
                      </TabPanel>
                      <TabPanel value="4" sx={{ width: '100%' }}>
                        <SaleTab service={service} onDismiss={handleDismiss} />
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