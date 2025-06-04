import {Box, Tab, Typography} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import SubscriptionGeneralTab from "@/components/price-list/subscription/tabs/SubscriptionGeneralTab";
import SaleForm from "@/components/price-list/subscription/SaleForm";
import MyCard from "@/components/ui/MyCard";
import React from "react";
import {
  PriceListSubscription,
} from "@/types";
import SubscriptionOptionalTab from '@/components/price-list/subscription/tabs/SubscriptionOptionalTab';
//import SubscriptionSummaryTab from '@/components/price-list/subscription/tabs/SubscriptionSummaryTab';

interface SubscriptionPriceListCardProps {
  priceList: PriceListSubscription;
}

export default function SubscriptionPriceListCard(
  {priceList}: SubscriptionPriceListCardProps
){
  const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <MyCard sx={{p: 0}} title={priceList.name ?? 'Nuovo abbonamento'} bgColor={priceList.color}>
      <Box sx={{flexGrow: 1, display: 'flex'}}>
        <TabContext value={value}>
          <TabList
            onChange={handleChange}
            aria-label="lab API tabs example"
            orientation={"vertical"}
            sx={{borderRight: 1, borderColor: 'divider'}}
          >
            {priceList && <Tab label="Generale" value="1"/>}
            {priceList?.id && <Tab label="Opzioni" value="2"/>}
            {priceList?.id && <Tab label="Vendita" value="3"/>}
            {priceList?.id && <Tab label="Riepilogo" value="4"/>}
          </TabList>
          <TabPanel value="1" sx={{width: "100%"}}>
            <SubscriptionGeneralTab priceList={priceList} />
          </TabPanel>
          <TabPanel value="2" sx={{width: "100%"}}>
            <SubscriptionOptionalTab priceList={priceList} />
          </TabPanel>
          <TabPanel value="3" sx={{width: "100%"}}>
            <SaleForm priceList={priceList} />
          </TabPanel>
          <TabPanel value="4" sx={{width: "100%"}}>
            <Typography variant={"body1"}>
              Coming soon...
            </Typography>
          </TabPanel>
        </TabContext>
      </Box>
    </MyCard>
  )
};
