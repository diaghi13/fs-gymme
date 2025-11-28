import React from 'react';
import { Card, CardContent, Typography, Button, Chip, Box, Alert, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Refresh as RefreshIcon, History as HistoryIcon } from '@mui/icons-material';
import { router } from '@inertiajs/react';
import { Download, Send, FileText, FileType } from 'lucide-react';
import { Sale, ElectronicInvoiceStatus } from '@/types';
import SdiErrorsPanel, { ParsedSdiError } from '../electronic-invoice/SdiErrorsPanel';
import SendAttemptsTimeline from '../electronic-invoice/SendAttemptsTimeline';
import PreservationStatusBadge from '../electronic-invoice/PreservationStatusBadge';
import FormattedDate from '@/components/ui/FormattedDate';

interface ElectronicInvoiceCardProps {
  sale: Sale;
  tenantId: string;
  parsedErrors?: ParsedSdiError[] | null;
}

export default function ElectronicInvoiceCard({ sale, tenantId, parsedErrors }: ElectronicInvoiceCardProps) {
  const [retrying, setRetrying] = React.useState(false);
  const [expandedHistoryAccordion, setExpandedHistoryAccordion] = React.useState(false);

  const handleGenerate = () => {
    if (!confirm('Generare la fattura elettronica? Questa operazione non è reversibile.')) {
      return;
    }

    router.post(route('app.sales.electronic-invoice.generate', {
      sale: sale.id,
      tenant: tenantId
    }));
  };

  const handleSend = () => {
    if (!confirm('Inviare la fattura elettronica al Sistema di Interscambio (SDI)?')) {
      return;
    }

    router.post(route('app.sales.electronic-invoice.send', {
      sale: sale.id,
      tenant: tenantId
    }));
  };

  const handleGenerateCreditNote = () => {
    if (!confirm('Generare una Nota di Credito (TD04) per annullare questa fattura? Questa operazione è irreversibile.')) {
      return;
    }

    router.post(route('app.sales.electronic-invoice.generate-credit-note', {
      sale: sale.id,
      tenant: tenantId
    }));
  };

  const handleRetry = () => {
    if (!confirm('Rigenerare e reinviare la fattura? Assicurati di aver corretto tutti i dati necessari prima di procedere.')) {
      return;
    }

    setRetrying(true);

    // Step 1: Rigenera XML
    router.post(route('app.sales.electronic-invoice.generate', {
      sale: sale.id,
      tenant: tenantId
    }), undefined, {
      preserveState: true,
      onSuccess: () => {
        // Step 2: Invia automaticamente dopo rigenerazione
        router.post(route('app.sales.electronic-invoice.send', {
          sale: sale.id,
          tenant: tenantId
        }), undefined, {
          preserveState: true,
          onFinish: () => {
            setRetrying(false);
          }
        });
      },
      onError: () => {
        setRetrying(false);
      }
    });
  };


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
      delivered: 'Consegnata',
    };
    return labels[status] || status;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Fattura Elettronica
          </Typography>
          {sale.electronic_invoice && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={getStatusLabel(sale.electronic_invoice.sdi_status)}
                color={getStatusColor(sale.electronic_invoice.sdi_status)}
                size="small"
              />
              <PreservationStatusBadge
                preserved={!!sale.electronic_invoice.preserved_at}
                preservedAt={sale.electronic_invoice.preserved_at}
                preservationPath={sale.electronic_invoice.preservation_path}
              />
            </Box>
          )}
        </Box>

        {!sale.electronic_invoice && sale.status !== 'draft' && sale.status !== 'canceled' && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              La vendita è pronta. Puoi generare la fattura elettronica per l'invio al Sistema di Interscambio (SDI).
            </Alert>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileText size={20} />}
              onClick={handleGenerate}
              fullWidth
            >
              Genera Fattura Elettronica
            </Button>
          </>
        )}

        {!sale.electronic_invoice && (sale.status === 'draft' || sale.status === 'canceled') && (
          <Alert severity="warning">
            Salva o completa la vendita per poter generare la fattura elettronica.
          </Alert>
        )}

        {sale.electronic_invoice && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Transmission ID:</strong> {sale.electronic_invoice.transmission_id}
            </Typography>

            {sale.electronic_invoice.external_id && (
              <Typography variant="body2" color="text.secondary">
                <strong>API ID:</strong> {sale.electronic_invoice.external_id}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary">
              <strong>Formato:</strong> {sale.electronic_invoice.transmission_format}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Generata il:</strong> <FormattedDate value={sale.electronic_invoice.created_at} showTime />
            </Typography>

            {sale.electronic_invoice.sdi_sent_at && (
              <Typography variant="body2" color="text.secondary">
                <strong>Inviata il:</strong> <FormattedDate value={sale.electronic_invoice.sdi_sent_at} showTime />
              </Typography>
            )}

            {/* Errori SDI con parsing avanzato */}
            {parsedErrors && parsedErrors.length > 0 && (
              <SdiErrorsPanel errors={parsedErrors} />
            )}

            {sale.electronic_invoice.sdi_status === 'accepted' && (
              <Alert severity="success" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Fattura accettata dal Sistema di Interscambio e consegnata al cliente.
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Download size={20} />}
                href={route('app.sales.electronic-invoice.download-xml', {
                  sale: sale.id,
                  tenant: tenantId
                })}
                fullWidth
              >
                Scarica XML
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<FileType size={20} />}
                href={route('app.sales.electronic-invoice.download-pdf', {
                  sale: sale.id,
                  tenant: tenantId
                })}
                fullWidth
              >
                Scarica PDF
              </Button>
            </Box>

            {(sale.electronic_invoice.sdi_status === 'generated' ||
              sale.electronic_invoice.sdi_status === 'to_send') && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Send size={20} />}
                onClick={handleSend}
                sx={{ mt: 1 }}
                fullWidth
              >
                Invia a SDI
              </Button>
            )}

            {sale.electronic_invoice.sdi_status === 'rejected' && (
              <Button
                variant="contained"
                color="warning"
                startIcon={retrying ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                onClick={handleRetry}
                disabled={retrying}
                sx={{ mt: 1 }}
                fullWidth
              >
                {retrying ? 'Rigenerazione in corso...' : 'Rigenera e Reinvia'}
              </Button>
            )}

            {sale.electronic_invoice.sdi_status === 'accepted' && sale.type !== 'credit_note' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<FileText size={20} />}
                onClick={handleGenerateCreditNote}
                sx={{ mt: 1 }}
                fullWidth
              >
                Genera Nota di Credito (TD04)
              </Button>
            )}

            {/* Storico Tentativi Invio */}
            {sale.electronic_invoice.send_attempts_list && sale.electronic_invoice.send_attempts_list.length > 0 && (
              <Accordion
                expanded={expandedHistoryAccordion}
                onChange={() => setExpandedHistoryAccordion(!expandedHistoryAccordion)}
                sx={{ mt: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon />
                    <Typography>
                      Storico Tentativi ({sale.electronic_invoice.send_attempts_list.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <SendAttemptsTimeline attempts={sale.electronic_invoice.send_attempts_list} />
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

