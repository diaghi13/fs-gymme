import * as React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  Divider,
  Stack,
} from '@mui/material';
import { Str } from '@/support/Str';

interface VatBreakdownItem {
  vat_rate_id: number | null;
  vat_rate: {
    id: number;
    percentage: number;
    description?: string | null;
    nature?: string | null;
  } | null;
  percentage: number;
  taxable_amount: number;
  vat_amount: number;
  total_amount: number;
}

interface SaleVatBreakdownCardProps {
  vatBreakdown: VatBreakdownItem[];
  totalNet: number;
  totalVat: number;
  totalGross: number;
}

const SaleVatBreakdownCard: React.FC<SaleVatBreakdownCardProps> = ({
  vatBreakdown,
  totalNet,
  totalVat,
  totalGross,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Scorporo IVA
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Aliquota IVA</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Imponibile
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Imposta
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Totale
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vatBreakdown.map((item, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${item.percentage}%`}
                      size="small"
                      color={item.percentage > 0 ? 'primary' : 'default'}
                      sx={{ minWidth: 60 }}
                    />
                    {item.vat_rate?.nature && (
                      <Typography variant="caption" color="text.secondary">
                        {item.vat_rate.nature}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {Str.EURO(item.taxable_amount).format()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    color={item.vat_amount > 0 ? 'primary' : 'text.secondary'}
                    sx={{ fontWeight: item.vat_amount > 0 ? 600 : 400 }}
                  >
                    {Str.EURO(item.vat_amount).format()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {Str.EURO(item.total_amount).format()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}

            {/* Totals Row */}
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700, py: 2 }}>
                TOTALI
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                {Str.EURO(totalNet).format()}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                {Str.EURO(totalVat).format()}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, py: 2 }}>
                {Str.EURO(totalGross).format()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary boxes */}
      <Divider sx={{ my: 3 }} />
      <Stack direction="row" spacing={2} justifyContent="space-around">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Totale Imponibile
          </Typography>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
            {Str.EURO(totalNet).format()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Totale IVA
          </Typography>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
            {Str.EURO(totalVat).format()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Totale Documento
          </Typography>
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
            {Str.EURO(totalGross).format()}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default SaleVatBreakdownCard;
