import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { router } from '@inertiajs/react';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

export interface PreservationStats {
  total_preserved: number;
  current_month_preserved: number;
  total_storage_mb: number;
  oldest_preservation_date: string | null;
  newest_preservation_date: string | null;
  retention_years: number;
  compliance_status: 'compliant' | 'warning' | 'critical';
  invoices_pending_preservation: number;
  last_preservation_run: string | null;
}

interface PreservationDashboardProps {
  stats: PreservationStats;
  tenantId: string;
}

export default function PreservationDashboard({ stats, tenantId }: PreservationDashboardProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);

  const handleExportZip = (year: number, month?: number) => {
    setDownloading(true);

    const params: Record<string, string | number> = { tenant: tenantId, year };
    if (month) {
      params.month = month;
    }

    router.get(
      route('app.electronic-invoices.export-preservation', params),
      {},
      {
        preserveState: true,
        onFinish: () => {
          setDownloading(false);
        },
      }
    );
  };

  const handleRunPreservation = () => {
    if (!confirm('Eseguire manualmente la conservazione per il mese corrente?')) {
      return;
    }

    router.post(
      route('app.electronic-invoices.run-preservation', { tenant: tenantId }),
      {},
      {
        preserveState: true,
      }
    );
  };

  const getComplianceColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'warning':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const getComplianceMessage = (status: string): string => {
    switch (status) {
      case 'compliant':
        return 'Sistema in regola con gli obblighi di conservazione';
      case 'warning':
        return 'Attenzione: alcune fatture richiedono conservazione';
      default:
        return 'Azione richiesta: conservazione in ritardo';
    }
  };

  // Calcola anni disponibili per export (ultimi 10 anni + anno corrente)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // Calcola retention progress (10 anni obbligatori)
  const retentionProgress = stats.oldest_preservation_date
    ? Math.min(
        (differenceInDays(new Date(), new Date(stats.oldest_preservation_date)) / (365 * 10)) * 100,
        100
      )
    : 0;

  // Safe values con fallback
  const safeStats = {
    total_preserved: stats.total_preserved || 0,
    current_month_preserved: stats.current_month_preserved || 0,
    total_storage_mb: stats.total_storage_mb || 0,
    retention_years: stats.retention_years || 10,
    compliance_status: stats.compliance_status || 'compliant',
    invoices_pending_preservation: stats.invoices_pending_preservation || 0,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ArchiveIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={600}>
            Conservazione Sostitutiva
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRunPreservation}
          size="small"
        >
          Esegui Conservazione Manuale
        </Button>
      </Box>

      {/* Alert Compliance Status */}
      <Alert
        severity={getComplianceColor(safeStats.compliance_status)}
        icon={getComplianceIcon(safeStats.compliance_status)}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2" fontWeight={600}>
          {getComplianceMessage(safeStats.compliance_status)}
        </Typography>
        {safeStats.invoices_pending_preservation > 0 && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {safeStats.invoices_pending_preservation} fatture in attesa di conservazione
          </Typography>
        )}
      </Alert>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Preserved */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Fatture Conservate
                </Typography>
                <ArchiveIcon color="primary" />
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {safeStats.total_preserved}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Totale nel sistema
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Month */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Mese Corrente
                </Typography>
                <CheckCircleIcon color="success" />
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {safeStats.current_month_preserved}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(), 'MMMM yyyy', { locale: it })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Storage Size */}
        <Grid size={{xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Storage Utilizzato
                </Typography>
                <FileDownloadIcon color="info" />
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {safeStats.total_storage_mb.toFixed(1)} MB
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Spazio su disco
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Retention Years */}
        <Grid size={{xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Retention Obbligatoria
                </Typography>
                <InfoIcon color="warning" />
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {safeStats.retention_years} anni
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Obbligatorio per legge
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Retention Progress */}
      {stats.oldest_preservation_date && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Compliance 10 Anni
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={retentionProgress}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {retentionProgress.toFixed(0)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Prima conservazione:{' '}
              {format(new Date(stats.oldest_preservation_date), 'dd MMMM yyyy', { locale: it })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Il sistema deve conservare i documenti per 10 anni dalla data di emissione
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Export Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export Archivio ZIP
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Scarica un archivio ZIP contenente tutte le fatture conservate per un periodo specifico
          </Typography>

          <Grid container spacing={2}>
            {/* Year Selector */}
            <Grid size={{xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Seleziona Anno
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {availableYears.map((year) => (
                  <Chip
                    key={year}
                    label={year}
                    onClick={() => setSelectedYear(year)}
                    color={selectedYear === year ? 'primary' : 'default'}
                    variant={selectedYear === year ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </Grid>

            {/* Month Selector (Optional) */}
            <Grid size={{xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Seleziona Mese (Opzionale)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label="Intero Anno"
                  onClick={() => setSelectedMonth(null)}
                  color={selectedMonth === null ? 'primary' : 'default'}
                  variant={selectedMonth === null ? 'filled' : 'outlined'}
                />
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <Chip
                    key={month}
                    label={format(new Date(2025, month - 1, 1), 'MMM', { locale: it })}
                    onClick={() => setSelectedMonth(month)}
                    color={selectedMonth === month ? 'primary' : 'default'}
                    variant={selectedMonth === month ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Stack>
            </Grid>

            {/* Export Button */}
            <Grid size={{xs: 12}}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportZip(selectedYear, selectedMonth || undefined)}
                disabled={downloading}
                fullWidth
                size="large"
              >
                {downloading
                  ? 'Download in corso...'
                  : `Scarica ${selectedMonth ? `${format(new Date(selectedYear, selectedMonth - 1, 1), 'MMMM', { locale: it })} ${selectedYear}` : `Anno ${selectedYear}`}`}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Paper sx={{ mt: 3, p: 2, bgcolor: 'info.light' }}>
        <Typography variant="body2" color="info.contrastText">
          <strong>ℹ️ Nota Normativa:</strong> La conservazione sostitutiva è obbligatoria per 10 anni
          secondo il CAD (D.Lgs 82/2005 art. 3) e DMEF 17/06/2014. Il sistema conserva automaticamente
          tutte le fatture accettate ogni 1° del mese alle 02:00.
        </Typography>
      </Paper>

      {/* Last Run Info */}
      {stats.last_preservation_run && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Ultima esecuzione automatica:{' '}
          {format(new Date(stats.last_preservation_run), "dd MMMM yyyy 'alle' HH:mm", { locale: it })}
        </Alert>
      )}
    </Box>
  );
}

