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
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  FlipCameraAndroid as FlipIcon,
  Refresh as RetryIcon,
} from '@mui/icons-material';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Customer } from '@/types';

interface WebcamAvatarDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
}

const WebcamAvatarDialog: React.FC<WebcamAvatarDialogProps> = ({ open, onClose, customer }) => {
  const { currentTenantId } = usePage().props as { currentTenantId: string };
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('user');

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
        setError('Accesso alla webcam negato. Per favore, consenti l\'accesso alla fotocamera nelle impostazioni del browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Nessuna webcam trovata. Assicurati che una fotocamera sia collegata.');
      } else {
        setError('Impossibile accedere alla webcam. Verifica i permessi del browser.');
      }
      console.error('Webcam error:', err);
    }
  }, [facingMode]);

  // Start webcam when dialog opens
  React.useEffect(() => {
    if (open && !capturedImage && !stream) {
      startWebcam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, capturedImage, stream, facingMode]);

  // Cleanup webcam when dialog closes or component unmounts
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

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

  // Retry capture
  const retryCapture = () => {
    setCapturedImage(null);
    setError(null);
    // WebcamAvatarDialog will restart automatically via useEffect when capturedImage becomes null
  };

  // Flip camera
  const flipCamera = () => {
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    // Change facing mode - useEffect will restart the camera
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Upload avatar
  const handleUpload = async () => {
    if (!capturedImage) return;

    setProcessing(true);
    setError(null);

    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.jpg');

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
            onClose();
            setCapturedImage(null);
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
    // Stop all tracks immediately
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scatta Foto Avatar</DialogTitle>
      <DialogContent>
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
              {/* Video preview */}
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
                {/* Darkened corners */}
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

                {/* Crosshair lines */}
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

              {/* Instructions */}
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
            /* Captured image preview */
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

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Action buttons */}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={processing}>
          Annulla
        </Button>
        {capturedImage && (
          <Button onClick={handleUpload} variant="contained" disabled={processing}>
            {processing ? 'Caricamento...' : 'Salva Avatar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WebcamAvatarDialog;
