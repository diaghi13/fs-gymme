import * as React from 'react';
import FolderPriceListCard from '@/components/price-list/folder/FolderPriceListCard';
import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types';
import { Grid, Typography } from '@mui/material';
import LoyaltyOutlinedIcon from '@mui/icons-material/LoyaltyOutlined';

interface CreatePriceListProps extends PageProps {

}

const CreatePriceList: React.FC<CreatePriceListProps> = ({ auth }) => {
  return (
    <AppLayout user={auth.user}>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={12} sx={{maxWidth: '900px', margin: '0 auto'}}>
          <FolderPriceListCard />
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default CreatePriceList;
