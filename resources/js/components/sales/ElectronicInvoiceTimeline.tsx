import React from 'react';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent,
} from '@mui/lab';
import { Typography, Paper, Chip, Box } from '@mui/material';
import {
    Send,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    AlertCircle,
    Package,
} from 'lucide-react';
import FormattedDate from '@/components/ui/FormattedDate';

interface TimelineEvent {
    timestamp: string;
    status: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    color?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'grey';
}

interface ElectronicInvoiceTimelineProps {
    invoice: {
        created_at: string;
        sdi_status?: string;
        sdi_status_updated_at?: string;
        sent_at?: string;
        delivery_date?: string;
        accepted_at?: string;
        rejected_at?: string;
        sdi_error_messages?: string;
        transmission_id?: string;
    };
}

export default function ElectronicInvoiceTimeline({ invoice }: ElectronicInvoiceTimelineProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'generated':
                return <FileText size={20} />;
            case 'sent':
                return <Send size={20} />;
            case 'delivered':
                return <Package size={20} />;
            case 'accepted':
                return <CheckCircle size={20} />;
            case 'rejected':
                return <XCircle size={20} />;
            case 'pending':
                return <Clock size={20} />;
            default:
                return <AlertCircle size={20} />;
        }
    };

    const getStatusColor = (status: string): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'grey' => {
        switch (status) {
            case 'generated':
                return 'info';
            case 'sent':
                return 'primary';
            case 'delivered':
                return 'primary';
            case 'accepted':
                return 'success';
            case 'rejected':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'grey';
        }
    };

    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            generated: 'Generata',
            sent: 'Inviata a SDI',
            delivered: 'Consegnata',
            accepted: 'Accettata',
            rejected: 'Rifiutata',
            pending: 'In elaborazione',
        };
        return labels[status] || status.toUpperCase();
    };

    // Build timeline events from invoice data
    const events: TimelineEvent[] = [];

    // 1. Generazione XML
    events.push({
        timestamp: invoice.created_at,
        status: 'generated',
        title: 'Fattura Elettronica Generata',
        description: `XML FatturaPA creato. ID Trasmissione: ${invoice.transmission_id || 'N/A'}`,
        icon: getStatusIcon('generated'),
        color: getStatusColor('generated'),
    });

    // 2. Invio a SDI
    if (invoice.sent_at) {
        events.push({
            timestamp: invoice.sent_at,
            status: 'sent',
            title: 'Inviata al Sistema di Interscambio',
            description: 'Fattura trasmessa correttamente all\'SDI. In attesa di ricevuta.',
            icon: getStatusIcon('sent'),
            color: getStatusColor('sent'),
        });
    }

    // 3. Consegna
    if (invoice.delivery_date) {
        events.push({
            timestamp: invoice.delivery_date,
            status: 'delivered',
            title: 'Consegnata al Destinatario',
            description: 'SDI ha confermato la consegna al cliente.',
            icon: getStatusIcon('delivered'),
            color: getStatusColor('delivered'),
        });
    }

    // 4. Accettazione
    if (invoice.accepted_at) {
        events.push({
            timestamp: invoice.accepted_at,
            status: 'accepted',
            title: 'Fattura Accettata',
            description: 'Il cliente ha accettato la fattura elettronica.',
            icon: getStatusIcon('accepted'),
            color: getStatusColor('accepted'),
        });
    }

    // 5. Rifiuto
    if (invoice.rejected_at) {
        events.push({
            timestamp: invoice.rejected_at,
            status: 'rejected',
            title: 'Fattura Rifiutata',
            description: invoice.sdi_error_messages || 'Fattura rifiutata dal destinatario o da SDI.',
            icon: getStatusIcon('rejected'),
            color: getStatusColor('rejected'),
        });
    }

    return (
        <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Cronologia Fattura Elettronica
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Tracciamento completo del ciclo di vita della fattura
                </Typography>
            </Box>

            <Timeline position="right">
                {events.map((event, index) => (
                    <TimelineItem key={index}>
                        <TimelineOppositeContent sx={{ flex: 0.2 }}>
                            <Typography variant="body2" color="text.secondary">
                                <FormattedDate value={event.timestamp} showTime />
                            </Typography>
                        </TimelineOppositeContent>

                        <TimelineSeparator>
                            <TimelineDot color={event.color} sx={{ p: 1 }}>
                                {event.icon}
                            </TimelineDot>
                            {index < events.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>

                        <TimelineContent>
                            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {event.title}
                                    </Typography>
                                    <Chip
                                        label={getStatusLabel(event.status)}
                                        size="small"
                                        color={event.color}
                                        sx={{ height: 20 }}
                                    />
                                </Box>
                                {event.description && (
                                    <Typography variant="body2" color="text.secondary">
                                        {event.description}
                                    </Typography>
                                )}
                            </Paper>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>

            {/* Current Status */}
            {invoice.sdi_status && (
                <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Stato Attuale
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label={getStatusLabel(invoice.sdi_status)}
                            color={getStatusColor(invoice.sdi_status)}
                            icon={getStatusIcon(invoice.sdi_status)}
                        />
                        {invoice.sdi_status_updated_at && (
                            <Typography variant="body2" color="text.secondary">
                                Aggiornato il <FormattedDate value={invoice.sdi_status_updated_at} showTime />
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}
        </Paper>
    );
}

