import { Card, CardContent, CardHeader, List, ListItem, Typography } from '@mui/material';
import * as React from 'react';
import { Str } from '@/support/Str';
import { usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';

const SalesCard = () => {
  const { sales_summary } = usePage<CustomerShowProps>().props.customer;

  if (!sales_summary) {
    return null; // or return a placeholder if sales_summary is not available
  }

  return (
    <Card sx={{ color: 'white' }}>
      <CardHeader
        sx={{
          background:
            'linear-gradient(0deg, rgba(28,175,154,1) 0%, rgba(30,102,116,1) 100%)',
          height: 100,
          alignItems: 'flex-start'
        }}
        title={<Typography>Vendite</Typography>}
      />
      <CardContent sx={{ background: 'rgba(28,175,154,1)', p: 0 }}>
        <List>
          <ListItem sx={{ justifyContent: 'space-between' }}>
            <Typography>Prodotti Venduti</Typography>
            <Typography>{sales_summary.total_sale_products}</Typography>
          </ListItem>
          <ListItem
            sx={{
              justifyContent: 'space-between',
              background: 'rgba(30,102,116,1)'
            }}
          >
            <Typography>Totale</Typography>
            <Typography>{Str.EURO(sales_summary.total_amount).format()}</Typography>
          </ListItem>
          <ListItem sx={{ justifyContent: 'space-between' }}>
            <Typography>Pagato</Typography>
            <Typography>{Str.EURO(sales_summary.payed).format()}</Typography>
          </ListItem>
          <ListItem
            sx={{
              justifyContent: 'space-between',
              background: 'rgba(30,102,116,1)'
            }}
          >
            <Typography>Non Pagato</Typography>
            <Typography>{Str.EURO(sales_summary.not_payed).format()}</Typography>
          </ListItem>
          <ListItem sx={{ justifyContent: 'space-between' }}>
            <Typography>Scaduto</Typography>
            <Typography>€ 0,00</Typography>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default SalesCard;
