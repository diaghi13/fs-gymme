import { Head } from '@inertiajs/react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Grid, Stack,
  Step,
  StepLabel,
  Stepper,
  Typography
} from '@mui/material';
import * as React from 'react';

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import { PageProps, SubscriptionPlan } from '@/types';
import PaymentForm from '@/components/subscription-plans/PaymentForm';
import Review from '@/components/subscription-plans/Review';
import { Form, Formik, FormikConfig } from 'formik';
import {
  CardNumberElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import axios from 'axios';

const steps = ['Payment details', 'Review your order'];

interface SubscriptionPlanPaymentProps extends PageProps {
  subscriptionPlan: SubscriptionPlan;
}

const SubscriptionPlanPayment: React.FC<SubscriptionPlanPaymentProps> = ({ subscriptionPlan, auth }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [activeStep, setActiveStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const formik: FormikConfig<{
    paymentMethod: string;
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  }> = {
    initialValues: {
      paymentMethod: 'creditCard',
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: ''
    },
    onSubmit: async (values) => {
      if (activeStep !== steps.length - 1) {
        return handleNext();
      }

      setIsLoading(true);

      if (!stripe || !elements) return;

      const card = elements.getElement(CardNumberElement);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: card!,
        billing_details: {
          name: values.cardHolder // puoi raccoglierlo via form
        }
      });

      if (error) {
        console.error('Stripe error:', error.message);
        return;
      }

      const response = await axios.post(
        route('subscription-plan.subscribe', { tenant: auth.user.company!.id }),
        {
          payment_method: paymentMethod.id,
          plan_id: subscriptionPlan.stripe_price_id,
        }
      );

      const data = await response.data;

      if (data.requires_action) {
        const result = await stripe.confirmCardPayment(data.payment_intent_client_secret);

        if (result.error) {
          console.error('3D Secure failed:', result.error.message);
        } else {
          handleNext(); // ✅ Successo
        }
      } else if (data.success) {
        handleNext(); // ✅ Successo immediato
      } else {
        console.error('Errore backend:', data.message);
      }

      setIsLoading(false);

      // if (data.success) {
      //   handleNext(); // mostra schermata di conferma
      // } else {
      //   console.error('Backend error:', data.message);
      // }
    }
  };

  return (
    <React.Fragment>
      <Head title="Log in" />
      <CssBaseline />

      <Grid
        container
        sx={{
          height: {
            xs: '100%',
            sm: 'calc(100dvh - var(--template-frame-height, 0px))'
          },
          mt: {
            xs: 4,
            sm: 0
          }
        }}
      >
        <Grid
          size={{ xs: 12, sm: 5, lg: 4 }}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            borderRight: { sm: 'none', md: '1px solid' },
            borderColor: { sm: 'none', md: 'divider' },
            alignItems: 'start',
            pt: 16,
            px: 10,
            gap: 4
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              maxWidth: 500
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{ textAlign: 'start', mb: 2 }}
            >
              {subscriptionPlan.name}
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ whiteSpace: 'pre-line', mb: 2 }}
            >
              {subscriptionPlan.description}
            </Typography>
            <Typography
              variant="h5"
              color="primary"
              sx={{ mt: 2, mb: 1 }}
            >
              {subscriptionPlan.price.toFixed(2).replace('.', ',')} {subscriptionPlan.currency}
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ mb: 1 }}
            >
              {subscriptionPlan.interval}
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
            >
              {subscriptionPlan.trial_days > 0 ? `Prova gratuita di ${subscriptionPlan.trial_days} giorni` : 'Nessun periodo di prova'}
            </Typography>
          </Box>
        </Grid>
        <Grid
          size={{ sm: 12, md: 7, lg: 8 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            width: '100%',
            backgroundColor: { xs: 'transparent', sm: 'background.default' },
            alignItems: 'start',
            pt: { xs: 0, sm: 16 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 8 }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: { sm: 'space-between', md: 'flex-end' },
              alignItems: 'center',
              width: '100%',
              maxWidth: { sm: '100%', md: 600 }
            }}
          >
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexGrow: 1
              }}
            >
              <Stepper
                id="desktop-stepper"
                activeStep={activeStep}
                sx={{ width: '100%', height: 40 }}
              >
                {steps.map((label) => (
                  <Step
                    sx={{ ':first-of-type': { pl: 0 }, ':last-child': { pr: 0 } }}
                    key={label}
                  >
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
          <Card sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
            <CardContent
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Selected products
                </Typography>
                <Typography variant="body1">
                  {activeStep >= 2 ? '$144.97' : '$134.98'}
                </Typography>
              </div>
            </CardContent>
          </Card>
          <Formik {...formik}>
            <Form>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  width: '100%',
                  maxWidth: { sm: '100%', md: 600 },
                  maxHeight: '720px',
                  gap: { xs: 5, md: 'none' }
                }}
              >
                {activeStep === steps.length ? (
                  <Stack spacing={2} useFlexGap>
                    <Typography variant="h1">📦</Typography>
                    <Typography variant="h5">Thank you for your order!</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      Your order number is
                      <strong>&nbsp;#140396</strong>. We have emailed your order
                      confirmation and will update you once its shipped.
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ alignSelf: 'start', width: { xs: '100%', sm: 'auto' } }}
                    >
                      Go to my orders
                    </Button>
                  </Stack>
                ) : (
                  <React.Fragment>
                    <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
                      <PaymentForm />
                    </Box>
                    {activeStep === 1 && <Review />}
                    <Box
                      sx={[
                        {
                          display: 'flex',
                          flexDirection: { xs: 'column-reverse', sm: 'row' },
                          alignItems: 'end',
                          flexGrow: 1,
                          gap: 1,
                          pb: { xs: 12, sm: 0 },
                          mt: { xs: 2, sm: 0 },
                          mb: '60px'
                        },
                        activeStep !== 0
                          ? { justifyContent: 'space-between' }
                          : { justifyContent: 'flex-end' }
                      ]}
                    >
                      {activeStep !== 0 && (
                        <Button
                          startIcon={<ChevronLeftRoundedIcon />}
                          onClick={handleBack}
                          variant="text"
                          sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                          Previous
                        </Button>
                      )}
                      {activeStep !== 0 && (
                        <Button
                          startIcon={<ChevronLeftRoundedIcon />}
                          onClick={handleBack}
                          variant="outlined"
                          fullWidth
                          sx={{ display: { xs: 'flex', sm: 'none' } }}
                        >
                          Previous
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        endIcon={<ChevronRightRoundedIcon />}
                        //onClick={activeStep !== steps.length - 1 ? handleNext : undefined}
                        sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                        //type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                        type="submit"
                        loading={isLoading}
                      >
                        {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
                      </Button>
                    </Box>
                  </React.Fragment>
                )}
              </Box>
            </Form>
          </Formik>
        </Grid>
      </Grid>
    </React.Fragment>
  )
    ;
};

export default SubscriptionPlanPayment;
