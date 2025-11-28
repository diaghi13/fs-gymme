import * as React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  HourglassEmpty,
  Receipt,
  Warning,
} from '@mui/icons-material';
import axios from 'axios';
import { route } from 'ziggy-js';
import { useFormatCurrency } from '@/hooks/useRegionalSettings';

interface ElectronicInvoiceStats {
  month_count: number;
  pending_count: number;
  rejected_count: number;
  accepted_count: number;
  total_amount: number;
  api_usage?: {
    used: number;
    limit: number;
    percentage: number;
  };
}

const ElectronicInvoiceWidget: React.FC = () => {
  const [stats, setStats] = React.useState<ElectronicInvoiceStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const formatCurrency = useFormatCurrency();

  React.useEffect(() => {
    try {
      const url = route('api.dashboard.electronic-invoice-stats');

      axios
        .get(url)
        .then((res) => {
          if (res.data) {
            setStats(res.data);
          } else {
            setError('Dati non validi ricevuti dal server');
          }
        })
        .catch((err) => {
          console.error('Error fetching FE stats:', err);
          const errorMsg = err.response?.data?.message
            || err.message
            || 'Errore nel caricamento statistiche';
          setError(errorMsg);
        })
        .finally(() => setLoading(false));
    } catch (err) {
      console.error('Route error:', err);
      setError('Errore configurazione route');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Fatturazione Elettronica" />
        <CardContent>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader title="Fatturazione Elettronica" />
        <CardContent>
          <Alert severity="error">{error || 'Dati non disponibili'}</Alert>
        </CardContent>
      </Card>
    );
  }

  const getApiUsageColor = (percentage: number): 'success' | 'warning' | 'error' => {
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  return (
    <Card>
      <CardHeader
        title="Fatturazione Elettronica"
        subheader="Statistiche mensili"
        avatar={<Receipt color="primary" />}
      />
      <CardContent>
        <Grid container spacing={2}>
          {/* Fatture questo mese */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Box textAlign="center">
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <Receipt fontSize="small" color="primary" />
                <Typography variant="h4" fontWeight={600}>
                  {stats.month_count}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Fatture questo mese
              </Typography>
            </Box>
          </Grid>

          {/* Fatture accettate */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Box textAlign="center">
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <CheckCircle fontSize="small" color="success" />
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {stats.accepted_count}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Accettate
              </Typography>
            </Box>
          </Grid>

          {/* In attesa SDI */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Box textAlign="center">
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <HourglassEmpty fontSize="small" color="warning" />
                <Typography variant="h4" fontWeight={600} color="warning.main">
                  {stats.pending_count}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                In attesa SDI
              </Typography>
            </Box>
          </Grid>

          {/* Rifiutate */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Box textAlign="center">
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <Error fontSize="small" color="error" />
                <Typography variant="h4" fontWeight={600} color="error.main">
                  {stats.rejected_count}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Rifiutate
              </Typography>
            </Box>
          </Grid>

          {/* Totale fatturato */}
          <Grid size={12}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.50',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Totale Fatturato (con FE)
              </Typography>
              <Typography variant="h5" fontWeight={600} color="primary.main">
                {formatCurrency(stats.total_amount)}
              </Typography>
            </Box>
          </Grid>

          {/* Alert fatture rifiutate */}
          {stats.rejected_count > 0 && (
            <Grid size={12}>
              <Alert severity="error" icon={<Warning />}>
                <Typography variant="body2" fontWeight={600}>
                  {stats.rejected_count} fattur{stats.rejected_count === 1 ? 'a' : 'e'}{' '}
                  rifiutat{stats.rejected_count === 1 ? 'a' : 'e'} richied
                  {stats.rejected_count === 1 ? 'e' : 'ono'} attenzione
                </Typography>
                <Typography variant="caption">
                  Correggi gli errori SDI e reinvia le fatture.
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* API Usage (se disponibile) */}
          {stats.api_usage && (
            <Grid size={12}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Utilizzo Piano API
                  </Typography>
                  <Chip
                    label={`${stats.api_usage.used}/${stats.api_usage.limit}`}
                    size="small"
                    color={getApiUsageColor(stats.api_usage.percentage)}
                  />
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(stats.api_usage.percentage, 100)}
                  color={getApiUsageColor(stats.api_usage.percentage)}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                {stats.api_usage.percentage >= 80 && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                    ⚠️ Limite API quasi raggiunto. Considera l'upgrade del piano.
                  </Typography>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ElectronicInvoiceWidget;

