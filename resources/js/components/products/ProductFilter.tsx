import * as React from 'react';
import { FormControl, Input, InputAdornment, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ChangeEvent } from 'react';

interface ProductFilterProps {
  filter: string;
  onFilter: (event: ChangeEvent<HTMLInputElement>) => void;
}

const ProductFilter : React.FC<ProductFilterProps> = ({filter, onFilter}) => {
  return (
      <FormControl variant="standard" fullWidth>
          <InputLabel htmlFor="search-product-input">
              Cerca...
          </InputLabel>
          <Input
              id="search-product-input"
              value={filter}
              onChange={onFilter}
              startAdornment={
                  <InputAdornment position="start">
                      <SearchIcon/>
                  </InputAdornment>
              }
          />
      </FormControl>
 );
};

export default ProductFilter
