import React, { createContext, FC, PropsWithChildren } from 'react';
import { SaleRowFormValues } from '@/support/createCartItem';
import MyMath from '@/support/Math';
import { ARTICLE, MEMBERSHIP, SUBSCRIPTION } from '@/pages/price-lists/price-lists';

type SaleRow = SaleRowFormValues & { total: number };

interface VatRateSummaryType {
  code: string;
  description: string;
  percentage: number;
  nature: string;
  taxable: number;
  tax: number
}

interface SaleContextType {
  sale_rows: SaleRow[];
  sale_price: number;
  discount_percentage: number;
  discount_absolute: number;
  total_price: number;
  vatRateSummary: VatRateSummaryType[];
  setSaleRows: (payload: SaleRowFormValues[]) => void;
  setSaleDiscount: (payload: { name: SaleDiscountTypes; discount: string | number }) => void;
  calculateVatSeparation: () => void;
}

export const SaleContext = createContext<SaleContextType>({
  sale_rows: [],
  sale_price: 0,
  discount_percentage: 0,
  discount_absolute: 0,
  total_price: 0,
  vatRateSummary: [],
  setSaleRows: () => {
  },
  setSaleDiscount: () => {
  },
  calculateVatSeparation: () => {}
});

export const enum actionTypes {
  SET_SALE_ROWS = 'SET_SALE_ROWS',
  SUBTRACT_DISCOUNT_PERCENTAGE = 'SUBTRACT_DISCOUNT_PERCENTAGE',
  SUBTRACT_DISCOUNT_ABSOLUTE = 'SUBTRACT_DISCOUNT_ABSOLUTE',
  VAT_SEPARATION = 'VAT_SEPARATION',
}

export const enum SaleDiscountTypes {
  PERCENTAGE = 'percentage_discount',
  ABSOLUTE = 'absolute_discount',
}

interface StateProps {
  sale_rows: SaleRowFormValues[];
  sale_price: number;
  discount_percentage: number;
  discount_absolute: number;
  total_price: number;
  vatRateSummary: VatRateSummaryType[];
}

const initialState: StateProps = {
  sale_rows: [],
  sale_price: 0,
  discount_percentage: 0,
  discount_absolute: 0,
  total_price: 0,
  vatRateSummary: [],
};

// type PayloadType = SaleRowFormValues[] | number | { index: number, saleRow: SaleRow } | {
//   index: number,
//   discount: number
// };

type Action =
  | { type: actionTypes.SET_SALE_ROWS; payload: SaleRowFormValues[] }
  | { type: actionTypes.SUBTRACT_DISCOUNT_PERCENTAGE; payload: number }
  | { type: actionTypes.SUBTRACT_DISCOUNT_ABSOLUTE; payload: number }
  | { type: actionTypes.VAT_SEPARATION };

