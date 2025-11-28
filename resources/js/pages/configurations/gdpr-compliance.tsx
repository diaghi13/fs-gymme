import React from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import {
    CheckCircle,
    Warning,
    Error as ErrorIcon,
    Info,
    CloudDownload,
    Delete,
    Preview,
} from '@mui/icons-material';
import Layout from '@/layouts/configurations/Layout';
import { PageProps } from '@/types';

interface PreviewResult {
    total_found: number;
    retention_deadline: string;
    anonymized: number;
    failed: number;
}

interface GdprComplianceProps extends PageProps {
    dashboard: {
        retention_years: number;
        retention_deadline: string;
        stats: {
            total_invoices: number;
            expired_not_anonymized: number;
            near_expiry: number;
            already_anonymized: number;
        };
        upcoming_expirations: Array<{
            invoice_id: number;
            transmission_id: string;
            customer_name: string;
            document_date: string;
            expiry_date: string;
            days_until_expiry: number;
            age_years: number;
        }>;
        compliance_status: {
            total_expired: number;
            anonymized: number;
            non_compliant: number;
            compliance_percentage: number;
            status: 'compliant' | 'warning' | 'critical';
        };
    };
}

const GdprCompliance: React.FC<GdprComplianceProps> = ({ dashboard, auth, currentTenantId }) => {
    const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
    const [anonymizeDialogOpen, setAnonymizeDialogOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [previewResult, setPreviewResult] = React.useState<PreviewResult | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'compliant':
                return 'success';
            case 'warning':
                return 'warning';
            case 'critical':
                return 'error';
            default:
                return 'info';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'compliant':
                return <CheckCircle />;
            case 'warning':
                return <Warning />;
            case 'critical':
                return <ErrorIcon />;
            default:
                return <Info />;
        }
    };

    const handlePreview = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                route('app.configurations.gdpr-compliance.preview'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                }
            );
            const data = await response.json();
            setPreviewResult(data.result);
            setPreviewDialogOpen(true);
        } catch (error) {
            console.error('Preview failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnonymize = async () => {
        setLoading(true);
        try {
            await fetch(route('app.configurations.gdpr-compliance.anonymize'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            setAnonymizeDialogOpen(false);
            router.reload();
        } catch (error) {
            console.error('Anonymization failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        window.open(route('app.configurations.gdpr-compliance.report', {tenant: currentTenantId}), '_blank');
    };

    return (
        <Layout user={auth.user}>
            <Head title="GDPR Compliance" />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">
                    GDPR Compliance & Conservazione Dati
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    onClick={handleDownloadReport}
                >
                    Scarica Report
                </Button>
            </Box>

            {/* Status Overview */}
            <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                            Totale Fatture
                        </Typography>
                        <Typography variant="h3">
                            {dashboard.stats.total_invoices}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                            Scadute (Non Anonimizzate)
                        </Typography>
                        <Typography variant="h3" color="error">
                            {dashboard.stats.expired_not_anonymized}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                            In Scadenza (3 mesi)
                        </Typography>
                        <Typography variant="h3" color="warning.main">
                            {dashboard.stats.near_expiry}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                            Già Anonimizzate
                        </Typography>
                        <Typography variant="h3" color="success.main">
                            {dashboard.stats.already_anonymized}
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>

            {/* Compliance Status */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getStatusIcon(dashboard.compliance_status.status)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            Stato Conformità GDPR
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Conformità
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {dashboard.compliance_status.compliance_percentage}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={dashboard.compliance_status.compliance_percentage}
                            color={getStatusColor(dashboard.compliance_status.status)}
                        />
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Totale Scadute
                            </Typography>
                            <Typography variant="h6">
                                {dashboard.compliance_status.total_expired}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Anonimizzate
                            </Typography>
                            <Typography variant="h6" color="success.main">
                                {dashboard.compliance_status.anonymized}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Non Conformi
                            </Typography>
                            <Typography variant="h6" color="error">
                                {dashboard.compliance_status.non_compliant}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Retention Policy Info */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>Periodo di Conservazione Legale:</strong> {dashboard.retention_years} anni
                    <br />
                    <strong>Scadenza Retention:</strong> {new Date(dashboard.retention_deadline).toLocaleDateString('it-IT')}
                    <br />
                    <strong>Normativa Applicabile:</strong> CAD Art. 3 + GDPR Art. 17
                </Typography>
            </Alert>

            {/* Action Buttons */}
            {dashboard.stats.expired_not_anonymized > 0 && (
                <Card sx={{ mb: 3, bgcolor: 'error.light' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Azione Richiesta
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Ci sono {dashboard.stats.expired_not_anonymized} fatture oltre il periodo di retention
                            che devono essere anonimizzate per conformità GDPR.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Preview />}
                                onClick={handlePreview}
                                disabled={loading}
                            >
                                Anteprima
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => setAnonymizeDialogOpen(true)}
                                disabled={loading}
                            >
                                Anonimizza Ora
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Upcoming Expirations Table */}
            {dashboard.upcoming_expirations.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Prossime Scadenze (6 mesi)
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID Trasmissione</TableCell>
                                        <TableCell>Cliente</TableCell>
                                        <TableCell>Data Documento</TableCell>
                                        <TableCell>Scadenza</TableCell>
                                        <TableCell>Giorni Rimanenti</TableCell>
                                        <TableCell>Età (anni)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dashboard.upcoming_expirations.map((expiration) => (
                                        <TableRow key={expiration.invoice_id}>
                                            <TableCell>{expiration.transmission_id}</TableCell>
                                            <TableCell>{expiration.customer_name}</TableCell>
                                            <TableCell>
                                                {new Date(expiration.document_date).toLocaleDateString('it-IT')}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(expiration.expiry_date).toLocaleDateString('it-IT')}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={expiration.days_until_expiry}
                                                    color={
                                                        expiration.days_until_expiry < 0
                                                            ? 'error'
                                                            : expiration.days_until_expiry < 30
                                                            ? 'warning'
                                                            : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{expiration.age_years}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Preview Dialog */}
            <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Anteprima Anonimizzazione</DialogTitle>
                <DialogContent>
                    {previewResult && (
                        <Box>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Questa è un'anteprima. Nessun dato sarà modificato.
                            </Alert>
                            <Typography variant="body1" gutterBottom>
                                <strong>Fatture trovate:</strong> {previewResult.total_found}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Scadenza retention:</strong> {previewResult.retention_deadline}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)}>Chiudi</Button>
                </DialogActions>
            </Dialog>

            {/* Anonymize Confirmation Dialog */}
            <Dialog open={anonymizeDialogOpen} onClose={() => setAnonymizeDialogOpen(false)}>
                <DialogTitle>Conferma Anonimizzazione</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Sei sicuro di voler anonimizzare {dashboard.stats.expired_not_anonymized} fatture?
                        Questa azione è irreversibile e rimuoverà i dati personali per conformità GDPR.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnonymizeDialogOpen(false)} disabled={loading}>
                        Annulla
                    </Button>
                    <Button onClick={handleAnonymize} color="error" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Conferma Anonimizzazione'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default GdprCompliance;
