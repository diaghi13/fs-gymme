import * as React from 'react';
import { Sale } from '@/types';
import { Stack, Typography } from '@mui/material';
import MyCard from '@/components/ui/MyCard';

interface SaleCustomerCardProps {
  sale: Sale;
}

const SaleCustomerCard : React.FC<SaleCustomerCardProps> = ({sale}) => {
  return (
    <MyCard title="Cliente">
      <Stack spacing={2}>
        <Typography variant="body1">{sale.customer?.full_name}</Typography>
        <Typography variant="body1">C.F.: {sale.customer?.tax_id_code}</Typography>
        <Stack spacing={1}>
          <Typography>{sale.customer?.street}, {sale.customer?.number}</Typography>
          <Typography>{sale.customer?.city}, {sale.customer?.zip}, {sale.customer?.province}</Typography>
          <Typography>{sale.customer?.country}</Typography>
        </Stack>
      </Stack>
    </MyCard>
 );
};

export default SaleCustomerCard
