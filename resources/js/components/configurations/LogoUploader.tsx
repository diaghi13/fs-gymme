import * as React from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material';
import { router } from '@inertiajs/react';

interface LogoUploaderProps {
  currentLogoPath?: string;
  onUploadSuccess?: (path: string) => void;
  tenantId: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogoPath,
  onUploadSuccess,
  tenantId,
}) => {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentLogoPath) {
      // Generate preview URL for current logo
      setPreview(`/storage/${currentLogoPath}`);
    }
  }, [currentLogoPath]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Il file deve essere un\'immagine');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Il file non deve superare 2MB');
      return;
    }

    setError(null);
    setUploading(true);

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch(
        route('app.configurations.invoice.upload-logo', { tenant: tenantId }),
        {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        if (onUploadSuccess) {
          onUploadSuccess(data.path);
        }
        // Refresh page to update settings
        router.reload({ only: ['settings'] });
      } else {
        setError(data.message || 'Errore durante l\'upload');
        setPreview(currentLogoPath ? `/storage/${currentLogoPath}` : null);
      }
    } catch (err) {
      setError('Errore di rete durante l\'upload');
      setPreview(currentLogoPath ? `/storage/${currentLogoPath}` : null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare il logo?')) {
      setPreview(null);
      if (onUploadSuccess) {
        onUploadSuccess('');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {preview ? (
          <Box
            sx={{
              position: 'relative',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
              bgcolor: 'background.default',
            }}
          >
            <img
              src={preview}
              alt="Logo preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
              }}
            />
            <IconButton
              onClick={handleDelete}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
              }}
              size="small"
            >
              <Delete />
            </IconButton>
          </Box>
        ) : (
          <Box
            onClick={triggerFileInput}
            sx={{
              border: 2,
              borderColor: 'divider',
              borderStyle: 'dashed',
              borderRadius: 1,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'background.default',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Clicca per selezionare un logo
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PNG, JPG, GIF, SVG (max 2MB)
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
          onClick={triggerFileInput}
          disabled={uploading}
          fullWidth
        >
          {uploading ? 'Caricamento...' : preview ? 'Cambia Logo' : 'Carica Logo'}
        </Button>

        {currentLogoPath && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Percorso attuale: {currentLogoPath}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
