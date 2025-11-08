import React from 'react';
import { Box, IconButton, Stack, Tab, Tooltip } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import MyCard from '@/components/ui/MyCard';

import UndoIcon from '@mui/icons-material/Undo';
import FolderGeneralForm from '@/components/price-list/folder/FolderGeneralForm';
import DeleteIconButton from '@/components/ui/DeleteIconButton';
import { usePage } from '@inertiajs/react';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import SaleForm from '@/components/price-list/subscription/SaleForm';

export default function FolderPriceListCard() {
  const { priceList } = usePage<PriceListPageProps>().props;
  const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <MyCard sx={{ p: 0 }} title={priceList?.name ?? 'Nuova Cartella'}>
      {priceList?.id && (
        <Stack display={'flex'} flexDirection={'row'} justifyContent={'flex-end'}>
          <Tooltip title="Indietro">
            <IconButton>
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <DeleteIconButton
            routeName="price-lists.folders.destroy"
            urlParams={[
              { key: 'folder', value: priceList.id }
            ]}
          />
        </Stack>
      )}
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
