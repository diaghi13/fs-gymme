import { IconButton, ListItem as MuiListItem, ListItemText } from '@mui/material';
import { format } from 'date-fns/format';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';
import { usePage } from '@inertiajs/react';
import { SalePageProps } from '@/pages/sales/sales';
import { SaleInstallmentFormValues } from '@/components/sales/cards/PaymentCard';

interface PaymentRowItemProps {
  index: number;
  payment: SaleInstallmentFormValues;
}

export default function PaymentRowItem({ index, payment }: PaymentRowItemProps) {
  const { paymentMethodOptions } = usePage<SalePageProps>().props;
  const color = index % 2 ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.0)';
  const isPaid = Boolean(payment.payed_at);

  return (
    <MuiListItem
      key={`installment-list-${index + 1}`}
      sx={{ background: color }}
    >
      <ListItemText>
        {`${index + 1}# - ${format(
          payment.due_date!,
          'dd/MM/yyyy'
        )}`}
      </ListItemText>
      <ListItemText>
        {`${
          paymentMethodOptions.find(p => p.value === payment.payment_method.id)
            ?.label
        } - €${parseFloat(String(payment.amount === "" ? 0 : payment.amount)).toFixed(2).replace('.', ',')}`}
      </ListItemText>
      <IconButton>
        <CheckCircleIcon
          color={isPaid ? 'success' : 'action'}
        />
      </IconButton>
      <IconButton>
        <EditIcon />
      </IconButton>
    </MuiListItem>
  );
};
