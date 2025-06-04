import React from "react";
import {Step, StepLabel, Stepper} from "@mui/material";

export const STEPS = ["Crea l'ordine", "Gestisci il pagamento", "Riepilogo ordine"];

interface SaleStepperProps {
  activeStep: number;
}

export default function SaleStepper({activeStep}: SaleStepperProps){

  return (
    <Stepper activeStep={activeStep}>
      {STEPS.map((label) => {
        const stepProps: { completed?: boolean } = {};
        const labelProps: {
          optional?: React.ReactNode;
        } = {};
        return (
          <Step key={label} {...stepProps}>
            <StepLabel {...labelProps}>{label}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  )
};
