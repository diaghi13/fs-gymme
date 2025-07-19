import * as React from 'react';
import { Stack, Typography } from '@mui/material';
import format from '@/support/format';
import MyCard from '@/components/ui/MyCard';
import { Sale } from '@/types';

interface SaleHeaderCardProps {
  sale: Sale;
}

const SaleHeaderCard : React.FC<SaleHeaderCardProps> = ({sale}) => {
  return (
    <MyCard sx={{ height: '100%' }} title={'Testata'}>
      <Stack spacing={4}>
        <Typography>Data inserimento: {format(sale.date, 'dd/MM/yyyy')}</Typography>
        <Typography>Struttura: La mia palestra</Typography>
        <Typography>Cliente: {sale.customer?.full_name}</Typography>
      </Stack>
    </MyCard>
 );
};

export default SaleHeaderCard
