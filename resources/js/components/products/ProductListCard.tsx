import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, CardContent, Divider, Grid, List, ListItem, ListItemText } from '@mui/material';
import MyCard from '@/components/ui/MyCard';
import { ProductListItem } from '@/types';

import AddIcon from '@mui/icons-material/Add';
import ProductFilter from '@/components/products/ProductFilter';
import ProductListItemButton from '@/components/products/ProductListItemButton';

interface ProductListCardProps {
    products: Array<ProductListItem>;
    onSelect: (product: ProductListItem) => void;
    selectedId: number | undefined | null;
    onCreate: () => void;
    title: string;
}

export default function ProductListCard({ products, onSelect, selectedId, onCreate, title }: ProductListCardProps) {
    const [filteredProducts, setFilteredProducts] = useState<Array<ProductListItem>>(products);
    const [filter, setFilter] = useState<string>('');

    const handleFilter = (event: ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
    };

    useEffect(() => {
        if (filter !== '') {
            const filtered = products.filter((item) =>
                item.name.toLowerCase().includes(filter.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [filter, products]);

    return (
        <MyCard title={title} sx={{ p: 0 }}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <ProductFilter
                            filter={filter}
                            onFilter={handleFilter}
                        />
                    </Grid>
                    <Grid size={12}>
                        <Button variant={'text'} onClick={onCreate}>
                            <AddIcon />Aggiungi nuovo prodotto
                        </Button>
                    </Grid>
                    <Grid size={12}>
                        <Divider />
                    </Grid>
                    <Grid size={12}>
                        <List dense>
                            {filteredProducts && filteredProducts.map((product, index) => (
                                <ProductListItemButton
                                    key={index}
                                    index={index}
                                    selectedId={selectedId}
                                    product={product}
                                    onSelect={onSelect} />
                            ))}
                            {filteredProducts.length === 0 && (
                                <ListItem>
                                    <ListItemText primary={'Nessun prodotto inserito'} />
                                </ListItem>
                            )}
                        </List>
                    </Grid>
                </Grid>
            </CardContent>
        </MyCard>
    );
};
