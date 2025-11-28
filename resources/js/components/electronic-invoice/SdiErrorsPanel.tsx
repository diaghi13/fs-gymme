import React from 'react';
import { Alert, AlertTitle, Box, Chip, Collapse, IconButton, Link, Stack, Typography } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AutoFixHigh as AutoFixIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

export interface ParsedSdiError {
  code: string | null;
  raw_message: string;
  description: string;
  suggestion: string;
  severity: 'critical' | 'high' | 'medium';
  auto_fixable: boolean;
  documentation_link: string;
}

interface SdiErrorsPanelProps {
  errors: ParsedSdiError[];
}

export default function SdiErrorsPanel({ errors }: SdiErrorsPanelProps) {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(0); // Prima espanso di default

  if (!errors || errors.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getSeverityColor = (severity: string): 'error' | 'warning' | 'info' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      default:
        return 'info';
    }
  };

  const handleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Errori SDI Rilevati ({errors.length})</AlertTitle>
        La fattura è stata rifiutata dal Sistema di Interscambio. Correggi gli errori sottostanti e riprova.
      </Alert>

      <Stack spacing={2}>
        {errors.map((error, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <Alert
              key={index}
              severity={getSeverityColor(error.severity)}
              icon={getSeverityIcon(error.severity)}
              sx={{
                '& .MuiAlert-message': { width: '100%' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ flex: 1 }}>
                  {/* Header con codice e badges */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {error.code && (
                      <Chip
                        label={`Codice ${error.code}`}
                        size="small"
                        color={getSeverityColor(error.severity)}
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={error.severity.toUpperCase()}
                      size="small"
                      color={getSeverityColor(error.severity)}
                    />
                    {error.auto_fixable && (
                      <Chip
                        icon={<AutoFixIcon />}
                        label="Auto-correggibile"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Descrizione */}
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {error.description}
                  </Typography>

                  {/* Collapse per dettagli */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      {/* Suggerimento */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          💡 Come Risolvere:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, pl: 2 }}>
                          {error.suggestion}
                        </Typography>
                      </Box>

                      {/* Messaggio raw (per debug) */}
                      {error.raw_message && error.raw_message !== error.description && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            📄 Messaggio Originale SDI:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              pl: 2,
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              color: 'text.secondary',
                            }}
                          >
                            {error.raw_message}
                          </Typography>
                        </Box>
                      )}

                      {/* Link documentazione */}
                      {error.documentation_link && (
                        <Box>
                          <Link
                            href={error.documentation_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}
                          >
                            <DescriptionIcon fontSize="small" />
                            Consulta la Documentazione Ufficiale SDI
                          </Link>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>

                {/* Expand button */}
                <IconButton
                  size="small"
                  onClick={() => handleExpand(index)}
                  sx={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                    ml: 1,
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
            </Alert>
          );
        })}
      </Stack>
    </Box>
  );
}

