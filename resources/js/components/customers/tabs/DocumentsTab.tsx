import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Add,
  Delete,
  Download,
  Visibility,
  Warning,
  Shield,
  Lock
} from '@mui/icons-material';
import { usePage, router } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { File as FileType } from '@/types';
import UploadFileDialog from '@/components/customers/dialogs/UploadFileDialog';
import FormattedDate from '@/components/ui/FormattedDate';

interface DocumentsTabProps {}

const FILE_TYPES = {
  medical_certificate: { label: 'Certificato Medico', color: 'success' as const, requiresConsent: true },
  photo: { label: 'Foto', color: 'info' as const, requiresConsent: true },
  contract: { label: 'Contratto', color: 'primary' as const, requiresConsent: false },
  id_card: { label: 'Documento Identità', color: 'warning' as const, requiresConsent: true },
  other: { label: 'Altro', color: 'default' as const, requiresConsent: false },
};

const DocumentsTab: React.FC<DocumentsTabProps> = () => {
  const { customer, currentTenantId } = usePage<CustomerShowProps>().props;
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<string>('');
  const [localFiles, setLocalFiles] = React.useState<FileType[]>(customer.files || []);

  // GDPR checks - using !! to ensure boolean conversion
  const hasPhotoConsent = !!customer.photo_consent;
  const hasMedicalDataConsent = !!customer.medical_data_consent;
  const hasGDPRConsent = !!customer.gdpr_consent;


  const handleOpenUploadDialog = (type: string = '') => {
    setSelectedType(type);
    setUploadDialogOpen(true);
  };

  const handleDelete = async (fileId: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo file? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await fetch(route('api.v1.files.destroy', { file: fileId }), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Tenant': currentTenantId || '',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione del file');
      }

      // Update local state instead of reloading the page
      setLocalFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    } catch (err) {
      alert('Errore durante l\'eliminazione del file');
    }
  };

  const handleDownload = (file: FileType) => {
    const url = route('api.v1.files.download', { file: file.id });
    const urlWithTenant = `${url}${url.includes('?') ? '&' : '?'}tenant=${currentTenantId}`;
    window.open(urlWithTenant, '_blank');
  };

  const handleView = (file: FileType) => {
    const url = route('api.v1.files.show', { file: file.id });
    const urlWithTenant = `${url}${url.includes('?') ? '&' : '?'}tenant=${currentTenantId}`;
    window.open(urlWithTenant, '_blank');
  };

  const canAccessFile = (file: FileType): { canAccess: boolean; reason?: string } => {
    const fileTypeConfig = FILE_TYPES[file.type as keyof typeof FILE_TYPES] || FILE_TYPES.other;

    if (!fileTypeConfig.requiresConsent) {
      return { canAccess: true };
    }

    // Check specific consents
    if (file.type === 'photo' && !hasPhotoConsent) {
      return { canAccess: false, reason: 'Consenso foto mancante' };
    }

    if (file.type === 'medical_certificate' && !hasMedicalDataConsent) {
      return { canAccess: false, reason: 'Consenso dati medici mancante' };
    }

    if ((file.type === 'id_card') && !hasGDPRConsent) {
      return { canAccess: false, reason: 'Consenso GDPR mancante' };
    }

    return { canAccess: true };
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return 'description';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('application/pdf')) return 'picture_as_pdf';
    if (mimeType.startsWith('video/')) return 'videocam';
    return 'description';
  };

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {/* GDPR Warning */}
      {(!hasGDPRConsent || !hasMedicalDataConsent || !hasPhotoConsent) && (
        <Grid size={12}>
          <Alert severity="warning" icon={<Shield />}>
            <Typography variant="body2" fontWeight={500}>
              Attenzione: Alcuni consensi GDPR sono mancanti
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {!hasGDPRConsent && (
                <Typography variant="caption">
                  • Consenso GDPR base mancante - L'accesso ai documenti di identità è limitato
                </Typography>
              )}
              {!hasMedicalDataConsent && (
                <Typography variant="caption">
                  • Consenso dati medici mancante - L'accesso ai certificati medici è limitato
                </Typography>
              )}
              {!hasPhotoConsent && (
                <Typography variant="caption">
                  • Consenso foto mancante - L'accesso alle foto è limitato
                </Typography>
              )}
            </Stack>
          </Alert>
        </Grid>
      )}

      {/* Upload Button */}
      <Grid size={12}>
        <Card>
          <CardHeader
            title="Documenti e File"
            subheader="Gestisci i file del cliente (certificati, foto, contratti, etc.)"
            action={
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenUploadDialog()}
              >
                Carica File
              </Button>
            }
          />
          <CardContent>
            {localFiles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Nessun file caricato
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => handleOpenUploadDialog()}
                  sx={{ mt: 2 }}
                >
                  Carica il primo file
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome File</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Dimensione</TableCell>
                      <TableCell>Scadenza</TableCell>
                      <TableCell>Caricato il</TableCell>
                      <TableCell>Descrizione</TableCell>
                      <TableCell align="right">Azioni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {localFiles.map((file) => {
                      const access = canAccessFile(file);
                      const fileTypeConfig = FILE_TYPES[file.type as keyof typeof FILE_TYPES] || FILE_TYPES.other;
                      const isExpired = file.is_expired;

                      return (
                        <TableRow key={file.id} sx={{ opacity: access.canAccess ? 1 : 0.6 }}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {!access.canAccess && (
                                <Tooltip title={access.reason}>
                                  <Lock fontSize="small" color="warning" />
                                </Tooltip>
                              )}
                              <Typography variant="body2">{file.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fileTypeConfig.label}
                              size="small"
                              color={fileTypeConfig.color}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {file.human_readable_size || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {file.expires_at ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                {isExpired && <Warning fontSize="small" color="error" />}
                                <Typography
                                  variant="caption"
                                  color={isExpired ? 'error' : 'text.secondary'}
                                >
                                  <FormattedDate value={file.expires_at} showTime />
                                </Typography>
                              </Stack>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              <FormattedDate value={file.created_at} showTime />
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                              {file.description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title={access.canAccess ? 'Visualizza' : access.reason}>
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleView(file)}
                                    disabled={!access.canAccess}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={access.canAccess ? 'Scarica' : access.reason}>
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownload(file)}
                                    disabled={!access.canAccess}
                                  >
                                    <Download fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Elimina">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(file.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* GDPR Compliance Info */}
      <Grid size={12}>
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Shield color="primary" />
              <Typography variant="subtitle2">Conformità GDPR</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              I file caricati sono soggetti alle normative GDPR. L'accesso ai file contenenti dati sensibili
              (certificati medici, foto, documenti di identità) è consentito solo se il cliente ha fornito
              il consenso specifico. I file vengono conservati fino alla data di scadenza della retention
              dei dati: <strong>{customer.data_retention_until ? <FormattedDate value={customer.data_retention_until} showTime /> : 'Non definita'}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Upload Dialog */}
      <UploadFileDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        fileableType="App\Models\Customer\Customer"
        fileableId={customer.id}
        preselectedType={selectedType}
        onFileUploaded={(newFile) => setLocalFiles(prevFiles => [newFile, ...prevFiles])}
      />
    </Grid>
  );
};

export default DocumentsTab;
