import * as React from 'react';
import MyCard from '@/components/ui/MyCard';
import { Sale } from '@/types';
import { List, ListItemIcon, ListItemText, Table, TableBody, TableCell, TableHead, TableRow, ListItem as MuiListItem } from '@mui/material';
import { Str } from '@/support/Str';
import { ARTICLE, MEMBERSHIP, SUBSCRIPTION } from '@/pages/price-lists/price-lists';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { itNumberForma } from '@/support/format';
import { expiryDateCalculator } from '@/components/sales/CartItem';

interface SaleRowsCardProps {
  sale: Sale;
}

const SaleRowsCard : React.FC<SaleRowsCardProps> = ({sale}) => {
  // Usa vat_amount salvato dal backend per calcolare il prezzo lordo
  // Questo garantisce che i prezzi mostrati siano esattamente quelli inseriti dall'utente
  const getGrossPrice = (row: typeof sale.rows[0]) => {
    const netPrice = row.unit_price_net;
    const vatPerUnit = row.vat_amount / row.quantity;
    return sale.tax_included ? netPrice + vatPerUnit : netPrice;
  };

  const getTotalGross = (row: typeof sale.rows[0]) => {
    // Totale lordo = Netto + IVA esatta calcolata dal backend
    return row.total_net + row.vat_amount;
  };

  return (
   <MyCard title="Prodotti e Servizi">
     <Table size="small">
       <TableHead>
         <TableRow>
           <TableCell sx={{ fontWeight: 600 }}>Descrizione</TableCell>
           <TableCell align="right" sx={{ fontWeight: 600 }}>Qta</TableCell>
           <TableCell align="right" sx={{ fontWeight: 600 }}>
             Prezzo {sale.tax_included ? 'Lordo' : 'Netto'}
           </TableCell>
           <TableCell align="right" sx={{ fontWeight: 600 }}>IVA %</TableCell>
           <TableCell align="right" sx={{ fontWeight: 600 }}>Sconto %</TableCell>
           <TableCell align="right" sx={{ fontWeight: 600 }}>Totale Netto</TableCell>
           <TableCell align="right" sx={{ fontWeight: 600 }}>Totale Lordo</TableCell>
         </TableRow>
       </TableHead>
       <TableBody>
         {sale.rows.map((row, index) => (
           <React.Fragment key={index}>
             <TableRow hover>
               <TableCell>{row.description}</TableCell>
               <TableCell align="right">{row.quantity}</TableCell>
               <TableCell align="right">
                 {Str.EURO(getGrossPrice(row)).format()}
               </TableCell>
               <TableCell align="right">
                 {row.vat_rate?.percentage ?? 0}%
               </TableCell>
               <TableCell align="right">
                 {row.percentage_discount > 0 ? `${row.percentage_discount}%` : '-'}
               </TableCell>
               <TableCell align="right" sx={{ fontWeight: 500 }}>
                 {Str.EURO(row.total_net).format()}
               </TableCell>
               <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                 {Str.EURO(getTotalGross(row)).format()}
               </TableCell>
             </TableRow>
             {/*{saleContent.price_list.type === SUBSCRIPTION && saleContent.entitable && (*/}
             {/*  <TableRow>*/}
             {/*    <TableCell colSpan={6} sx={{ p: 0, pl: 2 }}>*/}
             {/*      <List dense>*/}
             {/*        {saleContent.subscription_selected_content.map((detail, index) => (*/}
             {/*          <MuiListItem key={index}>*/}
             {/*            <ListItemIcon>*/}
             {/*              <SubdirectoryArrowRightIcon />*/}
             {/*            </ListItemIcon>*/}
             {/*            <ListItemText*/}
             {/*              primary={detail.price_listable.name}*/}
             {/*              //secondary={Str.EURO(detail.total_price).format()}*/}
             {/*              secondary={detail.price_listable_type !== "App\\Models\\PriceList\\PriceList" || detail.price_listable.type === MEMBERSHIP*/}
             {/*                ? `Dal: ${saleContent.start_date ? itNumberForma(saleContent.start_date) : ''} al: ${itNumberForma(expiryDateCalculator(saleContent.start_date, detail))}`*/}
             {/*                : ""}*/}
             {/*            />*/}
             {/*          </MuiListItem>*/}
             {/*        ))}*/}
             {/*      </List>*/}
             {/*    </TableCell>*/}
             {/*  </TableRow>*/}
             {/*)}*/}
           </React.Fragment>
         ))}
       </TableBody>
     </Table>
   </MyCard>
 );
};

export default SaleRowsCard
