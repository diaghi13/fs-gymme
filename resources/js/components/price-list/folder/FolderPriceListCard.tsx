import React from 'react';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import MyCard from '@/components/ui/MyCard';
import FolderGeneralForm from '@/components/price-list/folder/FolderGeneralForm';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import SaleForm from '@/components/price-list/subscription/SaleForm';
import PriceListCardActions from '@/components/price-list/PriceListCardActions';

export default function FolderPriceListCard() {
  const { priceList, currentTenantId } = usePage<PriceListPageProps & PageProps>().props;
  const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <MyCard
      sx={{ p: 0 }}
      title={priceList?.name ?? 'Nuova Cartella'}
      action={priceList ? (
        <PriceListCardActions
          priceListId={priceList.id}
          priceListType={priceList.type}
          tenantId={currentTenantId}
        />
      ) : undefined}
    >
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <TabContext value={value}>
          <TabList
            onChange={handleChange}
            aria-label="lab API tabs example"
            orientation={'vertical'}
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            {priceList && <Tab label="Generale" value="1" />}
            {priceList?.id && <Tab label="Vendita" value="2" />}
          </TabList>
          <TabPanel value="1" sx={{ width: '100%' }}>
            <FolderGeneralForm />
          </TabPanel>
          <TabPanel value="2" sx={{ width: '100%' }}>
            <SaleForm priceList={priceList!} />
          </TabPanel>
        </TabContext>
      </Box>
    </MyCard>
  );
};
