import * as React from 'react';
import SmallCard from '@/components/ui/SmallCard';
import { usePage } from '@inertiajs/react';
import format from '@/support/format';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import MedicalCertificationDialog from '@/components/customers/dialogs/MedicalCertificationDialog';

import EditIcon from '@mui/icons-material/Edit';
import HealingIcon from '@mui/icons-material/Healing';

const MedicalCertificationCard = () => {
  const { customer } = usePage<CustomerShowProps>().props;
  const [open, setOpen] = React.useState(false);

  const toggleMedicalCertificationModalOpen = () => {
    setOpen(!open);
  };

  return (
    <React.Fragment>
      <SmallCard
        title="Certificato Medico"
        content={
          customer.last_medical_certification?.valid_until
            ? `Scadenza: ${format(customer.last_medical_certification?.valid_until, 'dd/MM/yyyy')}`
            : 'Nessun certificato medico'
        }
        onHeaderActionClick={toggleMedicalCertificationModalOpen}
        Icon={HealingIcon}
        iconSize="small"
        color="#6aa84f"
        hasAction
        ActionIcon={EditIcon}
      />
      <MedicalCertificationDialog
        medicalCertification={customer.last_medical_certification!}
        open={open}
        onClose={toggleMedicalCertificationModalOpen}
      />
    </React.Fragment>
  );
};

export default MedicalCertificationCard;
