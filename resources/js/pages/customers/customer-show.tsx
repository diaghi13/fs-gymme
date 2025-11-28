import * as React from 'react';
import { Customer, PageProps, PaymentMethod } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import useTabLocation from '@/hooks/useTabLocation';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { AppBar, Box, Button, Stack, Tab, Typography } from '@mui/material';
import GeneralTab from '@/components/customers/tabs/GeneralTab';
import SalesTab from '@/components/customers/tabs/SalesTab';
import SubscriptionsTab from '@/components/customers/tabs/SubscriptionsTab';
import ExtensionsTab from '@/components/customers/tabs/ExtensionsTab';
import DocumentsTab from '@/components/customers/tabs/DocumentsTab';
import MeasurementsTab from '@/components/customers/tabs/MeasurementsTab';
import AlertsCard from '@/components/customers/cards/AlertsCard';

export interface CustomerShowProps extends PageProps {
  customer: Customer;
  payment_methods: PaymentMethod[];
  price_lists: Array<{
    id: number;
    name: string;
    price: number;
    entrances?: number;
    days_duration?: number;
    months_duration?: number;
  }>;
}

const CustomerShow: React.FC<CustomerShowProps> = ({ auth, customer }) => {
  const { tabValue, handleTabChange } = useTabLocation('general');
  const [isCustomerHidden, setIsCustomerHidden] = React.useState(customer.data_retention_until && new Date(customer.data_retention_until) < new Date());

  if (isCustomerHidden) {
    return (
      <AppLayout user={auth.user}>
        <Box sx={{ p: 2 }}>
          <Stack spacing={2} alignItems="center" justifyContent="center">
            <Typography variant="h5">Questo cliente è stato oscurato per scadenza della conservazione dei dati.</Typography>
            <Typography>Clicca sul pulsante qui sotto per abilitarlo temporaneamente e aggiornare i dati.</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsCustomerHidden(false)}
            >
              Mostra cliente
            </Button>
          </Stack>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={auth.user}>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <AppBar position="static">
            <TabList
              onChange={handleTabChange}
              aria-label="Customer tabs"
              textColor="inherit"
              indicatorColor="secondary"
              variant="scrollable"
              scrollButtons={'auto'}
            >
              <Tab label="Scheda cliente" value="general" />
              <Tab label="Vendite e pagamenti" value="sales" />
              <Tab label="Abbonamenti" value="subscriptions" />
              <Tab label="Sospensioni e proroghe" value="extensions" />
              <Tab label="Documenti" value="documents" />
              <Tab label="Misurazioni" value="measures" />
            </TabList>
          </AppBar>
        </Box>

        {/* Alert Card - Visible across all tabs */}
        <Box sx={{ p: 2, pb: 0 }}>
          <AlertsCard />
        </Box>

        <TabPanel value="general" sx={{ p: 0 }}>
          <GeneralTab />
        </TabPanel>
        <TabPanel value="sales" sx={{ p: 0 }}>
          <SalesTab />
        </TabPanel>
        <TabPanel value="subscriptions" sx={{ p: 0 }}>
          <SubscriptionsTab />
        </TabPanel>
        <TabPanel value="extensions" sx={{ p: 0 }}>
          <ExtensionsTab />
        </TabPanel>
        <TabPanel value="documents" sx={{ p: 0 }}>
          <DocumentsTab />
        </TabPanel>
        <TabPanel value="measures" sx={{ p: 0 }}>
          <MeasurementsTab />
        </TabPanel>
      </TabContext>
    </AppLayout>
  );
};

export default CustomerShow;
