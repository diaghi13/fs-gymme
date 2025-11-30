import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Delete, Edit, TrendingDown, TrendingUp } from '@mui/icons-material';
import { usePage } from '@inertiajs/react';
import { Customer, CustomerMeasurement } from '@/types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { route } from 'ziggy-js';
import DatePicker from '@/components/ui/DatePicker';
import TextField from '@/components/ui/TextField';
import { Formik, Form } from 'formik';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import MeasurementChartsSection from '@/components/customers/measurements/MeasurementChartsSection';
import FormattedDate from '@/components/ui/FormattedDate';

interface MeasurementFormValues {
  measured_at: string;
  weight: number | string;
  height: number | string;
  chest_circumference: number | string;
  waist_circumference: number | string;
  hips_circumference: number | string;
  arm_circumference: number | string;
  thigh_circumference: number | string;
  body_fat_percentage: number | string;
  lean_mass_percentage: number | string;
  notes: string;
}

const MeasurementsTab: React.FC = () => {
  const { customer } = usePage<{ customer: Customer }>().props;
  const [measurements, setMeasurements] = useState<CustomerMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<CustomerMeasurement | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('table');

  const fetchMeasurements = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        route('api.v1.customers.measurements.index', { customer: customer.id })
      );
      setMeasurements(response.data.measurements);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  }, [customer.id]);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  const handleOpenDialog = (measurement?: CustomerMeasurement) => {
    setEditingMeasurement(measurement || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMeasurement(null);
  };

  const handleSubmit = async (values: MeasurementFormValues) => {
    try {
      if (editingMeasurement) {
        await axios.put(
          route('api.v1.customers.measurements.update', {
            customer: customer.id,
            measurement: editingMeasurement.id,
          }),
          values
        );
      } else {
        await axios.post(
          route('api.v1.customers.measurements.store', { customer: customer.id }),
          values
        );
      }
      await fetchMeasurements();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving measurement:', error);
    }
  };

  const handleDelete = async () => {
    if (!measurementToDelete) return;

    try {
      await axios.delete(
        route('api.v1.customers.measurements.destroy', {
          customer: customer.id,
          measurement: measurementToDelete,
        })
      );
      await fetchMeasurements();
      setDeleteConfirmOpen(false);
      setMeasurementToDelete(null);
    } catch (error) {
      console.error('Error deleting measurement:', error);
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return null;
    return diff;
  };

  const renderTrend = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const trend = calculateTrend(current, previous);
    if (!trend) return null;

    return (
      <Chip
        size="small"
        icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
        label={`${trend > 0 ? '+' : ''}${trend.toFixed(1)}`}
        color={trend > 0 ? 'error' : 'success'}
        variant="outlined"
        sx={{ ml: 1 }}
      />
    );
  };

  const initialValues: MeasurementFormValues = {
    measured_at: editingMeasurement?.measured_at
      ? (typeof editingMeasurement.measured_at === 'string'
          ? editingMeasurement.measured_at
          : new Date(editingMeasurement.measured_at).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    weight: editingMeasurement?.weight || '',
    height: editingMeasurement?.height || '',
    chest_circumference: editingMeasurement?.chest_circumference || '',
    waist_circumference: editingMeasurement?.waist_circumference || '',
    hips_circumference: editingMeasurement?.hips_circumference || '',
    arm_circumference: editingMeasurement?.arm_circumference || '',
    thigh_circumference: editingMeasurement?.thigh_circumference || '',
    body_fat_percentage: editingMeasurement?.body_fat_percentage || '',
    lean_mass_percentage: editingMeasurement?.lean_mass_percentage || '',
    notes: editingMeasurement?.notes || '',
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Misurazioni Corporee
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuova Misurazione
        </Button>
      </Stack>

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <TabList onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Tabella" value="table" />
            <Tab label="Grafici" value="charts" />
          </TabList>
        </Box>

        <TabPanel value="table" sx={{ p: 0 }}>
          {measurements.length === 0 && !loading ? (
        <Alert severity="info">
          Nessuna misurazione registrata. Aggiungi la prima misurazione per iniziare a tracciare i progressi del cliente.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {/* Latest Measurement Card */}
          {measurements[0] && (
            <Grid size={12}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={600}>
                      Ultima Misurazione
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <FormattedDate value={measurements[0].measured_at} />
                    </Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    {measurements[0].weight && (
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Peso
                        </Typography>
                        <Typography variant="h6">
                          {measurements[0].weight} kg
                          {measurements[1]?.weight && renderTrend(measurements[0].weight, measurements[1].weight)}
                        </Typography>
                      </Grid>
                    )}
                    {measurements[0].height && (
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Altezza
                        </Typography>
                        <Typography variant="h6">{measurements[0].height} cm</Typography>
                      </Grid>
                    )}
                    {measurements[0].bmi && (
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          BMI
                        </Typography>
                        <Typography variant="h6">{measurements[0].bmi}</Typography>
                      </Grid>
                    )}
                    {measurements[0].body_fat_percentage && (
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          % Massa Grassa
                        </Typography>
                        <Typography variant="h6">
                          {measurements[0].body_fat_percentage}%
                          {measurements[1]?.body_fat_percentage &&
                            renderTrend(measurements[0].body_fat_percentage, measurements[1].body_fat_percentage)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Measurements History Table */}
          <Grid size={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Storico Misurazioni
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell align="right">Peso (kg)</TableCell>
                        <TableCell align="right">Altezza (cm)</TableCell>
                        <TableCell align="right">BMI</TableCell>
                        <TableCell align="right">Torace (cm)</TableCell>
                        <TableCell align="right">Vita (cm)</TableCell>
                        <TableCell align="right">Fianchi (cm)</TableCell>
                        <TableCell align="right">% Grasso</TableCell>
                        <TableCell align="center">Azioni</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {measurements.map((measurement) => (
                        <TableRow key={measurement.id}>
                          <TableCell>
                            <FormattedDate value={measurement.measured_at} />
                          </TableCell>
                          <TableCell align="right">{measurement.weight || '-'}</TableCell>
                          <TableCell align="right">{measurement.height || '-'}</TableCell>
                          <TableCell align="right">{measurement.bmi || '-'}</TableCell>
                          <TableCell align="right">{measurement.chest_circumference || '-'}</TableCell>
                          <TableCell align="right">{measurement.waist_circumference || '-'}</TableCell>
                          <TableCell align="right">{measurement.hips_circumference || '-'}</TableCell>
                          <TableCell align="right">{measurement.body_fat_percentage || '-'}</TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(measurement)}
                                color="primary"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setMeasurementToDelete(measurement.id);
                                  setDeleteConfirmOpen(true);
                                }}
                                color="error"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}
        </TabPanel>

        <TabPanel value="charts" sx={{ p: 0 }}>
          <MeasurementChartsSection measurements={measurements} />
        </TabPanel>
      </TabContext>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMeasurement ? 'Modifica Misurazione' : 'Nuova Misurazione'}
        </DialogTitle>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {() => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <DatePicker
                      label="Data Misurazione *"
                      name="measured_at"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Dati Principali
                    </Typography>
                  </Grid>

                  <Grid size={6}>
                    <TextField
                      label="Peso (kg)"
                      name="weight"
                      type="number"
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Altezza (cm)"
                      name="height"
                      type="number"
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                      Circonferenze (cm)
                    </Typography>
                  </Grid>

                  <Grid size={6}>
                    <TextField
                      label="Torace"
                      name="chest_circumference"
                      type="number"
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Vita"
                      name="waist_circumference"
                      type="number"
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Fianchi"
                      name="hips_circumference"
                      type="number"
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Braccio"
                      name="arm_circumference"
                      type="number"
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Coscia"
                      name="thigh_circumference"
                      type="number"
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                      Composizione Corporea (%)
                    </Typography>
                  </Grid>

                  <Grid size={6}>
                    <TextField
                      label="Massa Grassa %"
                      name="body_fat_percentage"
                      type="number"
                      inputProps={{ step: 0.1, min: 0, max: 100 }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Massa Magra %"
                      name="lean_mass_percentage"
                      type="number"
                      inputProps={{ step: 0.1, min: 0, max: 100 }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="Note"
                      name="notes"
                      multiline
                      rows={3}
                      helperText="Aggiungi eventuali note sulla misurazione..."
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Annulla</Button>
                <Button type="submit" variant="contained">
                  Salva
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Conferma Eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare questa misurazione? L'operazione non può essere annullata.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Annulla</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeasurementsTab;

