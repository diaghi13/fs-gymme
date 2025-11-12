import * as React from 'react';
import { PageProps, Sale } from '@/types';
import { Box, Button, Chip, Divider, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Download, FileText, FileType, Send } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import SaleHeaderCard from '@/components/sales/cards/SaleHeaderCard';
import SaleTotalsCard from '@/components/sales/cards/SaleTotalsCard';
import SaleCustomerCard from '@/components/sales/cards/SaleCustomerCard';
import SaleRowsCard from '@/components/sales/cards/SaleRowsCard';
import SaleVatBreakdownCard from '@/components/sales/cards/SaleVatBreakdownCard';
import SalePaymentsCard from '@/components/sales/cards/SalePaymentsCard';
import SaleElectronicInvoiceStatusCard from '@/components/sales/cards/SaleElectronicInvoiceStatusCard';
import { router } from '@inertiajs/react';

interface SaleShowProps extends PageProps {
  sale: Sale;
}

const SaleShow: React.FC<SaleShowProps> = ({ auth, sale, currentTenantId }) => {
  console.log('sale', sale);

  const handleGenerate = () => {
    if (!confirm('Generare la fattura elettronica? Questa operazione non è reversibile.')) {
      return;
    }

    router.post(route('app.sales.electronic-invoice.generate', {
      sale: sale.id,
      tenant: currentTenantId
    }));
  };

  const handleSend = () => {
    if (!confirm('Inviare la fattura elettronica al Sistema di Interscambio (SDI)?')) {
      return;
    }

    router.post(route('app.sales.electronic-invoice.send', {
      sale: sale.id,
      tenant: currentTenantId
    }));
  };

  const handleGenerateCreditNote = () => {
    if (!confirm('Generare una Nota di Credito (TD04) per annullare questa fattura? Questa operazione è irreversibile.')) {
      return;
    }

    router.post(route('app.sales.electronic-invoice.generate-credit-note', {
      sale: sale.id,
      tenant: currentTenantId
    }));
  };

  return (
    <AppLayout user={auth.user} title="Dettaglio Vendita">
      <Box sx={{ p: 3 }}>
        {/* Header with title and general actions */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">
                {sale.document_type_electronic_invoice?.name || 'Fattura'} #{sale.progressive_number}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {new Date(sale.date).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {/* TODO: Implement edit functionality */}
              {/* <Tooltip title="Modifica vendita">
                <IconButton
                  size="small"
                  sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip> */}
            </Stack>
          </Stack>
        </Paper>

        {/* Electronic Invoice Actions Bar */}
        {!sale.electronic_invoice && sale.status !== 'draft' && sale.status !== 'canceled' && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <FileText size={24} />
              <Typography variant="body1" fontWeight={600} sx={{ flex: 1 }}>
                La vendita è pronta per la generazione della fattura elettronica
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FileText size={20} />}
                onClick={handleGenerate}
              >
                Genera Fattura Elettronica
              </Button>
            </Stack>
          </Paper>
        )}

        {sale.electronic_invoice && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
              <Typography variant="body1" fontWeight={600}>
                Fattura Elettronica:
              </Typography>

              {/* Download Actions */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Download size={18} />}
                href={route('app.sales.electronic-invoice.download-xml', {
                  sale: sale.id,
                  tenant: currentTenantId
                })}
              >
                Scarica XML
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="secondary"
                startIcon={<FileType size={18} />}
                href={route('app.sales.electronic-invoice.download-pdf', {
                  sale: sale.id,
                  tenant: currentTenantId
                })}
              >
                Scarica PDF
              </Button>

              {/* Send to SDI */}
              {(sale.electronic_invoice.sdi_status === 'generated' ||
                sale.electronic_invoice.sdi_status === 'to_send') && (
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={<Send size={18} />}
                  onClick={handleSend}
                >
                  Invia a SDI
                </Button>
              )}

              {/* Generate Credit Note */}
              {sale.electronic_invoice.sdi_status === 'accepted' && sale.type !== 'credit_note' && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<FileText size={18} />}
                  onClick={handleGenerateCreditNote}
                >
                  Genera Nota di Credito
                </Button>
              )}
            </Stack>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Electronic Invoice Status - Compact */}
          {sale.electronic_invoice && (
            <Grid size={12}>
              <SaleElectronicInvoiceStatusCard sale={sale} />
            </Grid>
          )}

          {/* Summary Cards Row: Header, Customer, Totals */}
          <Grid size={{ xs: 12, md: 4 }}>
            <SaleHeaderCard sale={sale} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SaleCustomerCard sale={sale} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SaleTotalsCard sale={sale} />
          </Grid>

          {/* Payments Section */}
          <Grid size={12}>
            <SalePaymentsCard sale={sale} />
          </Grid>

          {/* Products Table */}
          <Grid size={12}>
            <SaleRowsCard sale={sale} />
          </Grid>

          {/* VAT Breakdown */}
          <Grid size={12}>
            <SaleVatBreakdownCard
              vatBreakdown={sale.sale_summary.vat_breakdown}
              totalNet={sale.sale_summary.net_price}
              totalVat={sale.sale_summary.total_tax}
              totalGross={sale.sale_summary.gross_price}
            />
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
};

export default SaleShow;
