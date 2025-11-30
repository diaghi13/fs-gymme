import { Card, CardContent, CardHeader, Chip, List, ListItem, Stack, Typography } from '@mui/material';
import * as React from 'react';
import { Str } from '@/support/Str';
import { usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';

const SalesCard = () => {
  const { sales_summary } = usePage<CustomerShowProps>().props.customer;

  if (!sales_summary) {
    return null; // or return a placeholder if sales_summary is not available
  }

  const getCustomerBadge = () => {
    const totalAmount = sales_summary.total_amount || 0;

    if (totalAmount === 0) {
      return {
        label: 'Nuovo',
        color: 'info' as const
      };
    }

    if (totalAmount < 500) {
      return {
        label: 'Abituale',
        color: 'primary' as const
      };
    }

    return {
      label: 'Premium',
      color: 'warning' as const
    };
  };

  const customerBadge = getCustomerBadge();

  return (
    <Card sx={{ color: 'white' }}>
      <CardHeader
        sx={{
          background:
            'linear-gradient(0deg, rgba(28,175,154,1) 0%, rgba(30,102,116,1) 100%)',
          height: 100,
          alignItems: 'flex-start'
        }}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Vendite</Typography>
            <Chip
              label={customerBadge.label}
              color={customerBadge.color}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Stack>
        }
      />
      <CardContent sx={{ background: 'rgba(28,175,154,1)', p: 0 }}>
        <List>
          <ListItem sx={{ justifyContent: 'space-between' }}>
            <Typography>Totale Vendite</Typography>
            <Typography>{sales_summary.sale_count}</Typography>
          </ListItem>
          <ListItem
            sx={{
              justifyContent: 'space-between',
              background: 'rgba(30,102,116,1)'
            }}
          >
            <Typography>Prodotti Venduti</Typography>
            <Typography>{sales_summary.total_sale_products}</Typography>
          </ListItem>
          <ListItem sx={{ justifyContent: 'space-between' }}>
            <Typography>Totale</Typography>
            <Typography>{Str.EURO(sales_summary.total_amount).format()}</Typography>
          </ListItem>
          <ListItem
            sx={{
              justifyContent: 'space-between',
              background: 'rgba(30,102,116,1)'
            }}
          >
            <Typography>Pagato</Typography>
            <Typography>{Str.EURO(sales_summary.payed).format()}</Typography>
          </ListItem>
          <ListItem sx={{ justifyContent: 'space-between' }}>
            <Typography>Non Pagato</Typography>
            <Typography>{Str.EURO(sales_summary.not_payed).format()}</Typography>
          </ListItem>
          <ListItem
            sx={{
              justifyContent: 'space-between',
              background: 'rgba(30,102,116,1)'
            }}
          >
            <Typography>Scaduto</Typography>
            <Typography>{Str.EURO(sales_summary.expired).format()}</Typography>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default SalesCard;
