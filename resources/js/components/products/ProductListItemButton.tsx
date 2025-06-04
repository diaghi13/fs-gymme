import * as React from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import SquareIcon from '@mui/icons-material/Square';
import { ProductListItem } from '@/types';

interface ProductListItemButtonProps {
    index: number;
    selectedId: number | undefined | null;
    product: ProductListItem;
    onSelect: (product: ProductListItem) => void;
}

const ProductListItemButton: React.FC<ProductListItemButtonProps> = ({ product, onSelect, selectedId, index }) => {
    return (
        <ListItemButton
            key={index}
            selected={selectedId === product.id}
            //onClick={() => onSelect(product.id ? product.id : 0)}
            onClick={() => onSelect(product)}
        >
            <ListItemIcon>
                <SquareIcon sx={{ color: product.color }} />
            </ListItemIcon>
            <ListItemText primary={product.name} />
        </ListItemButton>
    );
};

export default ProductListItemButton;
