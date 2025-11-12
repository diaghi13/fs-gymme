import * as React from 'react';
import { Sale } from '@/types';
import { Box, Divider, Grid, Typography } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { Building2, CreditCard, Mail, MapPin, Phone, User } from 'lucide-react';

interface SaleCustomerCardProps {
  sale: Sale;
}

const SaleCustomerCard: React.FC<SaleCustomerCardProps> = ({ sale }) => {
  const customer = sale.customer;

  if (!customer) {
    return (
      <MyCard sx={{ height: '100%' }} title="Cliente">
        <Typography variant="body2" color="text.secondary">
          Nessun cliente associato
        </Typography>
      </MyCard>
    );
  }

  return (
    <MyCard sx={{ height: '100%' }} title="Cliente">
      <Grid container spacing={2}>
        {/* Nome/Ragione Sociale */}
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {customer.company_name ? <Building2 size={18} color="#666" /> : <User size={18} color="#666" />}
            <Typography variant="body2" color="text.secondary">
              {customer.company_name ? 'Ragione Sociale' : 'Nome'}
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {customer.company_name || customer.full_name}
          </Typography>
        </Grid>

        {/* Codice Fiscale / P.IVA */}
        {(customer.tax_id_code || customer.vat_number) && (
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CreditCard size={18} color="#666" />
              <Typography variant="body2" color="text.secondary">
                {customer.vat_number ? 'P.IVA' : 'Codice Fiscale'}
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={600}>
              {customer.vat_number ? `IT${customer.vat_number}` : customer.tax_id_code}
            </Typography>
          </Grid>
        )}

        {/* Indirizzo */}
        {customer.street && (
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
              <MapPin size={18} color="#666" />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Indirizzo
                </Typography>
                <Typography variant="body2">
                  {customer.street}
                  {customer.number && `, ${customer.number}`}
                </Typography>
                <Typography variant="body2">
                  {customer.zip} {customer.city}
                  {customer.province && ` (${customer.province})`}
                </Typography>
                {customer.country && (
                  <Typography variant="body2" color="text.secondary">
                    {customer.country}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        )}

        {/* Email */}
        {customer.email && (
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Mail size={18} color="#666" />
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
            </Box>
            <Typography variant="body2">{customer.email}</Typography>
          </Grid>
        )}

        {/* Phone */}
        {customer.phone && (
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Phone size={18} color="#666" />
              <Typography variant="body2" color="text.secondary">
                Telefono
              </Typography>
            </Box>
            <Typography variant="body2">{customer.phone}</Typography>
          </Grid>
        )}
      </Grid>
    </MyCard>
  );
};

export default SaleCustomerCard;
