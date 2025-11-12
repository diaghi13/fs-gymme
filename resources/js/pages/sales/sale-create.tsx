import React from 'react';
import { Head } from '@inertiajs/react';
import { Box, Grid } from '@mui/material';
import AppLayout from '@/layouts/AppLayout';
import { Form, Formik, FormikConfig } from 'formik';
import * as Yup from 'yup';
import {
  Customer,
  FinancialResource,
  PageProps,
  PaymentCondition,
  PaymentMethod,
  Promotion,
  Sale,
  AllPriceLists,
} from '@/types';
import { SaleContextProvider } from '@/Contexts/Sale/SaleContext';
import SaleHeader from './components/SaleHeader';
import ProductSearch from './components/ProductSearch';
import DiscountsSection from './components/DiscountsSection';
import PaymentsSection from './components/PaymentsSection';
import CartSidebar from './components/CartSidebar';
import { SaleRowFormValues } from '@/support/createCartItem';
import { SaleInstallmentFormValues } from '@/components/sales/cards/PaymentCard';

const validationSchema = Yup.object().shape({
  customer: Yup.object().required('Cliente obbligatorio'),
  sale_contents: Yup.array().min(1, 'Aggiungi almeno un prodotto'),
  payment_condition: Yup.object().required('Condizione di pagamento obbligatoria'),
});

export interface SaleFormValues {
  progressive_number: string;
  description: string;
  date: Date;
  year: number;
  customer: Customer | null;
  document_type_id?: number | null;
  document_type: { id: number; code: string; description: string; label: string } | null;
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
  documentTypeElectronicInvoices: { id: number; code: string; description: string; label: string }[];
}

export default function SaleCreate({
  auth,
  sale,
  customers,
  paymentMethods,
  paymentConditions,
  financialResources,
  documentTypeElectronicInvoices,
}: SalePageProps) {
  const formik: FormikConfig<SaleFormValues> = {
    initialValues: {
      progressive_number: sale?.progressive_number ?? '0001',
      description: '',
      date: new Date(sale?.date ?? new Date()),
      year: sale.year ?? new Date().getFullYear(),
      customer: sale?.customer ?? null,
      document_type: documentTypeElectronicInvoices.find((doc) => doc.id === sale?.document_type_id) ?? null,
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
      payments: [],
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Submit sale:', values);
      // TODO: Implement save logic
    },
  };

  return (
    <AppLayout user={auth.user} title="Nuova Vendita">
      <Head>
        <title>Nuova Vendita</title>
      </Head>

      <Formik {...formik}>
        {({ values }) => (
          <Form>
            <SaleContextProvider>
              <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header: Cliente + Progressivo + Data */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <SaleHeader customers={customers} />
                </Box>

                {/* Main Content: Left side (scrollable) + Right sidebar (fixed) */}
                <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                  {/* Left: Main area with product search, discounts, payments */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflowY: 'auto',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                    }}
                  >
                    {values.customer && (
                      <>
                        {/* Section 1: Product Search */}
                        <ProductSearch />

                        {/* Section 2: Discounts */}
                        {values.sale_contents.length > 0 && <DiscountsSection />}

                        {/* Section 3: Payments */}
                        {values.sale_contents.length > 0 && (
                          <PaymentsSection
                            paymentConditions={paymentConditions}
                            paymentMethods={paymentMethods}
                            financialResources={financialResources}
                          />
                        )}
                      </>
                    )}

                    {!values.customer && (
                      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        Seleziona un cliente per iniziare
                      </Box>
                    )}
                  </Box>

                  {/* Right: Cart Sidebar (fixed width, scrollable) */}
                  {values.customer && (
                    <Box
                      sx={{
                        width: 400,
                        borderLeft: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        overflowY: 'auto',
                      }}
                    >
                      <CartSidebar />
                    </Box>
                  )}
                </Box>
              </Box>
            </SaleContextProvider>
          </Form>
        )}
      </Formik>
    </AppLayout>
  );
}