const reducer = (state: StateProps, action: Action) => {
  switch (action.type) {
    case actionTypes.SET_SALE_ROWS: {
      if (Array.isArray(action.payload)) {
        // Calcolo totale lordo (inclusi contenuti abbonamento)
        let totalGross = 0;
        action.payload.forEach(row => {
          if (row.price_list.type === SUBSCRIPTION && row.subscription_selected_content) {
            totalGross += row.subscription_selected_content.reduce((sum, content) => sum + content.price, 0);
          } else {
            totalGross += row.unit_price;
          }
        });

        const saleRows = action.payload.map(row => {
          let rowGross = 0;
          if (row.price_list.type === SUBSCRIPTION && row.subscription_selected_content) {
            rowGross = row.subscription_selected_content.reduce((sum, content) => sum + content.price, 0);
          } else {
            rowGross = row.unit_price;
          }
          const rowDiscountTotal = totalGross > 0
            ? (rowGross / totalGross) * (state.discount_absolute ?? 0)
            : 0;
          return {
            ...row,
            total: row.unit_price - row.absolute_discount - rowDiscountTotal
          };
        });

        const salePrice = action.payload.reduce(
          (accumulator, current) => accumulator + current.unit_price - current.absolute_discount,
          0
        );
        const totalPrice = saleRows.reduce((sum, row) => sum + row.total, 0);

        return {
          ...state,
          sale_rows: saleRows,
          sale_price: salePrice,
          total_price: totalPrice
        };
      }
      return state;
    }

    case actionTypes.SUBTRACT_DISCOUNT_PERCENTAGE: {
      const percentageDiscount = action.payload as number ?? 0;
      const absoluteDiscount = MyMath.percentageDiscount(state.sale_price, percentageDiscount);
      const totalPriceWithPercentageDiscount = state.sale_price - absoluteDiscount;

      if (totalPriceWithPercentageDiscount < 0) {
        return { ...state, total_price: 0 };
      }

      // Calcolo totale lordo (inclusi contenuti abbonamento)
      let totalGross = 0;
      state.sale_rows.forEach(row => {
        if (row.price_list.type === SUBSCRIPTION && row.subscription_selected_content) {
          totalGross += row.subscription_selected_content.reduce((sum, content) => sum + content.price, 0);
        } else {
          totalGross += row.unit_price;
        }
      });

      const saleRows = state.sale_rows.map(row => {
        let rowGross = 0;
        if (row.price_list.type === SUBSCRIPTION && row.subscription_selected_content) {
          rowGross = row.subscription_selected_content.reduce((sum, content) => sum + content.price, 0);
        } else {
          rowGross = row.unit_price;
        }
        const rowDiscountTotal = totalGross > 0
          ? (rowGross / totalGross) * absoluteDiscount
          : 0;
        return {
          ...row,
          total: row.unit_price - row.absolute_discount - rowDiscountTotal
        };
      });

      return {
        ...state,
        discount_percentage: percentageDiscount,
        discount_absolute: absoluteDiscount,
        total_price: totalPriceWithPercentageDiscount,
        sale_rows: saleRows
      };
    }

    case actionTypes.SUBTRACT_DISCOUNT_ABSOLUTE: {
      const absoluteDiscount = action.payload as number ?? 0;
      const totalPriceWithAbsoluteDiscount = state.sale_price - absoluteDiscount;

      if (totalPriceWithAbsoluteDiscount < 0) {
        return { ...state, total_price: 0 };
      }

      // Calcolo totale lordo (inclusi contenuti abbonamento)
      let totalGross = 0;
      state.sale_rows.forEach(row => {
        if (row.price_list.type === SUBSCRIPTION && row.subscription_selected_content) {
          totalGross += row.subscription_selected_content.reduce((sum, content) => sum + content.price, 0);
        } else {
          totalGross += row.unit_price;
        }
      });

      const saleRows = state.sale_rows.map(row => {
        let rowGross = 0;
        if (row.price_list.type === SUBSCRIPTION && row.subscription_selected_content) {
          rowGross = row.subscription_selected_content.reduce((sum, content) => sum + content.price, 0);
        } else {
          rowGross = row.unit_price;
        }
        const rowDiscountTotal = totalGross > 0
          ? (rowGross / totalGross) * absoluteDiscount
          : 0;
        return {
          ...row,
          total: row.unit_price - row.absolute_discount - rowDiscountTotal
        };
      });

      return {
        ...state,
        discount_absolute: absoluteDiscount,
        discount_percentage: (absoluteDiscount / state.sale_price) * 100,
        total_price: totalPriceWithAbsoluteDiscount,
        sale_rows: saleRows
      };
    }

    case actionTypes.VAT_SEPARATION: {
      // const vatRateSummary: VatRateSummaryType[] = [];
      // const vatRateMap: { [key: string]: VatRateSummaryType } = {};
      // const vatRateZero: VatRateSummaryType = {
      //   code: '0',
      //   description: 'Esente',
      //   percentage: 0,
      //   nature: 'N1',
      //   taxable: 0,
      //   tax: 0
      // };
      //
      // // Calcolo totale lordo (inclusi contenuti abbonamento)
      // let totalGross = 0;
      // state.sale_rows.forEach((saleRow) => {
      //   if (saleRow.price_list.type === SUBSCRIPTION && saleRow.subscription_selected_content) {
      //     totalGross += saleRow.subscription_selected_content.reduce((sum, content) => sum + content.price, 0);
      //   } else {
      //     totalGross += saleRow.unit_price;
      //   }
      // });
      //
      // state.sale_rows.forEach((saleRow) => {
      //   if (saleRow.price_list.type === SUBSCRIPTION && saleRow.subscription_selected_content) {
      //     const totalContentPrice = saleRow.subscription_selected_content.reduce(
      //       (sum, content) => sum + content.price, 0
      //     );
      //     saleRow.subscription_selected_content.forEach(content => {
      //       const vatRate = content.vat_rate ?? vatRateZero;
      //       const vatRateCode = vatRate.code;
      //       const vatRatePercentage = vatRate.percentage;
      //
      //       if (!vatRateMap[vatRateCode]) {
      //         vatRateMap[vatRateCode] = {
      //           code: vatRateCode,
      //           description: vatRate.description,
      //           percentage: vatRatePercentage,
      //           nature: vatRate.nature,
      //           taxable: 0,
      //           tax: 0
      //         };
      //       }
      //
      //       // Sconto proporzionale su contenuto (sia da riga abbonamento che da sconto totale)
      //       const contentDiscountRow = totalContentPrice > 0
      //         ? (content.price / totalContentPrice) * (saleRow.absolute_discount ?? 0)
      //         : 0;
      //       const contentDiscountTotal = totalGross > 0
      //         ? (content.price / totalGross) * (state.discount_absolute ?? 0)
      //         : 0;
      //       const price = content.price - contentDiscountRow - contentDiscountTotal;
      //       const tax = price - (price / (1 + vatRatePercentage / 100));
      //       const taxable = price - tax;
      //
      //       vatRateMap[vatRateCode].taxable += taxable;
      //       vatRateMap[vatRateCode].tax += tax;
      //     });
      //     return;
      //   }
      //
      //   // Prodotto o membership
      //   let vatRate;
      //   if (saleRow.price_list.type === ARTICLE || saleRow.price_list.type === MEMBERSHIP) {
      //     vatRate = saleRow.price_list.vat_rate;
      //   } else {
      //     vatRate = vatRateZero;
      //   }
      //
      //   if (!vatRate) {
      //     return;
      //   }
      //
      //   const vatRateCode = vatRate.code;
      //   const vatRatePercentage = vatRate.percentage;
      //
      //   if (!vatRateMap[vatRateCode]) {
      //     vatRateMap[vatRateCode] = {
      //       code: vatRateCode,
      //       description: vatRate.description,
      //       percentage: vatRatePercentage,
      //       nature: vatRate.nature,
      //       taxable: 0,
      //       tax: 0
      //     };
      //   }
      //
      //   // Sconto proporzionale su riga (sia da riga che da sconto totale)
      //   const rowDiscountTotal = totalGross > 0
      //     ? (saleRow.unit_price / totalGross) * (state.discount_absolute ?? 0)
      //     : 0;
      //   const price = saleRow.unit_price - saleRow.absolute_discount - rowDiscountTotal;
      //   const tax = price - (price / (1 + vatRatePercentage / 100));
      //   const taxable = price - tax;
      //
      //   vatRateMap[vatRateCode].taxable += taxable;
      //   vatRateMap[vatRateCode].tax += tax;
      // });
      //
      // Object.values(vatRateMap).forEach(vatRate => {
      //   vatRateSummary.push(vatRate);
      // });
      //
      // if (!vatRateSummary.find(v => v.code === '0')) {
      //   vatRateSummary.push(vatRateZero);
      // }
      //
      // return {
      //   ...state,
      //   vatRateSummary
      // };
      const vatRateSummary: VatRateSummaryType[] = [];
      const vatRateMap: { [key: string]: VatRateSummaryType } = {};

      // Calcolo totale lordo (inclusi contenuti abbonamento)
      let totalGross = 0;
      state.sale_rows.forEach((saleRow) => {
        if (saleRow.price_list.type === SUBSCRIPTION && saleRow.subscription_selected_content) {
          totalGross += saleRow.subscription_selected_content.reduce((sum, content) => sum + content.price, 0);
        } else {
          totalGross += saleRow.unit_price;
        }
      });

      state.sale_rows.forEach((saleRow) => {
        if (saleRow.price_list.type === SUBSCRIPTION && saleRow.subscription_selected_content) {
          const totalContentPrice = saleRow.subscription_selected_content.reduce(
            (sum, content) => sum + content.price, 0
          );
          saleRow.subscription_selected_content.forEach(content => {
            const vatRate = content.vat_rate;
            if (!vatRate) return;
            const vatRateCode = vatRate.code;
            const vatRatePercentage = vatRate.percentage;

            if (!vatRateMap[vatRateCode]) {
              vatRateMap[vatRateCode] = {
                code: vatRateCode,
                description: vatRate.description,
                percentage: vatRatePercentage,
                nature: vatRate.nature,
                taxable: 0,
                tax: 0
              };
            }

            const contentDiscountRow = totalContentPrice > 0
              ? (content.price / totalContentPrice) * (saleRow.absolute_discount ?? 0)
              : 0;
            const contentDiscountTotal = totalGross > 0
              ? (content.price / totalGross) * (state.discount_absolute ?? 0)
              : 0;
            const price = content.price - contentDiscountRow - contentDiscountTotal;
            const tax = price - (price / (1 + vatRatePercentage / 100));
            const taxable = price - tax;

            vatRateMap[vatRateCode].taxable += taxable;
            vatRateMap[vatRateCode].tax += tax;
          });
          return;
        }

        let vatRate;
        if (saleRow.price_list.type === ARTICLE || saleRow.price_list.type === MEMBERSHIP) {
          vatRate = saleRow.price_list.vat_rate;
        } else {
          return;
        }
        if (!vatRate) return;

        const vatRateCode = vatRate.code;
        const vatRatePercentage = vatRate.percentage;

        if (!vatRateMap[vatRateCode]) {
          vatRateMap[vatRateCode] = {
            code: vatRateCode,
            description: vatRate.description,
            percentage: vatRatePercentage,
            nature: vatRate.nature,
            taxable: 0,
            tax: 0
          };
        }

        const rowDiscountTotal = totalGross > 0
          ? (saleRow.unit_price / totalGross) * (state.discount_absolute ?? 0)
          : 0;
        const price = saleRow.unit_price - saleRow.absolute_discount - rowDiscountTotal;
        const tax = price - (price / (1 + vatRatePercentage / 100));
        const taxable = price - tax;

        vatRateMap[vatRateCode].taxable += taxable;
        vatRateMap[vatRateCode].tax += tax;
      });

      Object.values(vatRateMap).forEach(vatRate => {
        vatRateSummary.push(vatRate);
      });

      return {
        ...state,
        vatRateSummary
      };
    }

    default:
      return state;
  }
};

