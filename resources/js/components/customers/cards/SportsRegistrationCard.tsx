import * as React from 'react';
import { usePage } from '@inertiajs/react';
import { SportsRegistration } from '@/types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { route } from 'ziggy-js';
import { differenceInDays, isPast } from 'date-fns';
import SmallCard from '@/components/ui/SmallCard';
import EditIcon from '@mui/icons-material/Edit';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AddSportsRegistrationDialog from '@/components/customers/dialogs/AddSportsRegistrationDialog';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import FormattedDate from '@/components/ui/FormattedDate';

const SportsRegistrationCard: React.FC = () => {
  const { customer } = usePage<CustomerShowProps>().props;
  const [registrations, setRegistrations] = useState<SportsRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<SportsRegistration | null>(null);

  const fetchRegistrations = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        route('api.v1.customers.sports-registrations.index', { customer: customer.id })
      );
      setRegistrations(response.data.registrations);
    } catch (error) {
      console.error('Error fetching sports registrations:', error);
    } finally {
      setLoading(false);
    }
  }, [customer.id]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleOpenDialog = (registration?: SportsRegistration) => {
    setEditingRegistration(registration || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRegistration(null);
  };

  const activeRegistration = registrations.find(
    r => new Date(r.end_date) >= new Date()
  );

  const getStatusChip = () => {
    if (!activeRegistration) {
      return {
        label: 'Mai tesserato',
        color: 'default' as const
      };
    }

    const endDate = new Date(activeRegistration.end_date);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(endDate, today);

    if (isPast(endDate)) {
      return {
        label: 'Scaduto',
        color: 'error' as const
      };
    }

    if (daysUntilExpiry <= 30) {
      return {
        label: 'In scadenza',
        color: 'warning' as const
      };
    }

    return {
      label: 'Attivo',
      color: 'success' as const
    };
  };

  const getContent = () => {
    if (!activeRegistration) {
      return 'Nessun tesseramento attivo';
    }

    return (
      <>
        Scadenza: <FormattedDate value={activeRegistration.end_date} />
      </>
    );
  };

  const getSecondaryContent = () => {
    if (!activeRegistration) {
      return undefined;
    }

    const parts: string[] = [];

    if (activeRegistration.organization) {
      parts.push(`Ente: ${activeRegistration.organization}`);
    }

    if (activeRegistration.membership_number) {
      parts.push(`N. tessera: ${activeRegistration.membership_number}`);
    }

    return parts.join(' • ');
  };

  const statusChip = getStatusChip();

  return (
    <>
      <SmallCard
        title="Tesseramento Ente Sportivo"
        content={getContent()}
        secondary={getSecondaryContent()}
        onHeaderActionClick={() => handleOpenDialog(activeRegistration || undefined)}
        Icon={CardMembershipIcon}
        iconSize="small"
        color="#ff9800"
        hasAction
        ActionIcon={EditIcon}
        chip={!!activeRegistration}
        chipProps={statusChip}
        loading={loading}
      />

      <AddSportsRegistrationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        customer={customer}
        registration={editingRegistration}
        onSuccess={fetchRegistrations}
      />
    </>
  );
};

export default SportsRegistrationCard;

