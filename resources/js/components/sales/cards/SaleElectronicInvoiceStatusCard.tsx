import React from 'react';
import { Alert, Box, Chip, Grid, Typography } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Sale, ElectronicInvoiceStatus } from '@/types';
import FormattedDate from '@/components/ui/FormattedDate';

interface SaleElectronicInvoiceStatusCardProps {
  sale: Sale;
}

const SaleElectronicInvoiceStatusCard: React.FC<SaleElectronicInvoiceStatusCardProps> = ({ sale }) => {
  if (!sale.electronic_invoice) {
    return null;
  }

  const getStatusColor = (status: ElectronicInvoiceStatus): 'default' | 'info' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'generated':
      case 'to_send':
        return 'info';
      case 'sending':
      case 'sent':
        return 'warning';
      case 'accepted':
      case 'delivered':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ElectronicInvoiceStatus): string => {
    const labels: Record<ElectronicInvoiceStatus, string> = {
      draft: 'Bozza',
      generated: 'Generata',
      to_send: 'Da Inviare',
      sending: 'Invio in corso',
      sent: 'Inviata a SDI',
      accepted: 'Accettata',
      rejected: 'Scartata',
      delivered: 'Consegnata'
    };
    return labels[status] || status;
  };

  return (
    <MyCard title="Stato Fattura Elettronica">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Stato
          </Typography>
          <Chip
            label={getStatusLabel(sale.electronic_invoice.sdi_status)}
            color={getStatusColor(sale.electronic_invoice.sdi_status)}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Transmission ID
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {sale.electronic_invoice.transmission_id}
          </Typography>
        </Grid>

        {sale.electronic_invoice.external_id && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              API ID
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {sale.electronic_invoice.external_id}
            </Typography>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Formato
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {sale.electronic_invoice.transmission_format}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Generata il
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            <FormattedDate value={sale.electronic_invoice.created_at} showTime />
          </Typography>
        </Grid>

        {sale.electronic_invoice.sdi_sent_at && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary">
              Inviata il
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              <FormattedDate value={sale.electronic_invoice.sdi_sent_at} showTime />
            </Typography>
          </Grid>
        )}

        {sale.electronic_invoice.sdi_error_messages && (
          <Grid size={12}>
            <Alert severity="error" sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Errori SDI:
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                {sale.electronic_invoice.sdi_error_messages}
              </Typography>
            </Alert>
          </Grid>
        )}

        {sale.electronic_invoice.sdi_status === 'accepted' && (
          <Grid size={12}>
            <Alert severity="success" sx={{ mt: 1 }}>
              <Typography variant="body2">
                Fattura accettata dal Sistema di Interscambio e consegnata al cliente.
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </MyCard>
  );
};

export default SaleElectronicInvoiceStatusCard;
