import * as React from 'react';
import { User } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Grid, List } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { PropsWithChildren } from 'react';
import { configurationMenuList } from '@/layouts';
import DrawerItem from '@/components/layout/DrawerItem';

const Layout : React.FC<PropsWithChildren<{user: User}>> = ({user, children}) => {
  return (
   <AppLayout user={user}>
     <Grid container spacing={2} sx={{ p: 2 }}>
       <Grid size={3}>
         <MyCard title={""} disablePadding>
           <List disablePadding>
             {configurationMenuList.map((item, index) => (
               <DrawerItem {...item} key={index} />
             ))}
              {/*<ListItemButton>*/}
              {/*  <ListItemIcon>*/}
              {/*    <SubdirectoryArrowRightIcon />*/}
              {/*  </ListItemIcon>*/}
              {/*  <ListItemText primary="Azienda" />*/}
              {/*</ListItemButton>*/}
              {/*<ListItemButton>*/}
              {/*  <ListItemIcon>*/}
              {/*    <SubdirectoryArrowRightIcon />*/}
              {/*  </ListItemIcon>*/}
              {/*  <ListItemText primary="Struttura" />*/}
              {/*</ListItemButton>*/}
           </List>
         </MyCard>
       </Grid>
       <Grid size={9}>
         {children}
       </Grid>
     </Grid>
   </AppLayout>
 );
};

export default Layout
