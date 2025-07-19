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
  return (
   <MyCard title="Prodotti e servizi">
     <Table>
       <TableHead>
         <TableRow>
           <TableCell>Descrizione</TableCell>
           <TableCell>Prezzo base</TableCell>
           <TableCell>IVA (%)</TableCell>
           <TableCell>Sconto %</TableCell>
           <TableCell>Sconto ass.</TableCell>
           <TableCell>Prezzo</TableCell>
         </TableRow>
       </TableHead>
       <TableBody>
         {sale.rows.map((saleContent, index) => (
           <React.Fragment key={index}>
             <TableRow>
               <TableCell>{saleContent.description}</TableCell>
               <TableCell>{Str.EURO(saleContent.unit_price).format()}</TableCell>
               <TableCell>{saleContent.price_list.type === ARTICLE || saleContent.price_list.type === MEMBERSHIP ? saleContent.price_list.vat_rate?.percentage : '0'}</TableCell>
               <TableCell>{saleContent.percentage_discount}</TableCell>
               <TableCell>{Str.EURO(saleContent.absolute_discount).format()}</TableCell>
               <TableCell>{Str.EURO(saleContent.total).format()}</TableCell>
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
