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
      const filtered = priceLists.filter((item) =>
        item.name.toLowerCase().includes(filter.toLowerCase())
      );
      /*const filtered = priceLists.filter(function f(o) {
        if (o.name.toLowerCase().includes(filter)) return true

        if (o.children) {
          return (o.children = o.children.filter(f)).length
        }
      })*/
      setFilteredPrPriceLists(filtered);
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
