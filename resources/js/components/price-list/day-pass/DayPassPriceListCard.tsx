import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import MyCard from '@/components/ui/MyCard';
import React, { useRef } from 'react';
import {
  PriceList,
  PriceListDayPass,
  PriceListFolderTree,
  VatRate
} from '@/types';
import { FormikProps } from 'formik';
import SaleForm from '@/components/price-list/subscription/SaleForm';
import DayPassGeneralForm, { FormikValues } from '@/components/price-list/day-pass/DayPassGeneralForm';

interface DayPassPriceListCardProps {
  priceList: PriceListDayPass;
  priceListOptions: PriceList[];
  priceListOptionsTree: Array<PriceListFolderTree>;
  vatRateOptions: VatRate[];
}

export default function DayPassPriceListCard({
  priceList,
  priceListOptions,
  vatRateOptions,
  priceListOptionsTree
}: DayPassPriceListCardProps) {
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
    <MyCard sx={{ p: 0 }} title={priceList.name ?? 'Nuovo Day Pass'} bgColor={priceList.color}>
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
            <DayPassGeneralForm
              priceList={priceList}
              priceListOptions={priceListOptions}
              vatCodes={vatRateOptions}
              priceListOptionsTree={priceListOptionsTree}
              ref={form}
            />
          </TabPanel>
          <TabPanel value="2" sx={{ width: '100%' }}>
            <SaleForm priceList={priceList} />
          </TabPanel>
        </TabContext>
      </Box>
    </MyCard>
  );
}
