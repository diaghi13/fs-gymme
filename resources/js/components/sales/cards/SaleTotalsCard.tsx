import * as React from 'react';
import { Sale } from '@/types';
import { Divider, Stack, Typography } from '@mui/material';
import { Str } from '@/support/Str';
import MyCard from '@/components/ui/MyCard';

interface SaleTotalsCardProps {
  sale: Sale;
}

const SaleTotalsCard : React.FC<SaleTotalsCardProps> = ({sale}) => {
  return (
    <MyCard title={'Totali'}>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Prezzo netto: </Typography>
        <Typography fontWeight={800}>{Str.EURO(sale.sale_summary.net_price).format()}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>IVA: </Typography>
        <Typography fontWeight={800}>{Str.EURO(sale.sale_summary.total_tax).format()}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Sconto %: </Typography>
        <Typography fontWeight={800}>{sale.sale_summary.percentage_discount}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Sconto assoluto: </Typography>
        <Typography fontWeight={800}>{Str.EURO(sale.sale_summary.absolute_discount).format()}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Prezzo totale: </Typography>
        <Typography fontWeight={800}>{Str.EURO(sale.sale_summary.gross_price).format()}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Q.tà prodotti: </Typography>
        <Typography fontWeight={800}>{sale.sale_summary.total_quantity}</Typography>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Pagato: </Typography>
        <Typography
          fontWeight={800}>{Str.EURO(sale.sale_summary.total_paid).format()}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Dovuto: </Typography>
        <Typography fontWeight={800}>{Str.EURO(sale.sale_summary.total_due).format()}</Typography>
      </Stack>
    </MyCard>
 );
};

export default SaleTotalsCard
