import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Typography,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CustomerMeasurement } from '@/types';
import { format, subMonths, subYears, isAfter } from 'date-fns';
import { it } from 'date-fns/locale';

interface MeasurementChartsSectionProps {
  measurements: CustomerMeasurement[];
}

type PeriodType = '1m' | '3m' | '6m' | '1y' | 'all';

const MeasurementChartsSection: React.FC<MeasurementChartsSectionProps> = ({ measurements }) => {
  const [period, setPeriod] = React.useState<PeriodType>('3m');

  // Filter measurements by period
  const filteredMeasurements = React.useMemo(() => {
    if (period === 'all') return measurements;

    const now = new Date();
    const cutoffDate = period === '1m' ? subMonths(now, 1)
      : period === '3m' ? subMonths(now, 3)
      : period === '6m' ? subMonths(now, 6)
      : subYears(now, 1);

    return measurements.filter(m =>
      isAfter(new Date(m.measured_at), cutoffDate)
    );
  }, [measurements, period]);

  // Prepare data for weight/BMI chart
  const weightBmiData = React.useMemo(() => {
    return filteredMeasurements
      .slice()
      .reverse()
      .map(m => ({
        date: format(new Date(m.measured_at), 'dd/MM', { locale: it }),
        peso: m.weight ? parseFloat(m.weight.toString()) : null,
        bmi: m.bmi ? parseFloat(m.bmi.toString()) : null,
      }));
  }, [filteredMeasurements]);

  // Prepare data for body composition chart
  const compositionData = React.useMemo(() => {
    return filteredMeasurements
      .slice()
      .reverse()
      .map(m => ({
        date: format(new Date(m.measured_at), 'dd/MM', { locale: it }),
        grasso: m.body_fat_percentage ? parseFloat(m.body_fat_percentage.toString()) : null,
        magra: m.lean_mass_percentage ? parseFloat(m.lean_mass_percentage.toString()) : null,
      }));
  }, [filteredMeasurements]);

  // Prepare data for circumferences radar chart (latest measurement only)
  const radarData = React.useMemo(() => {
    if (filteredMeasurements.length === 0) return [];

    const latest = filteredMeasurements[0];
    const data = [];

    if (latest.chest_circumference) {
      data.push({
        subject: 'Torace',
        value: parseFloat(latest.chest_circumference.toString()),
        fullMark: 150
      });
    }
    if (latest.waist_circumference) {
      data.push({
        subject: 'Vita',
        value: parseFloat(latest.waist_circumference.toString()),
        fullMark: 150
      });
    }
    if (latest.hips_circumference) {
      data.push({
        subject: 'Fianchi',
        value: parseFloat(latest.hips_circumference.toString()),
        fullMark: 150
      });
    }
    if (latest.arm_circumference) {
      data.push({
        subject: 'Braccio',
        value: parseFloat(latest.arm_circumference.toString()),
        fullMark: 60
      });
    }
    if (latest.thigh_circumference) {
      data.push({
        subject: 'Coscia',
        value: parseFloat(latest.thigh_circumference.toString()),
        fullMark: 100
      });
    }

    return data;
  }, [filteredMeasurements]);

  if (measurements.length === 0) {
    return (
      <Alert severity="info">
        Nessuna misurazione disponibile per visualizzare i grafici.
        Aggiungi almeno 2 misurazioni per vedere i progressi.
      </Alert>
    );
  }

  if (measurements.length === 1) {
    return (
      <Alert severity="info">
        Servono almeno 2 misurazioni per visualizzare i grafici di progressione.
        Aggiungi un'altra misurazione per vedere l'andamento nel tempo.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Period Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, newPeriod) => newPeriod && setPeriod(newPeriod)}
          size="small"
        >
          <ToggleButton value="1m">1 Mese</ToggleButton>
          <ToggleButton value="3m">3 Mesi</ToggleButton>
          <ToggleButton value="6m">6 Mesi</ToggleButton>
          <ToggleButton value="1y">1 Anno</ToggleButton>
          <ToggleButton value="all">Tutto</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {filteredMeasurements.length === 0 ? (
        <Alert severity="warning">
          Nessuna misurazione nel periodo selezionato. Prova a selezionare un periodo più ampio.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Weight Progress Chart */}
          {weightBmiData.some(d => d.peso) && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="Progressione Peso"
                  subheader={`Ultimi ${filteredMeasurements.length} rilevamenti`}
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weightBmiData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }}
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value} kg`, 'Peso']}
                      />
                      <Area
                        type="monotone"
                        dataKey="peso"
                        stroke="#2196f3"
                        fillOpacity={1}
                        fill="url(#colorWeight)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* BMI Trend Chart */}
          {weightBmiData.some(d => d.bmi) && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="Andamento BMI"
                  subheader="Indice di massa corporea"
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weightBmiData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        label={{ value: 'BMI', angle: -90, position: 'insideLeft' }}
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip
                        formatter={(value: number) => [value.toFixed(1), 'BMI']}
                      />
                      <Line
                        type="monotone"
                        dataKey="bmi"
                        stroke="#ff9800"
                        strokeWidth={2}
                        dot={{ fill: '#ff9800', r: 4 }}
                      />
                      {/* BMI reference lines */}
                      <Line
                        type="monotone"
                        dataKey={() => 25}
                        stroke="#f44336"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey={() => 18.5}
                        stroke="#4caf50"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    Range normale: 18.5 - 25
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Body Composition Chart */}
          {compositionData.some(d => d.grasso || d.magra) && (
            <Grid size={12}>
              <Card>
                <CardHeader
                  title="Composizione Corporea"
                  subheader="% Massa grassa vs massa magra"
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={compositionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        label={{ value: 'Percentuale (%)', angle: -90, position: 'insideLeft' }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, '']}
                      />
                      <Legend />
                      {compositionData.some(d => d.grasso) && (
                        <Bar
                          dataKey="grasso"
                          fill="#f44336"
                          name="Massa Grassa"
                        />
                      )}
                      {compositionData.some(d => d.magra) && (
                        <Bar
                          dataKey="magra"
                          fill="#4caf50"
                          name="Massa Magra"
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Circumferences Radar Chart */}
          {radarData.length > 0 && (
            <Grid size={12}>
              <Card>
                <CardHeader
                  title="Circonferenze Attuali"
                  subheader={`Ultima misurazione: ${format(new Date(filteredMeasurements[0].measured_at), 'dd MMMM yyyy', { locale: it })}`}
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
                      <Radar
                        name="Circonferenze (cm)"
                        dataKey="value"
                        stroke="#9c27b0"
                        fill="#9c27b0"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value} cm`, 'Circonferenza']}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default MeasurementChartsSection;

