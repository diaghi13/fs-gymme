import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Alert,
  Stack,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  FlipCameraAndroid as FlipIcon,
  Refresh as RetryIcon,
  Upload as UploadIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Customer } from '@/types';
import { useDropzone } from 'react-dropzone';

interface AvatarUploadDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
}

type UploadMode = 'choose' | 'webcam' | 'upload';

const AvatarUploadDialog: React.FC<AvatarUploadDialogProps> = ({ open, onClose, customer }) => {
  const { currentTenantId } = usePage().props as { currentTenantId: string };
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = React.useState<UploadMode>('choose');
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('user');

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          setError('Il file è troppo grande. Dimensione massima: 2MB');
        } else if (error.code === 'file-invalid-type') {
          setError('Tipo di file non supportato. Usa JPG, PNG, GIF o WebP');
        } else {
          setError('Errore durante il caricamento del file');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
      }
    },
  });

  // Stop webcam
  const stopWebcam = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start webcam
  const startWebcam = React.useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Accesso alla webcam negato. Consenti l\'accesso alla fotocamera nelle impostazioni del browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Nessuna webcam trovata. Assicurati che una fotocamera sia collegata.');
      } else {
        setError('Impossibile accedere alla webcam. Verifica i permessi del browser.');
      }
      console.error('Webcam error:', err);
    }
  }, [facingMode]);

  // Start webcam when mode changes to webcam
  React.useEffect(() => {
    if (mode === 'webcam' && !capturedImage && !stream) {
      startWebcam();
    }
  }, [mode, capturedImage, stream, startWebcam]);

  // Cleanup webcam when dialog closes or mode changes
  React.useEffect(() => {
    if (mode !== 'webcam') {
      stopWebcam();
    }
  }, [mode, stopWebcam]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [stream, previewUrl]);

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to square (use smaller dimension)
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    // Calculate crop position to center the image
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    // Draw cropped square image
    context.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    stopWebcam();
  };

  // Retry capture (webcam)
  const retryCapture = () => {
    setCapturedImage(null);
    setError(null);
  };

  // Retry upload
  const retryUpload = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
  };

  // Flip camera
  const flipCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Upload avatar
  const handleUpload = async () => {
    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();

      if (mode === 'webcam' && capturedImage) {
        // Convert data URL to blob
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        formData.append('avatar', blob, 'avatar.jpg');
      } else if (mode === 'upload' && uploadedFile) {
        formData.append('avatar', uploadedFile);
      } else {
        setError('Nessuna immagine selezionata');
        setProcessing(false);
        return;
      }

      // Upload using Inertia
      router.post(
        route('app.customers.avatar.upload', {
          customer: customer.id,
          tenant: currentTenantId,
        }),
        formData,
        {
          preserveScroll: true,
          onSuccess: () => {
            handleClose();
          },
          onError: (errors) => {
            setError(Object.values(errors).join(', '));
          },
          onFinish: () => {
            setProcessing(false);
          },
        }
      );
    } catch (err) {
      setError('Errore durante il caricamento dell\'avatar');
      setProcessing(false);
    }
  };

  const handleClose = () => {
    stopWebcam();
    setCapturedImage(null);
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    setMode('choose');
    onClose();
  };

  const handleBack = () => {
    stopWebcam();
    setCapturedImage(null);
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    setMode('choose');
  };

  // Render mode selection
  const renderModeSelection = () => (
    <Stack spacing={3} sx={{ py: 3 }}>
      <Typography variant="body2" color="text.secondary" align="center">
        Scegli come vuoi caricare la foto avatar
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Paper
          component="button"
          onClick={() => setMode('webcam')}
          sx={{
            flex: 1,
            p: 4,
            cursor: 'pointer',
            border: '2px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <Stack spacing={2} alignItems="center">
            <PhotoCameraIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6">Scatta Foto</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Usa la webcam per scattare una foto
            </Typography>
          </Stack>
        </Paper>

        <Paper
          component="button"
          onClick={() => setMode('upload')}
          sx={{
            flex: 1,
            p: 4,
            cursor: 'pointer',
            border: '2px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <Stack spacing={2} alignItems="center">
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6">Carica File</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Carica un'immagine dal tuo dispositivo
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );

  // Render webcam mode
  const renderWebcamMode = () => (
    <>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={startWebcam}>
              Riprova
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', borderRadius: 2, bgcolor: 'black' }}>
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Guide overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.4)',
                  border: '3px solid white',
                  borderRadius: '50%',
                  margin: '10%',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  right: '0',
                  height: '1px',
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  bottom: '0',
                  width: '1px',
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                }}
              />
            </Box>

            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 0,
                right: 0,
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="caption" sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.6)', px: 2, py: 1, borderRadius: 1 }}>
                Posiziona il viso al centro del cerchio
              </Typography>
            </Box>
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured avatar"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
        )}
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!capturedImage ? (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <IconButton onClick={flipCamera} color="primary" title="Cambia fotocamera">
            <FlipIcon />
          </IconButton>
          <IconButton
            onClick={capturePhoto}
            color="primary"
            disabled={!stream}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 64,
              height: 64,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <CameraIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Button startIcon={<RetryIcon />} onClick={retryCapture} disabled={processing}>
            Riprova
          </Button>
        </Stack>
      )}
    </>
  );

  // Render upload mode
  const renderUploadMode = () => (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!uploadedFile ? (
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <input {...getInputProps()} />
          <Stack spacing={2} alignItems="center">
            <UploadIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            <Typography variant="h6">
              {isDragActive ? 'Rilascia il file qui' : 'Trascina un\'immagine qui'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              oppure clicca per selezionare un file
            </Typography>
            <Typography variant="caption" color="text.secondary">
              JPG, PNG, GIF o WebP - Massimo 2MB
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <Box>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%',
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: 'black',
            }}
          >
            <img
              src={previewUrl!}
              alt="Preview"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          </Box>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button startIcon={<RetryIcon />} onClick={retryUpload} disabled={processing}>
              Cambia File
            </Button>
          </Stack>
        </Box>
      )}
    </>
  );

  const canUpload =
    (mode === 'webcam' && capturedImage) ||
    (mode === 'upload' && uploadedFile);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {mode === 'choose' ? 'Carica Avatar' : mode === 'webcam' ? 'Scatta Foto' : 'Carica Immagine'}
          </Typography>
          {mode !== 'choose' && (
            <IconButton onClick={handleBack} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        {mode === 'choose' && renderModeSelection()}
        {mode === 'webcam' && renderWebcamMode()}
        {mode === 'upload' && renderUploadMode()}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={processing}>
          Annulla
        </Button>
        {canUpload && (
          <Button onClick={handleUpload} variant="contained" disabled={processing}>
            {processing ? 'Caricamento...' : 'Salva Avatar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AvatarUploadDialog;
