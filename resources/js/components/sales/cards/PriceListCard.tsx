import React, { useState } from 'react';


import { PriceListFolder, PriceListSubscription, AllPriceLists, PriceListMembershipFee } from '@/types';
import axios from 'axios';

import { useFormikContext } from 'formik';
import PriceListListCard from '@/components/price-list/PriceListListCard';
import { MEMBERSHIP, SUBSCRIPTION } from '@/pages/price-lists/price-lists';
import AddSubscriptionDialog from '@/components/sales/dialogs/AddSubscriptionDialog';
import AddMembershipFeeDialog from '@/components/sales/dialogs/AddMembershipFeeDialog';
import { createCartItem, SaleRowFormValues } from '@/support/createCartItem';
import { SaleFormValues } from '@/pages/sales/sales';

export default function PriceListsCard() {
  const [subscription, setSubscription] = useState<PriceListSubscription | null>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState<boolean>(false);
  const [membershipFee, setMembershipFee] = useState<PriceListMembershipFee | null>(null);
  const [membershipFeeModalOpen, setMembershipFeeModalOpen] = useState<boolean>(false);
  const { values, setFieldValue } = useFormikContext<SaleFormValues>();

  const handleSelect = async (priceList: Exclude<AllPriceLists, PriceListFolder>) => {
    const response = await axios.get(route('api.v1.price-lists.show', { priceList: priceList.id }));
    const resData = response.data.data as Exclude<AllPriceLists, PriceListFolder>;

    if (resData.type === SUBSCRIPTION) {
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
    <React.Fragment>
      <PriceListListCard onSelect={handleSelect} />
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
    </React.Fragment>
  );
};
