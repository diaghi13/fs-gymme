import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, ListItem, ListItemText, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Payment, Sale } from '@/types';
import format from '@/support/format';
import { Str } from '@/support/Str';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RegisterPaymentDialog from '@/components/customers/dialogs/RegisterPaymentDialog';
import PaymentDialog from '@/components/customers/dialogs/PaymentDialog';

interface PaymentRowProps {
  sale: Sale;
  payment: Payment;
  index: number;
}

const PaymentRow = ({ payment, index, sale }: PaymentRowProps) => {
  const [openPayment, setOpenPayment] = useState(false);
  const [openPaymentRegistration, setOpenPaymentRegistration] = useState(false);
  const theme = useTheme();

  const handleOpenPaymentRegistration = () => {
    if (!payment.payed_at) {
      setOpenPaymentRegistration(true);
    }
  };

  return (
    <>
      <ListItem sx={{ borderBottom: `1px solid ${theme.palette.grey['300']}` }}>
        <ListItemText>{`# ${index + 1}`}</ListItemText>
        <ListItemText primary={'Scadenza'} secondary={format(payment.due_date, 'dd/MM/yyyy')} />
        <ListItemText primary={'Importo'} secondary={Str.EURO(payment.amount).format()} />
        <ListItemText primary={'Metodo pagamento'} secondary={payment.payment_method?.description} />
        <ListItemText primary={'Data pagamento'}
                      secondary={payment.payed_at ? format(payment.payed_at, 'dd/MM/yyyy') : '---'} />
        <ListItemText sx={{ width: 50 }}>
          {payment.status === 'payed' && <Chip label="Pagato" color="success" />}
          {payment.status === 'pending' && <Chip label="Non pagato" color="warning" />}
          {payment.status === 'expired' && <Chip label="Scaduto" color="error" />}
        </ListItemText>
        {payment.is_payed
          ? (
            <IconButton disabled>
              <CheckCircleIcon
                color={payment.is_payed ? 'success' : 'action'}
              />
            </IconButton>
          ) : (
            <Tooltip title="Registra pagamento">
              <IconButton onClick={handleOpenPaymentRegistration}>
                <CheckCircleIcon
                  color={payment.is_payed ? 'success' : 'action'}
                />
              </IconButton>
            </Tooltip>
          )}
        <Tooltip title="Modifica">
          <IconButton onClick={() => setOpenPayment(true)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </ListItem>
      {openPaymentRegistration && (
        <RegisterPaymentDialog
          open={openPaymentRegistration}
          onClose={() => setOpenPaymentRegistration(false)}
          sale={sale}
          payment={payment}
        />
      )}
      {openPayment && (
        <PaymentDialog open={openPayment} onClose={() => setOpenPayment(false)} sale={sale} payment={payment} />
      )}
    </>
  );
};

export default PaymentRow;
