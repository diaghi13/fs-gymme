import * as React from 'react';
import { Sale } from '@/types';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { Str } from '@/support/Str';

interface SaleTotalsCardProps {
  sale: Sale;
}

const SaleTotalsCard: React.FC<SaleTotalsCardProps> = ({ sale }) => {
  const summary = sale.sale_summary;
  const isPaid = summary.total_due === 0;
  const isPartiallyPaid = summary.total_paid > 0 && summary.total_due > 0;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Riepilogo Importi
        </Typography>
        <Chip
          label={sale.status}
          size="small"
          color={sale.status === 'completed' ? 'success' : 'default'}
        />
      </Stack>

      {/* Imponibile + IVA */}
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Imponibile (netto)
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {Str.EURO(summary.net_price).format()}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            IVA
          </Typography>
          <Typography variant="body1" fontWeight={600} color="primary.main">
            {Str.EURO(summary.total_tax).format()}
          </Typography>
        </Stack>

        {/* Sconti (se presenti) */}
        {(summary.percentage_discount > 0 || summary.absolute_discount > 0) && (
          <>
            <Divider sx={{ my: 1 }} />
            {summary.percentage_discount > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Sconto %
                </Typography>
                <Typography variant="body2" color="error.main">
                  {summary.percentage_discount}%
                </Typography>
              </Stack>
            )}
            {summary.absolute_discount > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Sconto assoluto
                </Typography>
                <Typography variant="body2" color="error.main">
                  -{Str.EURO(summary.absolute_discount).format()}
                </Typography>
              </Stack>
            )}
          </>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Imposta di Bollo (se applicata e addebitata al cliente) */}
        {summary.stamp_duty_applied && summary.stamp_duty_amount > 0 && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="info.main">
              Imposta di Bollo
            </Typography>
            <Typography variant="body1" fontWeight={600} color="info.main">
              {Str.EURO(summary.stamp_duty_amount).format()}
            </Typography>
          </Stack>
        )}

        {/* Totale documento (con IVA + eventuale bollo) */}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight={700}>
            Totale Documento
          </Typography>
          <Typography variant="h6" fontWeight={700} color="success.main">
            {Str.EURO(summary.final_total || summary.gross_price).format()}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Stato pagamento */}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Pagato
          </Typography>
          <Typography variant="body1" fontWeight={600} color={isPaid ? 'success.main' : 'warning.main'}>
            {Str.EURO(summary.total_paid).format()}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Dovuto
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" fontWeight={600} color={isPaid ? 'success.main' : 'error.main'}>
              {Str.EURO(summary.total_due).format()}
            </Typography>
            {isPaid && (
              <Chip label="Saldato" size="small" color="success" sx={{ height: 20 }} />
            )}
            {isPartiallyPaid && (
              <Chip label="Parziale" size="small" color="warning" sx={{ height: 20 }} />
            )}
          </Box>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* Info aggiuntive */}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            Quantità prodotti
          </Typography>
          <Typography variant="caption" fontWeight={600}>
            {summary.total_quantity}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SaleTotalsCard;
