import {Form, Formik, FormikConfig} from "formik";
import * as Yup from 'yup';
import {Box, Grid, Typography, Alert, Divider} from "@mui/material";
import DatePicker from "@/components/ui/DatePicker";
import FormikSaveButton from "@/components/ui/FormikSaveButton";
import React from "react";
import { PageProps, PriceList } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { format } from "date-fns/format";
import StorefrontIcon from '@mui/icons-material/Storefront';
import { FormattedDate } from '@/components/ui/FormattedDate';

interface SaleFormProps {
  priceList: PriceList;
}

interface SaleFormValues {
  saleable_from: Date | null;
  saleable_to: Date | null;
}

export default function SaleForm({priceList}: SaleFormProps) {
  const { currentTenantId } = usePage<PageProps>().props;

  const formik: FormikConfig<SaleFormValues> = {
    initialValues: {
      saleable_from: (priceList as any).saleable_from ? new Date((priceList as any).saleable_from) : null,
      saleable_to: (priceList as any).saleable_to ? new Date((priceList as any).saleable_to) : null,
    },
    validationSchema: Yup.object({
      saleable_from: Yup.date()
        .nullable(),
      saleable_to: Yup.date()
        .nullable()
        .min(Yup.ref('saleable_from'), 'La data "al" deve essere successiva alla data "dal"'),
    }),
    onSubmit: (values) => {
      const data = {
        saleable_from: values.saleable_from ? format(new Date(values.saleable_from!), 'yyyy/MM/dd') : null,
        saleable_to: values.saleable_to ? format(new Date(values.saleable_to!), 'yyyy/MM/dd') : null,
      }

      router.patch(
        route("app.price-lists.sales.update", {priceList: priceList.id!, tenant: currentTenantId}),
        data,
        {preserveState: false}
      );
    },
    enableReinitialize: true
  }

  return (
    <Formik {...formik}>
      {({ values }) => (
        <Form>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorefrontIcon />
              Configurazione vendita
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Definisci il periodo di vendibilità del listino
            </Typography>

            <Grid container spacing={3}>
              <Grid size={12}>
                <Alert severity="info">
                  <Typography variant="body2" gutterBottom>
                    <strong>Nota bene:</strong>
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
                    <li>Se non specifichi date, il prodotto è <strong>sempre vendibile</strong></li>
                    <li>Se specifichi solo "dal", il prodotto sarà vendibile <strong>da quella data in poi</strong></li>
                    <li>Se specifichi solo "al", il prodotto sarà vendibile <strong>fino a quella data</strong></li>
                    <li>Specifica entrambe per definire un <strong>periodo preciso</strong></li>
                  </Typography>
                </Alert>
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Periodo di vendibilità
                </Typography>
              </Grid>

              <Grid size={6}>
                <DatePicker label={"Vendibile dal"} name={"saleable_from"} />
              </Grid>

              <Grid size={6}>
                <DatePicker label={"Vendibile al"} name={"saleable_to"} />
              </Grid>

              {(values.saleable_from || values.saleable_to) && (
                <Grid size={12}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Riepilogo periodo
                    </Typography>
                    {values.saleable_from && values.saleable_to ? (
                      <Typography variant="body2" color="text.secondary">
                        Vendibile dal <strong><FormattedDate value={values.saleable_from} /></strong> al <strong><FormattedDate value={values.saleable_to} /></strong>
                      </Typography>
                    ) : values.saleable_from ? (
                      <Typography variant="body2" color="text.secondary">
                        Vendibile dal <strong><FormattedDate value={values.saleable_from} /></strong> in poi
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Vendibile fino al <strong><FormattedDate value={values.saleable_to!} /></strong>
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12} sx={{textAlign: "end", mt: 2}}>
                <FormikSaveButton/>
              </Grid>
            </Grid>
          </Box>
        </Form>
      )}
    </Formik>
  )
};
