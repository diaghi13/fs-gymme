import {Form, Formik, FormikConfig} from "formik";
import {Box, Grid, Typography} from "@mui/material";
import DatePicker from "@/components/ui/DatePicker";
import FormikSaveButton from "@/components/ui/FormikSaveButton";
import React from "react";
import {useTheme} from "@mui/material/styles";
import { PriceList, PriceListSubscription } from '@/types';
import {router} from "@inertiajs/react";
import { format } from "date-fns/format";

interface SaleFormProps {
  priceList: PriceList;
}

export default function SaleForm({priceList}: SaleFormProps) {
  const theme = useTheme();

  const formik: FormikConfig<Partial<PriceListSubscription>> = {
    initialValues: {
      saleable_from: priceList.saleable_from ? new Date(priceList.saleable_from) : null,
      saleable_to: priceList.saleable_to ? new Date(priceList.saleable_to) : null,
    },
    onSubmit: (values) => {
      const data = {
        saleable_from: values.saleable_from ? format(new Date(values.saleable_from!), 'yyyy/MM/dd') : null,
        saleable_to: values.saleable_to ? format(new Date(values.saleable_to!), 'yyyy/MM/dd') : null,
      }

      router.patch(
        route("price-lists.sales.update", {priceList: priceList.id!}),
        data,
        {preserveState: false}
      );
    },
    enableReinitialize: true
  }

  return (
    <Formik {...formik}>
        <Form>
          <Grid container spacing={4}>
            <Grid size={12}>
              <Box sx={{border: "3px solid " + theme.palette.primary.main, p: 2}}>
                <Grid container spacing={4}>
                  <Grid size={12}>
                    <Typography variant={"body1"}>
                      <strong>N.B.:</strong><br/>
                      se non vengono specificate le date, il prodotto sarà sempre vendibile a meno che non si disabiliti completamente.<br/>
                      Se viene inserita solo la data "dal" o "al", il prodotto verrà mostrato nelle vendite da quella data o fino a quella data.
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <DatePicker label={"Vendibile dal"} name={"saleable_from"} />
                  </Grid>
                  <Grid size={6}>
                    <DatePicker label={"Vendibile al"} name={"saleable_to"} />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid size={12} sx={{textAlign: "end"}}>
              <FormikSaveButton/>
            </Grid>
          </Grid>
        </Form>
    </Formik>
  )
};
