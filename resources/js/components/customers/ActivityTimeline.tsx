import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography
} from '@mui/material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator
} from '@mui/lab';
import { usePage } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import FormattedDate from '@/components/ui/FormattedDate';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import DescriptionIcon from '@mui/icons-material/Description';
import NoteIcon from '@mui/icons-material/Note';

interface Activity {
  id: string;
  type: 'sale' | 'payment' | 'subscription' | 'membership-fee' | 'document' | 'note';
  title: string;
  description?: string;
  date: string | Date;
  created_at: Date | number | string;
}

const ActivityTimeline = () => {
  const { customer } = usePage<CustomerShowProps>().props;

  // Build activities from customer data
  const activities: Activity[] = React.useMemo(() => {
    const activityList: Activity[] = [];

    // Add sales
    if (customer.sales && customer.sales.length > 0) {
      customer.sales.slice(0, 5).forEach((sale: any) => {
        activityList.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: `Vendita ${sale.document_type || ''} ${sale.progressive_number || ''}`,
          description: `Totale: ${sale.gross_price || '0.00'}€`,
          date: sale.date || sale.created_at,
          created_at: new Date(sale.created_at)
        });
      });
    }

    // Add active subscriptions
    if (customer.active_subscriptions && customer.active_subscriptions.length > 0) {
      customer.active_subscriptions.forEach((subscription: any) => {
        activityList.push({
          id: `subscription-${subscription.id}`,
          type: 'subscription',
          title: 'Abbonamento attivato',
          description: subscription.price_list?.name || 'Abbonamento',
          date: subscription.start_date,
          created_at: new Date(subscription.created_at).setSeconds(new Date(subscription.created_at).getSeconds() + 1) // ensure unique timestamp
        });
      });
    }

    if (customer.active_membership_fee) {
      activityList.push({
        id: `membership-fee-${customer.active_membership_fee.id}`,
        type: 'membership-fee',
        title: 'Quota Associativa attivata',
        description: `Quota Associativa`,
        date: customer.active_membership_fee.start_date,
        created_at: new Date(customer.active_membership_fee.created_at).setSeconds(new Date(customer.active_membership_fee.created_at).getSeconds() + 2) // ensure unique timestamp
      });
    }

    // Sort by date (most recent first)
    activityList.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Limit to 10 most recent
    return activityList.slice(0, 10);
  }, [customer]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'sale':
        return <ShoppingCartIcon />;
      case 'payment':
        return <PaymentIcon />;
      case 'subscription':
        return <CardMembershipIcon />;
      case 'document':
        return <DescriptionIcon />;
      case 'note':
        return <NoteIcon />;
      default:
        return <NoteIcon />;
    }
  };

  const getActivityColor = (type: Activity['type']): 'primary' | 'success' | 'secondary' | 'warning' | 'error' | 'info' => {
    switch (type) {
      case 'sale':
        return 'primary';
      case 'payment':
        return 'success';
      case 'subscription':
        return 'secondary';
      case 'membership-fee':
        return 'warning';
      case 'document':
        return 'info';
      case 'note':
        return 'info';
      default:
        return 'info';
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader title={<Typography variant="h6">Attività Recenti</Typography>} />
        <CardContent>
          <Typography color="text.secondary">
            Nessuna attività recente disponibile
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={<Typography variant="h6">Attività Recenti</Typography>} />
      <CardContent>
        <Timeline position="alternate">
          {activities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineSeparator>
                <TimelineDot color={getActivityColor(activity.type) as any}>
                  {getActivityIcon(activity.type)}
                </TimelineDot>
                {index < activities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {activity.title}
                  </Typography>
                  {activity.description && (
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    <FormattedDate value={activity.created_at} showTime />
                  </Typography>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
