import * as React from 'react';
import { Customer, PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import useTabLocation from '@/hooks/useTabLocation';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { AppBar, Box, Button, Stack, Tab, Typography } from '@mui/material';
import GeneralTab from '@/components/customers/tabs/GeneralTab';

export interface CustomerShowProps extends PageProps {
  customer: Customer;
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
              <Tab label="Sospensioni e proroghe" value="extensions" />
              <Tab label="Documenti" value="documents" />
              <Tab label="Misurazioni" value="measures" />
            </TabList>
          </AppBar>
        </Box>
        {/* Tab Panels can be added here */}
        {/* Example: */}
        {/* <TabPanel value="general">General Content</TabPanel> */}
        <TabPanel value="general" sx={{ p: 0 }}>
          <GeneralTab />
        </TabPanel>
        <TabPanel value="sales" sx={{ p: 0 }}>
          Sales and Payments
        </TabPanel>
        <TabPanel value="extensions" sx={{ p: 0 }}>
          Extensions and Suspensions
        </TabPanel>
        <TabPanel value="documents" sx={{ p: 0 }}>
          Documents
        </TabPanel>
        <TabPanel value="measures" sx={{ p: 0 }}>
          Measures
        </TabPanel>
      </TabContext>
    </AppLayout>
  );
};

export default CustomerShow;
