import React from 'react';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab';
import { Alert, Avatar, Box, Chip, Collapse, IconButton, Typography } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Cancel as FailedIcon,
  HourglassEmpty as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export interface SendAttempt {
  id: number;
  attempt_number: number;
  status: 'sent' | 'failed' | 'accepted' | 'rejected';
  request_payload?: Record<string, unknown>;
  response_payload?: Record<string, unknown>;
  error_messages?: string;
  external_id?: string;
  sent_at: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface SendAttemptsTimelineProps {
  attempts: SendAttempt[];
}

export default function SendAttemptsTimeline({ attempts }: SendAttemptsTimelineProps) {
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  if (!attempts || attempts.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Nessun tentativo di invio registrato.
      </Alert>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'accepted':
        return <SuccessIcon />;
      case 'failed':
      case 'rejected':
        return <FailedIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' => {
    switch (status) {
      case 'sent':
      case 'accepted':
        return 'success';
      case 'failed':
      case 'rejected':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'sent':
        return 'Inviato';
      case 'accepted':
        return 'Accettato';
      case 'failed':
        return 'Fallito';
      case 'rejected':
        return 'Rifiutato';
      default:
        return status;
    }
  };

  const handleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Ordina per data decrescente (più recenti prima)
  const sortedAttempts = [...attempts].sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Storico Tentativi Invio ({attempts.length})
      </Typography>

      <Timeline position="right">
        {sortedAttempts.map((attempt, index) => {
          const isExpanded = expandedId === attempt.id;
          const isLast = index === sortedAttempts.length - 1;

          return (
            <TimelineItem key={attempt.id}>
              <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3, py: 2 }}>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  {format(new Date(attempt.sent_at), 'dd MMM yyyy', { locale: it })}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                  {format(new Date(attempt.sent_at), 'HH:mm:ss')}
                </Typography>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={getStatusColor(attempt.status)}>{getStatusIcon(attempt.status)}</TimelineDot>
                {!isLast && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Tentativo #{attempt.attempt_number}
                      </Typography>
                      <Chip label={getStatusLabel(attempt.status)} color={getStatusColor(attempt.status)} size="small" />
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => handleExpand(attempt.id)}
                      sx={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s',
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>

                  {/* User */}
                  {attempt.user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar
                        src={attempt.user.avatar}
                        sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                      >
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        da {attempt.user.name}
                      </Typography>
                    </Box>
                  )}

                  {/* External ID */}
                  {attempt.external_id && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      ID Provider: {attempt.external_id}
                    </Typography>
                  )}

                  {/* Errori (se status failed/rejected) */}
                  {(attempt.status === 'failed' || attempt.status === 'rejected') && attempt.error_messages && (
                    <Alert severity="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Errore:
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {attempt.error_messages}
                      </Typography>
                    </Alert>
                  )}

                  {/* Collapse con payload dettagliati */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      {/* Request Payload */}
                      {attempt.request_payload && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            📤 Request Payload:
                          </Typography>
                          <Box
                            sx={{
                              mt: 0.5,
                              p: 1,
                              bgcolor: 'grey.100',
                              borderRadius: 1,
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              overflow: 'auto',
                              maxHeight: 200,
                            }}
                          >
                            <pre style={{ margin: 0 }}>{JSON.stringify(attempt.request_payload, null, 2)}</pre>
                          </Box>
                        </Box>
                      )}

                      {/* Response Payload */}
                      {attempt.response_payload && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            📥 Response Payload:
                          </Typography>
                          <Box
                            sx={{
                              mt: 0.5,
                              p: 1,
                              bgcolor: 'grey.100',
                              borderRadius: 1,
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              overflow: 'auto',
                              maxHeight: 200,
                            }}
                          >
                            <pre style={{ margin: 0 }}>{JSON.stringify(attempt.response_payload, null, 2)}</pre>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  );
}

