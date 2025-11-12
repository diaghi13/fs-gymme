import React, { useState } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { useFormikContext } from 'formik';
import { SaleFormValues } from '../sale-create';
import { AllPriceLists, PriceListFolder, PriceListSubscription, PriceListMembershipFee } from '@/types';
import { createCartItem, SaleRowFormValues } from '@/support/createCartItem';
import axios from 'axios';
import QuickProductSearch from '@/components/sales/QuickProductSearch';
import PriceListListCard from '@/components/price-list/PriceListListCard';
import AddSubscriptionDialog from '@/components/sales/dialogs/AddSubscriptionDialog';
import AddMembershipFeeDialog from '@/components/sales/dialogs/AddMembershipFeeDialog';
import { MEMBERSHIP, SUBSCRIPTION } from '@/pages/price-lists/price-lists';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';

export default function ProductSearch() {
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();
  const [subscription, setSubscription] = useState<PriceListSubscription | null>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState<boolean>(false);
  const [membershipFee, setMembershipFee] = useState<PriceListMembershipFee | null>(null);
  const [membershipFeeModalOpen, setMembershipFeeModalOpen] = useState<boolean>(false);

  const handleSelect = async (priceList: Exclude<AllPriceLists, PriceListFolder>) => {
    const response = await axios.get(route('api.v1.price-lists.show', { priceList: priceList.id }));
    const resData = response.data.data as Exclude<AllPriceLists, PriceListFolder>;

    if (resData.type === SUBSCRIPTION) {
      console.log('Subscription data received:', resData);
      console.log('Standard content:', resData.standard_content);
      console.log('Optional content:', resData.optional_content);
      setSubscription(resData);
      setSubscriptionModalOpen(true);
      return;
    }

    if (resData.type === MEMBERSHIP) {
      setMembershipFee(resData);
      setMembershipFeeModalOpen(true);
      return;
    }

    const cartItem = createCartItem(resData);
    await setFieldValue('sale_contents', [...values.sale_contents, cartItem]);
  };

  const handleAdd = async (item: SaleRowFormValues | SaleRowFormValues[] | undefined) => {
    if (Array.isArray(item)) {
      await setFieldValue('sale_contents', [...values.sale_contents, ...item]);
      return;
    }

    await setFieldValue('sale_contents', [...values.sale_contents, item]);
  };

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <Box sx={{ p: 2 }}>
        {/* Quick Search */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SearchIcon color="primary" />
            <Typography variant="h6">Ricerca Veloce</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Cerca prodotti per nome (F3)
          </Typography>
          <QuickProductSearch onSelect={handleSelect} />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Tree Navigation */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FolderIcon color="primary" />
            <Typography variant="h6">Esplora Listini</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Naviga attraverso le cartelle per trovare i prodotti
          </Typography>
          <PriceListListCard onSelect={handleSelect} />
        </Box>
      </Box>

      {/* Dialogs */}
      {subscription && (
        <AddSubscriptionDialog
          open={subscriptionModalOpen}
          onClose={() => {
            setSubscriptionModalOpen(false);
            setSubscription(null);
          }}
          subscription={subscription}
          onAdd={handleAdd}
        />
      )}
      {membershipFee && (
        <AddMembershipFeeDialog
          open={membershipFeeModalOpen}
          onClose={() => {
            setMembershipFeeModalOpen(false);
            setMembershipFee(null);
          }}
          membershipFee={membershipFee}
          onAdd={handleAdd}
        />
      )}
    </Paper>
  );
}
