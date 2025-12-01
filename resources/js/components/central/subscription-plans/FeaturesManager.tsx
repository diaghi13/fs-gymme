import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useFormikContext } from 'formik';
import { NumericFormat } from 'react-number-format';

interface PlanFeature {
  id: number;
  name: string;
  display_name: string;
  feature_type: 'boolean' | 'quota' | 'metered';
  is_addon_purchasable: boolean;
  default_addon_price_cents: number | null;
  default_addon_quota: number | null;
}

interface AttachedFeature {
  feature_id: number;
  is_included: boolean;
  quota_limit: number | null;
  price_cents: number | null;
}

interface FormValues {
  features: AttachedFeature[];
  [key: string]: any;
}

interface FeaturesManagerProps {
  availableFeatures: PlanFeature[];
  currentFeatures: Array<{
    id: number;
    name: string;
    display_name: string;
    feature_type: string;
    is_included: boolean;
    quota_limit: number | null;
    price_cents: number | null;
  }>;
}

const FeaturesManager: React.FC<FeaturesManagerProps> = ({ availableFeatures, currentFeatures }) => {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<PlanFeature | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    is_included: true,
    quota_limit: 0,
    price_cents: 0,
  });

  // Initialize features array if not present
  React.useEffect(() => {
    if (!values.features) {
      const initialFeatures = currentFeatures.map(f => ({
        feature_id: f.id,
        is_included: f.is_included,
        quota_limit: f.quota_limit,
        price_cents: f.price_cents,
      }));
      setFieldValue('features', initialFeatures);
    }
  }, []);

  const features = values.features || [];

  const handleOpenDialog = (feature?: PlanFeature, index?: number) => {
    if (feature && index !== undefined) {
      // Editing existing
      setSelectedFeature(feature);
      setEditingIndex(index);
      const existing = features[index];
      setFormData({
        is_included: existing.is_included,
        quota_limit: existing.quota_limit || 0,
        price_cents: existing.price_cents || 0,
      });
    } else if (feature) {
      // Adding new
      setSelectedFeature(feature);
      setEditingIndex(null);
      setFormData({
        is_included: true,
        quota_limit: feature.default_addon_quota || 0,
        price_cents: feature.default_addon_price_cents || 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFeature(null);
    setEditingIndex(null);
  };

  const handleSaveFeature = () => {
    if (!selectedFeature) return;

    const newFeature: AttachedFeature = {
      feature_id: selectedFeature.id,
      is_included: formData.is_included,
      quota_limit: formData.quota_limit || null,
      price_cents: formData.price_cents || null,
    };

    if (editingIndex !== null) {
      // Update existing
      const updated = [...features];
      updated[editingIndex] = newFeature;
      setFieldValue('features', updated);
    } else {
      // Add new
      setFieldValue('features', [...features, newFeature]);
    }

    handleCloseDialog();
  };

  const handleRemoveFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    setFieldValue('features', updated);
  };

  const getFeatureById = (featureId: number) => {
    return availableFeatures.find(f => f.id === featureId);
  };

  const availableToAdd = availableFeatures.filter(
    f => !features.some(attached => attached.feature_id === f.id)
  );

  const typeLabels: Record<string, string> = {
    boolean: 'Sì/No',
    quota: 'Con Quota',
    metered: 'A Consumo'
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Features Associate</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={availableToAdd.length === 0}
        >
          Aggiungi Feature
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Feature</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="center">Incluso</TableCell>
              <TableCell align="right">Limite Quota</TableCell>
              <TableCell align="right">Prezzo Addon (€)</TableCell>
              <TableCell align="right">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Nessuna feature associata
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              features.map((attachedFeature, index) => {
                const feature = getFeatureById(attachedFeature.feature_id);
                if (!feature) return null;

                return (
                  <TableRow key={index}>
                    <TableCell>{feature.display_name}</TableCell>
                    <TableCell>
                      <Chip label={typeLabels[feature.feature_type]} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      {attachedFeature.is_included ? 'Sì' : 'No'}
                    </TableCell>
                    <TableCell align="right">
                      {attachedFeature.quota_limit || '-'}
                    </TableCell>
                    <TableCell align="right">
                      {attachedFeature.price_cents
                        ? `€${(attachedFeature.price_cents / 100).toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(feature, index)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Modifica Feature' : 'Seleziona Feature'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {editingIndex === null && (
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Seleziona una feature da aggiungere:
                </Typography>
                <Stack spacing={1}>
                  {availableToAdd.map(feature => (
                    <Button
                      key={feature.id}
                      variant={selectedFeature?.id === feature.id ? 'contained' : 'outlined'}
                      onClick={() => {
                        setSelectedFeature(feature);
                        setFormData({
                          is_included: true,
                          quota_limit: feature.default_addon_quota || 0,
                          price_cents: feature.default_addon_price_cents || 0,
                        });
                      }}
                      fullWidth
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{feature.display_name}</Typography>
                        <Chip label={typeLabels[feature.feature_type]} size="small" />
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              </Grid>
            )}

            {selectedFeature && (
              <>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_included}
                        onChange={(e) => setFormData({ ...formData, is_included: e.target.checked })}
                      />
                    }
                    label="Incluso nel piano"
                  />
                </Grid>

                {selectedFeature.feature_type !== 'boolean' && (
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label="Limite Quota"
                      type="number"
                      value={formData.quota_limit}
                      onChange={(e) => setFormData({ ...formData, quota_limit: Number(e.target.value) })}
                      helperText="0 = illimitato"
                    />
                  </Grid>
                )}

                {selectedFeature.is_addon_purchasable && (
                  <Grid size={6}>
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      label="Prezzo Addon"
                      thousandSeparator="."
                      decimalSeparator=","
                      valueIsNumericString
                      prefix="€"
                      decimalScale={2}
                      fixedDecimalScale
                      value={formData.price_cents ? (formData.price_cents / 100) : 0}
                      onValueChange={(values) => {
                        const euros = values.floatValue || 0;
                        setFormData({ ...formData, price_cents: Math.round(euros * 100) });
                      }}
                      helperText="Prezzo in euro"
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button
            onClick={handleSaveFeature}
            variant="contained"
            disabled={!selectedFeature}
          >
            {editingIndex !== null ? 'Salva' : 'Aggiungi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeaturesManager;