export const SaleContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // const setSaleRow = React.useCallback((type: actionTypes, payload: SaleRowFormValues[] | number) => {
  //   dispatch({ type, payload });
  // }, [dispatch]);

  const setSaleRows = React.useCallback((payload: SaleRowFormValues[]) => {
    dispatch({ type: actionTypes.SET_SALE_ROWS, payload });
  }, [dispatch]);

  const setSaleDiscount = React.useCallback((payload: { name: SaleDiscountTypes, discount: string | number }) => {
    if (payload.name === SaleDiscountTypes.PERCENTAGE) {
      dispatch({ type: actionTypes.SUBTRACT_DISCOUNT_PERCENTAGE, payload: Number(payload.discount) });
    } else if (payload.name === SaleDiscountTypes.ABSOLUTE) {
      dispatch({ type: actionTypes.SUBTRACT_DISCOUNT_ABSOLUTE, payload: Number(payload.discount) });
    }
  }, [dispatch]);

  const calculateVatSeparation = React.useCallback(() => {
    dispatch({ type: actionTypes.VAT_SEPARATION });
  }, [dispatch]);

  return (
    <SaleContext.Provider value={{ ...state, setSaleRows, setSaleDiscount, calculateVatSeparation }}>
      {children}
    </SaleContext.Provider>
  );
};

export const useSaleContext = () => {
  const context = React.useContext(SaleContext);

  if (!context) {
    throw new Error('useSaleContext must be used within a SaleProvider');
  }

  return context;
};
