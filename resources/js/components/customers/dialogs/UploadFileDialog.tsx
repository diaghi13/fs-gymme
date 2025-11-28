import * as React from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { it } from 'date-fns/locale';
import { router, usePage } from '@inertiajs/react';
import { CloudUpload, Shield } from '@mui/icons-material';
import { PageProps } from '@/types';

interface UploadFileDialogProps {
  open: boolean;
  onClose: () => void;
  fileableType: string;
  fileableId: number;
  preselectedType?: string;
  onFileUploaded?: (file: any) => void;
}

const FILE_TYPES = [
  { value: 'medical_certificate', label: 'Certificato Medico', requiresConsent: 'medical_data_consent', hasExpiry: true },
  { value: 'photo', label: 'Foto', requiresConsent: 'photo_consent', hasExpiry: false },
  { value: 'contract', label: 'Contratto', requiresConsent: null, hasExpiry: false },
  { value: 'id_card', label: 'Documento Identità', requiresConsent: 'gdpr_consent', hasExpiry: true },
  { value: 'other', label: 'Altro', requiresConsent: null, hasExpiry: false },
];

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
  open,
  onClose,
  fileableType,
  fileableId,
  preselectedType = '',
  onFileUploaded,
}) => {
  const { props } = usePage<PageProps>();
  const [file, setFile] = React.useState<File | null>(null);
  const [type, setType] = React.useState(preselectedType);
  const [description, setDescription] = React.useState('');
  const [expiresAt, setExpiresAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (preselectedType) {
      setType(preselectedType);
    }
  }, [preselectedType]);

  const selectedFileType = FILE_TYPES.find(ft => ft.value === type);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('Il file è troppo grande. Dimensione massima: 50MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      // Check file size (50MB max)
      if (droppedFile.size > 50 * 1024 * 1024) {
        setError('Il file è troppo grande. Dimensione massima: 50MB');
        return;
      }

      setFile(droppedFile);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Seleziona un file da caricare');
      return;
    }

    if (!type) {
      setError('Seleziona il tipo di file');
      return;
    }

    // GDPR consent check
    if (selectedFileType?.requiresConsent) {
      // This would need to be checked against actual customer data
      // For now, we show a warning
      console.warn(`Upload requires ${selectedFileType.requiresConsent} consent`);
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileable_type', fileableType);
    formData.append('fileable_id', fileableId.toString());
    formData.append('type', type);
    if (description) {
      formData.append('description', description);
    }
    if (expiresAt) {
      formData.append('expires_at', expiresAt.toISOString().split('T')[0]);
    }

    // Use fetch API for file upload
    try {
      const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(route('api.v1.files.store'), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Tenant': props.currentTenantId || '',
          'Accept': 'application/json',
        },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const responseData = await response.json();
      setUploadProgress(100);

      // Call the callback with the uploaded file data
      setTimeout(() => {
        if (onFileUploaded && responseData.file) {
          onFileUploaded(responseData.file);
        }
        onClose();
        // Reset form
        setFile(null);
        setType(preselectedType);
        setDescription('');
        setExpiresAt(null);
        setUploadProgress(0);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Errore durante il caricamento del file');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Carica File</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Carica un nuovo file per il cliente. Assicurati di avere i consensi GDPR necessari.
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
            {/* File Type Selection */}
            <FormControl fullWidth required>
              <InputLabel>Tipo di File</InputLabel>
              <Select
                value={type}
                label="Tipo di File"
                onChange={(e) => setType(e.target.value)}
              >
                {FILE_TYPES.map((fileType) => (
                  <MenuItem key={fileType.value} value={fileType.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{fileType.label}</span>
                      {fileType.requiresConsent && (
                        <Shield fontSize="small" color="warning" />
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* GDPR Warning */}
            {selectedFileType?.requiresConsent && (
              <Alert severity="warning" icon={<Shield />}>
                <Typography variant="caption">
                  <strong>GDPR:</strong> Questo tipo di file richiede il consenso specifico del cliente
                  per {selectedFileType.requiresConsent === 'medical_data_consent' ? 'dati medici' :
                      selectedFileType.requiresConsent === 'photo_consent' ? 'foto' : 'GDPR base'}.
                  Verifica che il cliente abbia fornito il consenso prima di caricare.
                </Typography>
              </Alert>
            )}

            {/* Dropzone */}
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                border: 2,
                borderStyle: 'dashed',
                borderColor: isDragging ? 'primary.main' : file ? 'success.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                bgcolor: isDragging ? 'primary.lighter' : file ? 'success.lighter' : 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.lighter',
                },
              }}
            >
              <input
                type="file"
                hidden
                id="file-upload"
                onChange={handleFileChange}
                accept="*/*"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <Stack spacing={1} alignItems="center">
                  <CloudUpload sx={{ fontSize: 48, color: file ? 'success.main' : 'text.secondary' }} />
                  {file ? (
                    <>
                      <Typography variant="body1" fontWeight={500}>
                        {file.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                          size="small"
                          color="success"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {file.type || 'Tipo sconosciuto'}
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                      >
                        Cambia file
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="body1">
                        Trascina un file qui o clicca per selezionare
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Dimensione massima: 50MB
                      </Typography>
                    </>
                  )}
                </Stack>
              </label>
            </Box>

            {/* Expiry Date (for certain file types) */}
            {selectedFileType?.hasExpiry && (
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                <DatePicker
                  label="Data di Scadenza"
                  value={expiresAt}
                  onChange={(newValue) => setExpiresAt(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Opzionale - imposta una data di scadenza per il file',
                    },
                  }}
                />
              </LocalizationProvider>
            )}

            {/* Description */}
            <TextField
              label="Descrizione (opzionale)"
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aggiungi una descrizione o note sul file..."
              fullWidth
            />

            {/* Upload Progress */}
            {uploading && (
              <Box>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Caricamento in corso... {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={uploading}>
            Annulla
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={uploading || !file}
            startIcon={<CloudUpload />}
          >
            {uploading ? 'Caricamento...' : 'Carica'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UploadFileDialog;
