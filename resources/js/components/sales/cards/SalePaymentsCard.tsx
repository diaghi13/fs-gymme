import React from 'react';
import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Sale } from '@/types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import FormattedCurrency from '@/components/ui/FormattedCurrency';
import FormattedDate from '@/components/ui/FormattedDate';

interface SalePaymentsCardProps {
  sale: Sale;
}

const SalePaymentsCard: React.FC<SalePaymentsCardProps> = ({ sale }) => {
  const formatDate = (date: string | null) => {
    if (!date) return null;
    return date;
  };

  const getPaymentStatusIcon = (payedAt: string | null, dueDate: string) => {
    if (payedAt) {
      return <CheckCircle size={18} color="green" />;
    }

    const today = new Date();
    const due = new Date(dueDate);

    if (due < today) {
      return <XCircle size={18} color="red" />;
    }

    return <Clock size={18} color="orange" />;
  };

  const getPaymentStatusLabel = (payedAt: string | null, dueDate: string) => {
    if (payedAt) {
      return <Chip label="Pagato" color="success" size="small" />;
    }

    const today = new Date();
    const due = new Date(dueDate);

    if (due < today) {
      return <Chip label="Scaduto" color="error" size="small" />;
    }

    return <Chip label="In attesa" color="warning" size="small" />;
  };

  const totalAmount = sale.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const paidAmount = sale.payments?.filter(p => p.payed_at).reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const pendingAmount = totalAmount - paidAmount;

  return (
    <MyCard title="Pagamenti">
      {!sale.payments || sale.payments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nessun pagamento configurato per questa vendita.
        </Typography>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Totale
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                <FormattedCurrency value={totalAmount} />
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Pagato
              </Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                <FormattedCurrency value={paidAmount} />
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Residuo
              </Typography>
              <Typography variant="h6" fontWeight={700} color={pendingAmount > 0 ? 'error.main' : 'success.main'}>
                <FormattedCurrency value={pendingAmount} />
              </Typography>
            </Box>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="5%">#</TableCell>
                <TableCell width="15%">Stato</TableCell>
                <TableCell width="20%">Scadenza</TableCell>
                <TableCell width="20%">Pagato il</TableCell>
                <TableCell width="20%">Importo</TableCell>
                <TableCell width="20%">Metodo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sale.payments.map((payment, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPaymentStatusIcon(payment.payed_at, payment.due_date)}
                      {getPaymentStatusLabel(payment.payed_at, payment.due_date)}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(payment.due_date) ? <FormattedDate value={formatDate(payment.due_date)!} /> : '-'}</TableCell>
                  <TableCell>{formatDate(payment.payed_at) ? <FormattedDate value={formatDate(payment.payed_at)!} /> : '-'}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      <FormattedCurrency value={payment.amount} />
                    </Typography>
                  </TableCell>
                  <TableCell>{payment.payment_method?.name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </MyCard>
  );
};

export default SalePaymentsCard;
