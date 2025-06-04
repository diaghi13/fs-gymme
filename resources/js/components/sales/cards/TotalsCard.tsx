import * as React from 'react';
import { Divider, Stack, Typography } from '@mui/material';
import { Str } from '@/support/Str';
import MyCard from '@/components/ui/MyCard';
import { SaleRow } from '@/types';

interface TotalsCardProps {
  sale_price: number;
  total_price: number;
  sale: {
    discount_percentage: number;
    discount_absolute: number;
    sale_contents: SaleRow[];
    payments: { amount: string }[];
  };
}

const TotalsCard: React.FC<TotalsCardProps> = (
  { sale_price, total_price, sale }
) => {

  return (
    <MyCard title={'Totali'}>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Prezzo base: </Typography>
        <Typography fontWeight={800}>{Str.EURO(sale_price).format()}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Sconto %: </Typography>
        <Typography fontWeight={800}>{sale.discount_percentage}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Sconto assoluto: </Typography>
        <Typography fontWeight={800}>{Str.EURO(sale.discount_absolute).format()}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Prezzo totale: </Typography>
        <Typography fontWeight={800}>{Str.EURO(total_price).format()}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Q.tà prodotti: </Typography>
        <Typography fontWeight={800}>{sale.sale_contents.length}</Typography>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Acconto: </Typography>
        <Typography
          fontWeight={800}>€{parseInt(String(sale.payments[0].amount)).toFixed(2).replace('.', ',')}</Typography>
      </Stack>
      <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography>Rateizzato: </Typography>
        <Typography fontWeight={800}>{Str.EURO(total_price - Number(sale.payments[0].amount)).format()}</Typography>
      </Stack>
    </MyCard>
  );
};

export default TotalsCard;
