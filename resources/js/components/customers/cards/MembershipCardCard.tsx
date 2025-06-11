import * as React from 'react';
import SmallCard from '@/components/ui/SmallCard';
import { usePage } from '@inertiajs/react';
import format from '@/support/format';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import MembershipDialog from '@/components/customers/dialogs/MembershipDialog';

import EditIcon from '@mui/icons-material/Edit';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const MembershipCardCard = () => {
  const { customer } = usePage<CustomerShowProps>().props;
  const [open, setOpen] = React.useState(false);

  const toggleMembershipModalOpen = () => {
    setOpen(prevState => !prevState);
  }

  return (
    <React.Fragment>
      <SmallCard
        title="Tesseramento"
        content={
          customer.last_membership?.card_number && customer.last_membership?.end_date
            ? `Scadenza: ${format(customer.last_membership?.end_date, 'dd/MM/yyyy')}`
            : 'Nessun tesseramento'
        }
        secondary={customer.last_membership?.card_number ? `N. tessera: ${customer.last_membership?.card_number}` : ''}
        onHeaderActionClick={toggleMembershipModalOpen}
        Icon={CreditCardIcon}
        iconSize="small"
        color="#ff5a00"
        hasAction
        ActionIcon={EditIcon}
      />
      {customer.last_membership && (
        <MembershipDialog
          membership={customer.last_membership}
          open={open}
          onClose={toggleMembershipModalOpen}
        />
      )}
    </React.Fragment>
  );
};

export default MembershipCardCard;
