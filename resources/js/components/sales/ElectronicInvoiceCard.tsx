import React from 'react';
import { Card, CardContent, Typography, Button, Chip, Box, Alert } from '@mui/material';
import { router } from '@inertiajs/react';
import { Download, Send, FileText, FilePdf } from 'lucide-react';
import { Sale, ElectronicInvoiceStatus } from '@/types';

interface ElectronicInvoiceCardProps {
  sale: Sale;
  tenantId: string;
}

export default function ElectronicInvoiceCard({ sale, tenantId }: ElectronicInvoiceCardProps) {
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
            <Chip
              label={getStatusLabel(sale.electronic_invoice.sdi_status)}
              color={getStatusColor(sale.electronic_invoice.sdi_status)}
              size="small"
            />
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
              <strong>Generata il:</strong> {new Date(sale.electronic_invoice.created_at).toLocaleString('it-IT')}
            </Typography>

            {sale.electronic_invoice.sdi_sent_at && (
              <Typography variant="body2" color="text.secondary">
                <strong>Inviata il:</strong> {new Date(sale.electronic_invoice.sdi_sent_at).toLocaleString('it-IT')}
              </Typography>
            )}

            {sale.electronic_invoice.sdi_error_messages && (
              <Alert severity="error" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Errori SDI:</strong>
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                  {sale.electronic_invoice.sdi_error_messages}
                </Typography>
              </Alert>
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
                startIcon={<FilePdf size={20} />}
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
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

