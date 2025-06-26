import * as React from 'react';
import { PageProps } from '@/types';
import CentralLayout from '@/layouts/CentralLayout';
import { useOnlineUsers } from '@/Contexts/OnlineUserContext';
import { Grid } from '@mui/material';
import StyledCard from '@/components/ui/StyledCard';

interface DashboardProps extends PageProps{
  [key: string]: unknown;
}

const Dashboard : React.FC<DashboardProps> = ({auth}) => {
  const { onlineUsers } = useOnlineUsers();

  return (
   <CentralLayout user={auth.user}>
     <Grid container spacing={2} sx={{ padding: 2 }}>
       <Grid size={3}>
         <StyledCard
           description="Utenti online"
           content={onlineUsers.length}
         />
       </Grid>
     </Grid>
   </CentralLayout>
 );
};

export default Dashboard
