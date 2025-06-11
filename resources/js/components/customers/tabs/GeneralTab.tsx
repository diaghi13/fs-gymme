import * as React from 'react';
import { Grid } from '@mui/material';
import DetailsCard from '@/components/customers/cards/DetailsCard';
import SubscriptionsCard from '@/components/customers/cards/SubscriptionsCard';
import SalesCard from '@/components/customers/cards/SalesCard';
import SmallCard from '@/components/ui/SmallCard';
import { CustomerShowProps } from '@/pages/customers/customer-show';
import { usePage } from '@inertiajs/react';

import EditIcon from '@mui/icons-material/Edit';
import format from '@/support/format';
import PrivacyCard from '@/components/customers/cards/PrivacyCard';
import MedicalCertificationCard from '@/components/customers/cards/MedicalCertificationCard';
import MembershipCardCard from '@/components/customers/cards/MembershipCardCard';

const GeneralTab = () => {
  const { customer } = usePage<CustomerShowProps>().props;

  return (
   <Grid container spacing={2} sx={{ p: 2 }}>
     <Grid size={4}>
       <Grid container spacing={2}>
         <Grid size={12}>
           <DetailsCard />
         </Grid>
       </Grid>
     </Grid>
     <Grid size={4}>
       <Grid container spacing={2}>
         <Grid size={12}>
           <SubscriptionsCard />
         </Grid>
         <Grid size={12}>
           <SalesCard />
         </Grid>
       </Grid>
     </Grid>
     <Grid size={4}>
       <Grid container spacing={2}>
         <Grid size={12}>
           <SmallCard
             title="Iscrizione"
             content={`${customer.last_membership?.end_date ? "Scadenza: " + format(new Date(customer.last_membership?.end_date), 'dd/MM/yyyy') : "Nessuna iscrizione"}`}
             onHeaderActionClick={() => {
               //toggleOpenDialog(true, "membershipFeeDialog");
             }}
             //Icon={CreditScoreIcon}
             color="#ffcc33"
             ActionIcon={EditIcon}
             chip={!!customer.last_membership}
             chipProps={{
               label: customer.last_membership?.end_date && new Date() > new Date(customer.last_membership.end_date) ? "Scaduto" : "Attivo",
               color: customer.last_membership?.end_date && new Date() > new Date(customer.last_membership.end_date) ? "error" : "success"
             }}
           />
         </Grid>
         <Grid size={12}>
           <MedicalCertificationCard />
         </Grid>
         <Grid size={12}>
           <MembershipCardCard />
         </Grid>
         <Grid size={12}>
           <PrivacyCard />
         </Grid>
       </Grid>
     </Grid>
   </Grid>
 );
};

export default GeneralTab
