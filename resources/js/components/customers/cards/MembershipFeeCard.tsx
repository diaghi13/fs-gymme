import * as React from 'react';
import SmallCard from '@/components/ui/SmallCard';
import { usePage, router } from '@inertiajs/react';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { useState } from 'react';
import ViewMembershipFeeDialog from '@/components/customers/dialogs/ViewMembershipFeeDialog';
import { route } from 'ziggy-js';
import { IconButton, Tooltip } from '@mui/material';
import FormattedDate from '@/components/ui/FormattedDate';
import FormattedCurrency from '@/components/ui/FormattedCurrency';

import CreditScoreIcon from '@mui/icons-material/CreditScore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const MembershipFeeCard = () => {
  const { customer } = usePage<CustomerShowProps>().props;
  const activeFee = customer.active_membership_fee;
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSuccess = () => {
    // Refresh page to update the data
    window.location.reload();
  };

  const handleRenew = () => {
    if (!activeFee) return;

    router.get(route('app.renewal.membership-fee', {
      tenant: customer.tenant_id,
      membershipFee: activeFee.id
    }));
  };

  const getStatusChip = () => {
    if (!activeFee) {
      return {
        label: 'Mai sottoscritta',
        color: 'default' as const
      };
    }

    const endDate = new Date(activeFee.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (endDate < today) {
      return {
        label: 'Scaduta',
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
      label: 'Attiva',
      color: 'success' as const
    };
  };

  const getContent = () => {
    if (!activeFee) {
      return 'Nessuna quota associativa';
    }

    return (
      <>
        Scadenza: <FormattedDate value={activeFee.end_date} />
      </>
    );
  };

  const getSecondaryContent = () => {
    if (!activeFee) {
      return 'Acquistabile tramite vendita';
    }

    if (!activeFee.amount) {
      return undefined;
    }

    return (
      <>
        Importo: <FormattedCurrency value={activeFee.amount} />
      </>
    );
  };

  const statusChip = getStatusChip();

  return (
    <>
      <SmallCard
        title="Quota Associativa"
        content={getContent()}
        secondary={getSecondaryContent()}
        onHeaderActionClick={handleOpenDialog}
        Icon={CreditScoreIcon}
        iconSize="small"
        color="#ffcc33"
        hasAction={true}
        ActionIcon={VisibilityIcon}
        chip={!!activeFee}
        chipProps={statusChip}
        actions={activeFee ? (
          <Tooltip title="Rinnova Quota Associativa">
            <IconButton
              size="small"
              onClick={handleRenew}
              sx={{ ml: 0.5 }}
            >
              <AutorenewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : undefined}
      />

      <ViewMembershipFeeDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        customer={customer}
        membershipFee={activeFee || null}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default MembershipFeeCard;
