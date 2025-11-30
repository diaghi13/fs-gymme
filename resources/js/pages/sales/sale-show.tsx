import * as React from 'react';
import { PageProps, Sale } from '@/types';
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import { Download, FileText, FileType, Send, CreditCard } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import SaleHeaderCard from '@/components/sales/cards/SaleHeaderCard';
import SaleTotalsCard from '@/components/sales/cards/SaleTotalsCard';
import SaleCustomerCard from '@/components/sales/cards/SaleCustomerCard';
import SaleRowsCard from '@/components/sales/cards/SaleRowsCard';
import SaleVatBreakdownCard from '@/components/sales/cards/SaleVatBreakdownCard';
import SalePaymentsCard from '@/components/sales/cards/SalePaymentsCard';
import ElectronicInvoiceCard from '@/components/sales/ElectronicInvoiceCard';
import { router } from '@inertiajs/react';
import type { ParsedSdiError } from '@/components/electronic-invoice/SdiErrorsPanel';
import FormattedDate from '@/components/ui/FormattedDate';
import FormattedCurrency from '@/components/ui/FormattedCurrency';

interface SaleShowProps extends PageProps {
  sale: Sale;
  parsedSdiErrors?: ParsedSdiError[] | null;
}

const SaleShow: React.FC<SaleShowProps> = ({ auth, sale, currentTenantId, parsedSdiErrors }) => {
  console.log('sale', sale);
  const [printDialogOpen, setPrintDialogOpen] = React.useState(false);
  const isCreditNote = sale.type === 'credit_note';

  // Helper per status badge
  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'draft': return 'default';
      case 'saved': return 'primary';
      case 'sent': return 'success';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: 'Bozza',
      saved: 'Salvata',
      sent: 'Inviata',
      canceled: 'Annullata',
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status: string): 'default' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'unpaid': return 'error';
      case 'overpaid': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      paid: 'Pagata',
      partial: 'Parziale',
      unpaid: 'Non Pagata',
      overpaid: 'Sovrapagata',
    };
    return labels[status] || status;
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon />;
      case 'partial': return <PendingIcon />;
      case 'unpaid': return <ErrorIcon />;
      case 'overpaid': return <ErrorIcon />;
      default: return undefined;
    }
  };

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
    if (!confirm('Creare una Nota di Credito (TD04) per stornare questa fattura? Verrà creato un nuovo documento con importi negativi.')) {
      return;
    }

    router.post(route('app.sales.credit-note', {
      sale: sale.id,
      tenant: currentTenantId
    }));
  };

  const handlePrint = () => {
    setPrintDialogOpen(true);
  };

  const handlePrintConfirm = () => {
    window.print();
  };

  return (
    <AppLayout user={auth.user} title="Dettaglio Vendita">
      <Box sx={{ p: 3 }}>
        {/* Header with title and all actions */}
        <Paper elevation={1} sx={{
          p: 2,
          mb: 3,
          background: isCreditNote
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Typography variant="h5" fontWeight={700} color="white">
                  {sale.document_type?.[0]?.description || 'Vendita'} #{sale.progressive_number}
                </Typography>
                {isCreditNote && (
                  <Chip
                    label="NOTA DI CREDITO"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.95)',
                      color: 'error.main',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                    size="small"
                  />
                )}
                <Chip
                  label={getStatusLabel(sale.status)}
                  color={getStatusColor(sale.status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  icon={getPaymentStatusIcon(sale.payment_status)}
                  label={getPaymentStatusLabel(sale.payment_status)}
                  color={getPaymentStatusColor(sale.payment_status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <FormattedDate value={sale.date} />
                </Typography>
                {isCreditNote && sale.original_sale && (
                  <>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      •
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      Storno di: Fattura #{sale.original_sale.progressive_number}
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              {/* Edit Button */}
              <Tooltip title="Modifica vendita">
                <IconButton
                  size="small"
                  sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                  href={route('app.sales.edit', { tenant: currentTenantId, sale: sale.id! })}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Print Button */}
              <Tooltip title="Stampa">
                <IconButton
                  size="small"
                  sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                  onClick={handlePrint}
                >
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Generate Electronic Invoice */}
              {!sale.electronic_invoice && sale.status !== 'draft' && sale.status !== 'canceled' && (
                <Tooltip title="Genera Fattura Elettronica">
                  <IconButton
                    size="small"
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                    onClick={handleGenerate}
                  >
                    <FileText size={18} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Download XML */}
              {sale.electronic_invoice && (
                <Tooltip title="Scarica XML">
                  <IconButton
                    size="small"
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                    href={route('app.sales.electronic-invoice.download-xml', {
                      sale: sale.id,
                      tenant: currentTenantId
                    })}
                  >
                    <Download size={18} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Download PDF */}
              {sale.electronic_invoice && (
                <Tooltip title="Scarica PDF">
                  <IconButton
                    size="small"
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                    href={route('app.sales.electronic-invoice.download-pdf', {
                      sale: sale.id,
                      tenant: currentTenantId
                    })}
                  >
                    <FileType size={18} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Send to SDI */}
              {sale.electronic_invoice &&
                (sale.electronic_invoice.sdi_status === 'generated' ||
                sale.electronic_invoice.sdi_status === 'to_send') && (
                <Tooltip title="Invia a SDI">
                  <IconButton
                    size="small"
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                    onClick={handleSend}
                  >
                    <Send size={18} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Generate Credit Note */}
              {sale.electronic_invoice &&
                sale.electronic_invoice.sdi_status === 'accepted' &&
                sale.type !== 'credit_note' && (
                <Tooltip title="Genera Nota di Credito">
                  <IconButton
                    size="small"
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                    onClick={handleGenerateCreditNote}
                  >
                    <CreditCard size={18} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Column: Main Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Stack spacing={3}>
              {/* Summary Cards Row: Header, Customer, Totals */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SaleHeaderCard sale={sale} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SaleCustomerCard sale={sale} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <SaleTotalsCard sale={sale} />
                </Grid>
              </Grid>

              {/* Products Table */}
              <SaleRowsCard sale={sale} />

              {/* Payments & VAT */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <SalePaymentsCard sale={sale} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <SaleVatBreakdownCard
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    vatBreakdown={sale.sale_summary.vat_breakdown as any}
                    totalNet={sale.sale_summary.net_price}
                    totalVat={sale.sale_summary.total_tax}
                    totalGross={sale.sale_summary.gross_price}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* Right Column: Electronic Invoice Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ElectronicInvoiceCard
              sale={sale}
              tenantId={currentTenantId}
              parsedErrors={parsedSdiErrors}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Print Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Anteprima di Stampa</Typography>
          <IconButton onClick={() => setPrintDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            {/* Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: '2px solid #000' }}>
              <Typography variant="h4" fontWeight={700}>
                {sale.document_type?.[0]?.description || 'Fattura'} #{sale.progressive_number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data: <FormattedDate value={sale.date} />
              </Typography>
            </Box>

            {/* Customer Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Cliente
              </Typography>
              <Typography variant="body2">
                {sale.customer?.full_name || 'N/A'}
              </Typography>
              {sale.customer?.tax_id_code && (
                <Typography variant="body2">CF: {sale.customer.tax_id_code}</Typography>
              )}
            </Box>

            {/* Products Table */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Prodotti
              </Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Descrizione</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Q.tà</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Prezzo</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>IVA</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.rows.map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px' }}>{row.description}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{row.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        <FormattedCurrency value={(row.unit_price_gross || 0) / 100} />
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{row.vat_rate?.percentage}%</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        <FormattedCurrency value={(row.total_gross || 0) / 100} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            {/* Totals */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ minWidth: 300 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Imponibile:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      <FormattedCurrency value={sale.sale_summary.net_price / 100} />
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">IVA:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      <FormattedCurrency value={sale.sale_summary.total_tax / 100} />
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={700}>Totale:</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      <FormattedCurrency value={sale.sale_summary.gross_price / 100} />
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>

            {/* Print Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="outlined" onClick={() => setPrintDialogOpen(false)}>
                Annulla
              </Button>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrintConfirm}
              >
                Stampa
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SaleShow;
