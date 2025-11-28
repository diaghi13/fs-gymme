import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  IconButton,
} from '@mui/material';
import { Close, Visibility } from '@mui/icons-material';
import { TemplatePreview } from './TemplatePreview';

interface TemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  template: 'classic' | 'modern' | 'minimal';
  templateLabel: string;
  templateDescription: string;
  onGenerateSample?: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  open,
  onClose,
  template,
  templateLabel,
  templateDescription,
  onGenerateSample,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Anteprima Template: {templateLabel}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            {templateDescription}
          </Typography>

          {/* Large preview */}
          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 3,
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              <TemplatePreview template={template} size="large" />
            </Box>
          </Box>

          {/* Template characteristics */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Caratteristiche del template:
            </Typography>
            {template === 'classic' && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  • Layout tradizionale professionale
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Header con logo a sinistra, informazioni fattura a destra
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Due colonne per dati cliente e cedente
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Colori: Blu (#1976d2) e grigio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Ideale per: Uso professionale standard
                </Typography>
              </Stack>
            )}
            {template === 'modern' && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  • Design contemporaneo e vivace
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Header centrato full-width
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Card con sfondo colorato per evidenziare sezioni
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Colori: Azzurro vivace (#3498db) con accenti
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Ideale per: Aziende moderne e creative
                </Typography>
              </Stack>
            )}
            {template === 'minimal' && (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  • Design essenziale e pulito
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Solo bianco e nero, nessun colore
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Typography essenziale senza decorazioni
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Focus totale sui dati e contenuti
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Ideale per: Approccio minimalista e sobrio
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Chiudi</Button>
        {onGenerateSample && (
          <Button
            variant="contained"
            startIcon={<Visibility />}
            onClick={onGenerateSample}
          >
            Genera PDF di Esempio
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
