import {Box, Tab} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import MyCard from "@/components/ui/MyCard";
import React, { useRef } from 'react';
import {
  AutocompleteOptions,
  PriceListArticle, PriceListFolderTree,
} from "@/types";
import ArticleGeneralForm, { FormikValues } from '@/components/price-list/article/ArticleGeneralForm';
import { FormikProps } from 'formik';
import SaleForm from '@/components/price-list/subscription/SaleForm';

interface ArticlePriceListCardProps {
  priceList: PriceListArticle;
  priceListOptions: AutocompleteOptions<number>;
  priceListOptionsTree: Array<PriceListFolderTree>;
  vatRateOptions: AutocompleteOptions<number>;
}

export default function ArticlePriceListCard({priceList, priceListOptions, vatRateOptions, priceListOptionsTree}: ArticlePriceListCardProps){
  const [value, setValue] = React.useState('1');
  const form = useRef<FormikProps<FormikValues>>({} as FormikProps<FormikValues>);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (form.current?.dirty) {
      alert("Salva le modifiche prima di cambiare scheda");
      return;
    }

    setValue(newValue);
  };

  return (
    <MyCard sx={{p: 0}} title={priceList.name} bgColor={priceList.color}>
      <Box sx={{flexGrow: 1, display: 'flex'}}>
        <TabContext value={value}>
          <TabList
            onChange={handleChange}
            aria-label="lab API tabs example"
            orientation={"vertical"}
            sx={{borderRight: 1, borderColor: 'divider'}}
          >
            {priceList && <Tab label="Generale" value="1"/>}
            {priceList?.id && <Tab label="Vendita" value="2"/>}
          </TabList>
          <TabPanel value="1" sx={{width: "100%"}}>
            <ArticleGeneralForm
              priceList={priceList}
              priceListOptions={priceListOptions}
              vatCodes={vatRateOptions}
              priceListOptionsTree={priceListOptionsTree}
              ref={form}
            />
          </TabPanel>
          <TabPanel value="2" sx={{width: "100%"}}>
            <SaleForm priceList={priceList} />
          </TabPanel>
        </TabContext>
      </Box>
    </MyCard>
  )
};
