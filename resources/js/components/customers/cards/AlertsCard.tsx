import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Stack,
  Chip,
} from '@mui/material';
import {
  FitnessCenter,
  CardMembership,
  LocalHospital,
  Payment,
  EmojiEvents,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';

interface CustomerAlert {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  icon: string;
  days?: number;
  count?: number;
  amount?: number;
}

const AlertsCard = () => {
  const { customer } = usePage<CustomerShowProps>().props;
  const alerts = (customer.customer_alerts || []) as CustomerAlert[];

  // Group alerts by severity
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical');
  const warningAlerts = alerts.filter((alert) => alert.severity === 'warning');
  const infoAlerts = alerts.filter((alert) => alert.severity === 'info');

  // Icon mapping
  const getIcon = (iconName: string) => {
    const iconProps = { fontSize: 'small' as const };
    switch (iconName) {
      case 'FitnessCenter':
        return <FitnessCenter {...iconProps} />;
      case 'CardMembership':
        return <CardMembership {...iconProps} />;
      case 'LocalHospital':
        return <LocalHospital {...iconProps} />;
      case 'Payment':
        return <Payment {...iconProps} />;
      case 'EmojiEvents':
        return <EmojiEvents {...iconProps} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  // If no alerts, show success message
  // if (alerts.length === 0) {
  //   return (
  //     <Card>
  //       <CardHeader
  //         title={
  //           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  //             <Typography variant="h6">Stato Cliente</Typography>
  //             <Chip label="OK" color="success" size="small" />
  //           </Box>
  //         }
  //       />
  //       <CardContent>
  //         <Alert severity="success" icon={<InfoIcon />}>
  //           <AlertTitle>Tutto in regola</AlertTitle>
  //           Il cliente non ha scadenze imminenti o documenti scaduti.
  //         </Alert>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    // <Card>
    //   <CardHeader
    //     title={
    //       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    //         <Typography variant="h6">Stato Cliente</Typography>
    //         {criticalAlerts.length > 0 && (
    //           <Chip
    //             label={criticalAlerts.length}
    //             color="error"
    //             size="small"
    //             icon={<ErrorIcon />}
    //           />
    //         )}
    //         {warningAlerts.length > 0 && (
    //           <Chip
    //             label={warningAlerts.length}
    //             color="warning"
    //             size="small"
    //             icon={<WarningIcon />}
    //           />
    //         )}
    //       </Box>
    //     }
    //   />
    //   <CardContent>
        <Stack spacing={2}>
          {/* Critical alerts */}
          {criticalAlerts.map((alert, index) => (
            <Alert
              key={`critical-${index}`}
              severity="error"
              icon={getIcon(alert.icon)}
              sx={{ alignItems: 'center' }}
            >
              <AlertTitle sx={{ mb: 0 }}>{alert.message}</AlertTitle>
            </Alert>
          ))}

          {/* Warning alerts */}
          {warningAlerts.map((alert, index) => (
            <Alert
              key={`warning-${index}`}
              severity="warning"
              icon={getIcon(alert.icon)}
              sx={{ alignItems: 'center' }}
            >
              <AlertTitle sx={{ mb: 0 }}>{alert.message}</AlertTitle>
            </Alert>
          ))}

          {/* Info alerts */}
          {infoAlerts.map((alert, index) => (
            <Alert
              key={`info-${index}`}
              severity="info"
              icon={getIcon(alert.icon)}
              sx={{ alignItems: 'center' }}
            >
              <AlertTitle sx={{ mb: 0 }}>{alert.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
    //   </CardContent>
    // </Card>
  );
};

export default AlertsCard;
