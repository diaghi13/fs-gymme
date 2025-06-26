import React, { useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import * as Yup from 'yup';
import {
  AllPriceLists,
  Customer,
  FinancialResource,
  PageProps, PaymentCondition, PaymentMethod, Promotion,
  Sale
} from '@/types';
import { Head, router } from '@inertiajs/react';
import { Form, Formik, FormikConfig } from 'formik';
import { Box, Button, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Header from '@/components/sales/Header';
import SaleStepper, { STEPS } from '@/components/sales/Stepper';
import PriceListsCard from '@/components/sales/cards/PriceListCard';
// import useExitPrompt from '@/hooks/useExitPromt';
import { SaleRowFormValues } from '@/support/createCartItem';
import Cart from '@/components/sales/Cart';
import PaymentCard, { CalculatorProps, SaleInstallmentFormValues } from '@/components/sales/cards/PaymentCard';
import { addMonths } from 'date-fns';
import { SaleContextProvider } from '@/Contexts/Sale/SaleContext';
import SummaryTab from '@/components/sales/SummaryTab';
import { format } from 'date-fns/format';

const validationSchema = Yup.object().shape({
  customer: Yup.object().required('Richiesto')
});

export interface SaleFormValues {
  progressive_number: string;
  description: string;
  date: Date;
  year: number;
  customer: Customer | null;
  document_type_id?: number | null;
  document_type: { id: number; code: string, description: string, label: string } | null;
  payment_condition: PaymentCondition | null;
  financial_resource: FinancialResource | null;
  promotion: Promotion | null;
  discount_percentage: number;
  discount_absolute: number;
  status: string;
  payment_status: string;
  accounting_status: string;
  exported_status: string;
  currency: string;
  notes: string;
  sale_contents: SaleRowFormValues[];
  payments: SaleInstallmentFormValues[];
}

export interface SalePageProps extends PageProps {
  sale: Sale;
  success: boolean;
  customers: Customer[];
  paymentConditions: PaymentCondition[];
  paymentMethods: PaymentMethod[];
  financialResources: FinancialResource[];
  promotions: Promotion[];
  priceLists: AllPriceLists[];

  //customerOptions: Customer[];
  documentTypeElectronicInvoices: { id: number; code: string, description: string, label: string }[];
  // paymentConditionOptions: {
  //   value: number;
  //   label: string;
  // }[];
  //paymentMethodOptions: AutocompleteOptions<number>;
  //financialResourceOptions: FinancialResource[];
  //promotionOptions: AutocompleteOptions<number>;
  //priceLists: AllPriceLists[];
}

export default function Sales({ auth, sale, customers, paymentMethods, documentTypeElectronicInvoices }: SalePageProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  //const { app_config } = usePage<SalePageProps>().props;
  const theme = useTheme();

  const [installmentsCalculator, setInstallmentsCalculator] = useState<CalculatorProps>({
    installment_quantity: '',
    payment_method: paymentMethods.find(option => option.id === 1)!,
    first_effective_date: addMonths(new Date(), 1),
    month_effective_date: '1'
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const formik: FormikConfig<SaleFormValues> = {
    initialValues: {
      progressive_number: sale?.progressive_number ?? '0001',
      description: '',
      date: new Date(sale?.date ?? new Date()),
      year: sale.year ?? new Date().getFullYear(),
      customer: sale?.customer,
      document_type: documentTypeElectronicInvoices.find(doc => doc.id === sale?.document_type_id) ?? null,
      payment_condition: null,
      financial_resource: null,
      promotion: null,
      discount_percentage: 0,
      discount_absolute: 0,
      status: 'draft',
      payment_status: 'not_paid',
      accounting_status: 'not_accounted',
      exported_status: 'not_exported',
      currency: 'EUR',
      notes: '',
      sale_contents: [],
      payments: [
        // {
        //   due_date: new Date(),
        //   amount: '',
        //   payment_method: paymentMethodOptions.find(option => option.value === 1)!,
        //   payed_at: new Date()
        // }
      ]
    },
    validationSchema,
    onSubmit: (values) => {
      const data = {
        ...values,
        document_type_id: 1,
        customer_id: values.customer?.id,
        payment_condition_id: values.payment_condition?.id,
        financial_resource_id: values.financial_resource?.id,
        promotion_id: values.promotion?.id,
        sale_rows: values.sale_contents.map(item => ({
          ...item,
          price_list_id: item.price_list.id,
          quantity: parseFloat(String(item.quantity)),
          unit_price: parseFloat(String(item.unit_price)),
          percentage_discount: parseFloat(String(item.percentage_discount)),
          absolute_discount: parseFloat(String(item.absolute_discount)),
          total: parseFloat(String(item.total))
        })),
        payments: values.payments.map(payment => ({
          ...payment,
          payment_method_id: payment.payment_method.id,
          amount: parseFloat(String(payment.amount)),
          due_date: format(payment.due_date!, 'yyyy-MM-dd'),
          payed_at: payment.payed_at ? format(payment.payed_at, 'yyyy-MM-dd') : null
        })),
        structure_id: 1
      };

      console.log(data);

      router.post(route('app.sales.store'), data as unknown as FormData);
    }
  };

  return (
    <AppLayout user={auth.user}>
      <Head><title>Nuova Vendita</title></Head>

      <Formik {...formik}>
        {({ values }) => (
          <Form>
            <SaleContextProvider>
              <Grid container spacing={2} sx={{ p: 2 }}>
                <Grid size={12}>
                  <SaleStepper activeStep={activeStep} />
                </Grid>
                {activeStep !== STEPS.length - 1 && (
                  <Grid size={12}>
                    <Header customerOptions={customers} autocompleteDisabled={false} />
                  </Grid>
                )}
                <Grid size={12}>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                  >
                    <Button
                      color="inherit"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                    >
                      Indietro
                    </Button>
                    {activeStep === STEPS.length - 1 && <Button type={'submit'} variant={'contained'}>Salva</Button>}
                    {activeStep !== STEPS.length - 1 &&
                      <Button onClick={handleNext} variant={'contained'}>Successivo</Button>}
                  </Box>
                </Grid>
                <Grid size={activeStep === 0 ? 4 : activeStep === 1 ? 7 : 12} style={{
                  transition: theme.transitions.create('all', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen
                  })
                }}>
                  {activeStep === 0 && values.customer && <PriceListsCard />}
                  {activeStep === 1 &&
                    <PaymentCard calculator={installmentsCalculator} setCalculator={setInstallmentsCalculator} />}
                  {activeStep === 2 && <SummaryTab sale={values} />}
                </Grid>
                {activeStep !== STEPS.length - 1 && values.customer && (
                  <Grid size={activeStep == 0 ? 8 : 5} style={{
                    transition: theme.transitions.create('all', {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.leavingScreen
                    })
                  }}>
                    <Cart />
                  </Grid>
                )}
              </Grid>
            </SaleContextProvider>
          </Form>
        )}
      </Formik>
    </AppLayout>
  );
};
