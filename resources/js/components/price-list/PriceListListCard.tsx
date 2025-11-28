import {
  Divider,
  FormControl,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  List,
  ListItem as MuiListItem,
  ListItemText
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyCard from "@/components/ui/MyCard";
import React, {ChangeEvent, useEffect, useState} from "react";
import {
  PriceListFolderTree,
  AllPriceLists,
} from '@/types';
import ListItem from "./ListItem";
import CreatePriceListAction from '@/components/price-list/CreatePriceListAction';
import { PriceListPageProps } from '@/pages/price-lists/price-lists';
import { usePage } from '@inertiajs/react';

interface PriceListListCardProps {
  onSelect: (priceList: Exclude<AllPriceLists, PriceListFolderTree>) => void;
  canCreate?: boolean;
}

export default function PriceListListCard({onSelect, canCreate}: PriceListListCardProps) {
  const {priceLists} = usePage<PriceListPageProps>().props;
  const [filteredPriceLists, setFilteredPrPriceLists] = useState<AllPriceLists[]>(priceLists || []);
  const [filter, setFilter] = useState<string>("");

  const handleFilter = (event: ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  }

  useEffect(() => {
    if (!priceLists) {
      setFilteredPrPriceLists([]);
      return;
    }

    if (filter !== "") {
      // Recursive filter that searches in folders and their children
      const filterRecursive = (items: AllPriceLists[]): AllPriceLists[] => {
        return items.reduce<AllPriceLists[]>((acc, item) => {
          const matchesFilter = item.name.toLowerCase().includes(filter.toLowerCase());

          // Check if item is a folder with children
          if ('children' in item && item.children) {
            const filteredChildren = filterRecursive(item.children);

            // Include folder if it matches OR has matching children
            if (matchesFilter || filteredChildren.length > 0) {
              acc.push({
                ...item,
                children: filteredChildren.length > 0 ? filteredChildren : item.children
              });
            }
          } else if (matchesFilter) {
            // It's a product and it matches
            acc.push(item);
          }

          return acc;
        }, []);
      };

      setFilteredPrPriceLists(filterRecursive(priceLists));
    } else {
      setFilteredPrPriceLists(priceLists);
    }
  }, [filter, priceLists])

  return (
    <MyCard title="Listini">
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormControl variant="standard" fullWidth>
            <InputLabel htmlFor="search-product-input">
              Cerca...
            </InputLabel>
            <Input
              id="search-product-input"
              value={filter}
              onChange={handleFilter}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon/>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>
        {canCreate && <CreatePriceListAction />}
        <Grid size={12}>
          <Divider/>
        </Grid>
        <Grid size={12} style={{paddingLeft: 0}}>
          <List dense>
            {filteredPriceLists && filteredPriceLists.map((priceList, index) => (
              <ListItem key={index} priceList={priceList} onClick={onSelect} canCreate={canCreate}/>
            ))}
            {filteredPriceLists.length === 0 && (
              <MuiListItem>
                <ListItemText primary={"Nessun listino presente"}/>
              </MuiListItem>
            )}
          </List>
        </Grid>
      </Grid>
    </MyCard>
  )
};
