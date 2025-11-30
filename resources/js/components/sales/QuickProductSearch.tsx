import React, { useState, useCallback } from 'react';
import { Autocomplete, TextField, CircularProgress, Paper, Typography, Chip, Box } from '@mui/material';
import { AllPriceLists, PriceListFolder, PriceListMembershipFee, PriceListSubscription } from '@/types';
import { usePage } from '@inertiajs/react';
import { SalePageProps } from '@/pages/sales/sales';
import { Search } from 'lucide-react';
import axios from 'axios';
import { ARTICLE, MEMBERSHIP, SUBSCRIPTION, DAY_PASS, TOKEN, GIFT_CARD } from '@/pages/price-lists/price-lists';

interface QuickProductSearchProps {
  onSelect: (priceList: Exclude<AllPriceLists, PriceListFolder>) => void;
  disabled?: boolean;
}

/**
 * Quick product search autocomplete for fast sales
 *
 * Features:
 * - Fast search by product name or code
 * - Type indicators (Subscription, Membership, Article, etc.)
 * - Price preview
 * - Keyboard accessible (Tab to focus, Enter to add)
 */
export default function QuickProductSearch({ onSelect, disabled = false }: QuickProductSearchProps) {
  const { priceLists } = usePage<SalePageProps>().props;
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Debounce search value to avoid too many re-renders
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Flatten price lists tree for search
  const flattenPriceLists = useCallback((items: AllPriceLists[]): Exclude<AllPriceLists, PriceListFolder>[] => {
    if (!items || !Array.isArray(items)) {
      return [];
    }

    const result: Exclude<AllPriceLists, PriceListFolder>[] = [];

    const flatten = (list: AllPriceLists[]) => {
      list.forEach(item => {
        // Check if it's a folder by checking the type property
        if (item.type === 'folder') {
          // It's a folder, recurse into children if they exist and have items
          if ('children' in item && item.children && Array.isArray(item.children) && item.children.length > 0) {
            flatten(item.children);
          }
        } else {
          // It's a product, add to results
          result.push(item as Exclude<AllPriceLists, PriceListFolder>);
        }
      });
    };

    flatten(items);
    return result;
  }, []);

  const allProducts = flattenPriceLists(priceLists || []);

  // Filter products based on debounced search value
  const filteredProducts = debouncedSearchValue
    ? allProducts.filter(product =>
        product.name.toLowerCase().includes(debouncedSearchValue.toLowerCase())
      )
    : [];

  const handleSelect = async (_: any, value: Exclude<AllPriceLists, PriceListFolder> | null) => {
    if (!value || typeof value === 'string') {
      return;
    }

    setLoading(true);
    try {
      // Fetch full product details
      const response = await axios.get(route('api.v1.price-lists.show', { priceList: value.id }));
      const fullProduct = response.data.data;

      if (!fullProduct || !fullProduct.type) {
        console.error('Invalid product data received:', response.data);
        return;
      }

      onSelect(fullProduct as Exclude<AllPriceLists, PriceListFolder>);
      setSearchValue(''); // Clear search after selection
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case SUBSCRIPTION:
        return { label: 'Abbonamento', color: 'primary' as const };
      case MEMBERSHIP:
        return { label: 'Tessera', color: 'secondary' as const };
      case ARTICLE:
        return { label: 'Articolo', color: 'success' as const };
      case DAY_PASS:
        return { label: 'Giornaliero', color: 'info' as const };
      case TOKEN:
        return { label: 'Token', color: 'warning' as const };
      case GIFT_CARD:
        return { label: 'Gift Card', color: 'error' as const };
      default:
        return { label: type, color: 'default' as const };
    }
  };

  const formatPrice = (euros: number | null) => {
    if (euros === null || euros === undefined) {
      return 'Prezzo variabile';
    }
    return `€ ${euros.toFixed(2).replace('.', ',')}`;
  };

  return (
    <Autocomplete
      options={filteredProducts}
      loading={loading}
      disabled={disabled}
      value={null}
      inputValue={searchValue}
      onInputChange={(_, newValue) => setSearchValue(newValue)}
      onChange={handleSelect}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
      filterOptions={(x) => x} // Disable built-in filtering (we do it ourselves)
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Cerca prodotto... (F3)"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: <Search size={20} style={{ marginRight: 8, color: '#666' }} />,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        if (typeof option === 'string') {
          return null;
        }

        const typeInfo = getTypeLabel(option.type);

        return (
          <li {...props} key={option.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  {option.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={typeInfo.label}
                  color={typeInfo.color}
                  size="small"
                />
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 80, textAlign: 'right' }}>
                  {formatPrice(option.price)}
                </Typography>
              </Box>
            </Box>
          </li>
        );
      }}
      PaperComponent={(props) => <Paper {...props} elevation={8} />}
      noOptionsText={
        debouncedSearchValue
          ? 'Nessun prodotto trovato'
          : 'Inizia a digitare per cercare...'
      }
    />
  );
}
