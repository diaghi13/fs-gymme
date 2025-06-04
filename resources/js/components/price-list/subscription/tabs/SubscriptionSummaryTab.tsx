import * as React from 'react';
import { PriceListSubscription } from '@/types';

interface SubscriptionSummaryTabProps {
  priceList: PriceListSubscription;
}

const SubscriptionSummaryTab : React.FC<SubscriptionSummaryTabProps> = ({priceList}) => {
  return (
    <div>
      <h2>Subscription Summary</h2>
      <p>Name: {priceList.name}</p>
      <p>Color: {priceList.color}</p>
      <p>Vendibile: {priceList.saleable ? 'Yes' : 'No'}</p>
      <p>Parent ID: {priceList.parent_id}</p>
      {/* Add more fields as necessary */}
    </div>
 );
};

export default SubscriptionSummaryTab
