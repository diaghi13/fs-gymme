import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import MyCard from '@/components/ui/MyCard';
import React, { useRef } from 'react';
import {
  PageProps,
  AutocompleteOptions,
  PriceListToken,
  PriceListFolderTree
} from '@/types';
import { FormikProps } from 'formik';
import SaleForm from '@/components/price-list/subscription/SaleForm';
import TokenGeneralForm, { FormikValues } from '@/components/price-list/token/TokenGeneralForm';
import TokenBookingTab from '@/components/price-list/token/TokenBookingTab';
import TokenValidityTab from '@/components/price-list/token/TokenValidityTab';
import PriceListCardActions from '@/components/price-list/PriceListCardActions';
import { usePage } from '@inertiajs/react';

interface TokenPriceListCardProps {
  priceList: PriceListToken;
  priceListOptions: AutocompleteOptions<number>;
  priceListOptionsTree: Array<PriceListFolderTree>;
  vatRateOptions: AutocompleteOptions<number>;
}

export default function TokenPriceListCard({
  priceList,
  priceListOptions,
  vatRateOptions,
  priceListOptionsTree
}: TokenPriceListCardProps) {
  const [value, setValue] = React.useState('1');
  const form = useRef<FormikProps<FormikValues>>({} as FormikProps<FormikValues>);
  const { currentTenantId } = usePage<PageProps>().props;

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (form.current?.dirty) {
      alert('Salva le modifiche prima di cambiare scheda');
      return;
    }

    setValue(newValue);
  };

  const handleUndo = () => {
    if (form.current?.resetForm) {
      form.current.resetForm();
    }
  };

  return (
    <MyCard
      sx={{ p: 0 }}
      title={priceList.name ?? 'Nuovo Token/Carnet'}
      bgColor={priceList.color}
      action={
        <PriceListCardActions
          //ppriceListId={priceList.id}
          priceListType={priceList.type}
          tenantId={currentTenantId}
          onUndo={handleUndo}
        />
      }
    >
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
