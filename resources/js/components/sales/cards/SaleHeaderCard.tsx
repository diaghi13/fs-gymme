import * as React from 'react';
import { Box, Chip, Grid, Stack, Typography } from '@mui/material';
import format from '@/support/format';
import MyCard from '@/components/ui/MyCard';
import { Sale } from '@/types';
import { Calendar, FileText, Hash } from 'lucide-react';

interface SaleHeaderCardProps {
  sale: Sale;
}

const SaleHeaderCard: React.FC<SaleHeaderCardProps> = ({ sale }) => {
  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'confirmed':
        return 'primary';
      case 'completed':
        return 'success';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: 'Bozza',
      confirmed: 'Confermata',
      completed: 'Completata',
      canceled: 'Annullata',
    };
    return labels[status] || status;
  };

  return (
    <MyCard sx={{ height: '100%' }} title="Testata">
      <Grid container spacing={2}>
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Hash size={18} color="#666" />
            <Typography variant="body2" color="text.secondary">
              Numero Progressivo
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {sale.progressive_number}
          </Typography>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Calendar size={18} color="#666" />
            <Typography variant="body2" color="text.secondary">
              Data
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={600}>
            {format(sale.date, 'dd/MM/yyyy')}
          </Typography>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FileText size={18} color="#666" />
            <Typography variant="body2" color="text.secondary">
              Tipo Documento
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={600}>
            {sale.document_type_electronic_invoice?.name || 'Fattura'}
          </Typography>
        </Grid>

        <Grid size={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Stato
          </Typography>
          <Chip
            label={getStatusLabel(sale.status)}
            color={getStatusColor(sale.status)}
            size="small"
          />
        </Grid>

        {sale.structure && (
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Struttura
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {sale.structure.name}
            </Typography>
          </Grid>
        )}
      </Grid>
    </MyCard>
  );
};

export default SaleHeaderCard;
