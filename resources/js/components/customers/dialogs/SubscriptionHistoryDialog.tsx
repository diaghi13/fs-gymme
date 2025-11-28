import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Activity {
  id: number;
  description: string;
  causer: {
    id: number;
    name: string;
  } | null;
  properties: any;
  created_at: string;
}

interface SubscriptionHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: any;
}

const SubscriptionHistoryDialog: React.FC<SubscriptionHistoryDialogProps> = ({
  open,
  onClose,
  subscription,
}) => {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (open && subscription) {
      setLoading(true);
      axios
        .get(route('api.v1.customer-subscriptions.history', { subscription: subscription.id }))
        .then((response) => {
          setActivities(response.data.activities);
        })
        .catch((error) => {
          console.error('Error fetching subscription history:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, subscription]);

  const getActivityIcon = (description: string) => {
    if (description.includes('creato')) return <AddIcon />;
    if (description.includes('modificato')) return <EditIcon />;
    if (description.includes('eliminato')) return <DeleteIcon />;
    return null;
  };

  const getActivityColor = (description: string): 'primary' | 'success' | 'error' | 'warning' => {
    if (description.includes('creato')) return 'success';
    if (description.includes('modificato')) return 'primary';
    if (description.includes('eliminato')) return 'error';
    return 'primary';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPropertyChanges = (properties: any) => {
    if (!properties) return null;

    if (properties.old && properties.new) {
      // Show what changed
      const changes: string[] = [];
      Object.keys(properties.new).forEach((key) => {
        if (properties.old[key] !== properties.new[key]) {
          changes.push(
            `${key}: "${properties.old[key] || '-'}" → "${properties.new[key] || '-'}"`
          );
        }
      });

      if (changes.length > 0) {
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Modifiche:
            </Typography>
            {changes.map((change, index) => (
              <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                • {change}
              </Typography>
            ))}
          </Box>
        );
      }
    }

    if (properties.reason) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Motivo: {properties.reason}
        </Typography>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Storico Abbonamento
        {subscription && (
          <Typography variant="body2" color="text.secondary">
            {subscription.price_list?.name} - dal {new Date(subscription.start_date).toLocaleDateString('it-IT')}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : activities.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            Nessuna attività registrata per questo abbonamento.
          </Typography>
        ) : (
          <Timeline position="right">
            {activities.map((activity, index) => (
              <TimelineItem key={activity.id}>
                <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                  <Typography variant="body2">{formatDate(activity.created_at)}</Typography>
                  {activity.causer && (
                    <Chip
                      label={activity.causer.name}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={getActivityColor(activity.description)}>
                    {getActivityIcon(activity.description)}
                  </TimelineDot>
                  {index < activities.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6" component="span">
                      {activity.description}
                    </Typography>
                    {renderPropertyChanges(activity.properties)}
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionHistoryDialog;

