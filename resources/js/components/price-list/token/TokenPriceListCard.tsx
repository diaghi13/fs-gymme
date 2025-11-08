import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import MyCard from '@/components/ui/MyCard';
import React, { useRef } from 'react';
import {
  PriceList,
  PriceListToken,
  PriceListFolderTree,
  VatRate
} from '@/types';
import { FormikProps } from 'formik';
import SaleForm from '@/components/price-list/subscription/SaleForm';
import TokenGeneralForm, { FormikValues } from '@/components/price-list/token/TokenGeneralForm';
import TokenBookingTab from '@/components/price-list/token/TokenBookingTab';
import TokenValidityTab from '@/components/price-list/token/TokenValidityTab';

interface TokenPriceListCardProps {
  priceList: PriceListToken;
  priceListOptions: PriceList[];
  priceListOptionsTree: Array<PriceListFolderTree>;
  vatRateOptions: VatRate[];
}

export default function TokenPriceListCard({
  priceList,
  priceListOptions,
  vatRateOptions,
  priceListOptionsTree
}: TokenPriceListCardProps) {
  const [value, setValue] = React.useState('1');
  const form = useRef<FormikProps<FormikValues>>({} as FormikProps<FormikValues>);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (form.current?.dirty) {
      alert('Salva le modifiche prima di cambiare scheda');
      return;
    }

    setValue(newValue);
  };

  return (
    <MyCard sx={{ p: 0 }} title={priceList.name ?? 'Nuovo Token/Carnet'} bgColor={priceList.color}>
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <TabContext value={value}>
          <TabList
            onChange={handleChange}
            aria-label="Token tabs"
            orientation={'vertical'}
            sx={{ borderRight: 1, borderColor: 'divider' }}
          >
            <Tab label="Generale" value="1" />
            {priceList?.id && <Tab label="Prenotazioni" value="2" />}
            {priceList?.id && <Tab label="Validità" value="3" />}
            {priceList?.id && <Tab label="Vendita" value="4" />}
          </TabList>
          <TabPanel value="1" sx={{ width: '100%' }}>
            <TokenGeneralForm
              priceList={priceList}
              priceListOptions={priceListOptions}
              vatCodes={vatRateOptions}
              priceListOptionsTree={priceListOptionsTree}
              ref={form}
            />
          </TabPanel>
          <TabPanel value="2" sx={{ width: '100%' }}>
            <TokenBookingTab priceList={priceList} />
          </TabPanel>
          <TabPanel value="3" sx={{ width: '100%' }}>
            <TokenValidityTab priceList={priceList} />
          </TabPanel>
          <TabPanel value="4" sx={{ width: '100%' }}>
            <SaleForm priceList={priceList} />
          </TabPanel>
        </TabContext>
      </Box>
    </MyCard>
  );
}
