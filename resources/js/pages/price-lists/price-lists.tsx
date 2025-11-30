import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';

// import {PRICE_LIST_ARTICLE, PRICE_LIST_FOLDER, PRICE_LIST_MEMBERSHIP_FEE, PRICE_LIST_SUBSCRIPTION} from "./index";
import {
  PageProps,
  BaseProduct,
  CourseProduct,
  AllPriceLists,
  PriceList,
  PriceListFolder,
  PriceListArticle,
  PriceListMembershipFee, PriceListSubscription, PriceListDayPass, PriceListToken, PriceListGiftCard, PriceListFolderTree, AutocompleteOptions, BookableService
} from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Box, Grid, Typography } from '@mui/material';
import PriceListListCard from '@/components/price-list/PriceListListCard';
import FolderPriceListCard from '@/components/price-list/folder/FolderPriceListCard';
import ArticlePriceListCard from '@/components/price-list/article/ArticlePriceListCard';
import MembershipFeePriceListCard from '@/components/price-list/membership/MembershipPriceListCard';
import SubscriptionPriceListCard from '@/components/price-list/subscription/SubscriptionPriceListCard';
import DayPassPriceListCard from '@/components/price-list/day-pass/DayPassPriceListCard';
import TokenPriceListCard from '@/components/price-list/token/TokenPriceListCard';
import GiftCardPriceListCard from '@/components/price-list/gift-card/GiftCardPriceListCard';

import LoyaltyOutlinedIcon from '@mui/icons-material/LoyaltyOutlined';

export const FOLDER = 'folder';
export const SUBSCRIPTION = 'subscription';
export const ARTICLE = 'article';
export const MEMBERSHIP = 'membership';
export const DAY_PASS = 'day_pass';
export const TOKEN = 'token';
export const GIFT_CARD = 'gift_card';

export interface PriceListPageProps extends PageProps {
  priceLists: Array<AllPriceLists>;
  priceListOptions?: AutocompleteOptions<number>;
  priceListOptionsTree?: Array<PriceListFolderTree>;
  priceList?: PriceListFolder | PriceListArticle | PriceListMembershipFee | PriceListSubscription | PriceListDayPass | PriceListToken | PriceListGiftCard;
  vatRateOptions?: AutocompleteOptions<number>;
  articles?: Array<PriceListArticle>;
  baseProducts?: Array<BaseProduct>;
  courseProducts?: Array<CourseProduct>;
  bookableServices?: Array<BookableService>;
  membershipFees?: Array<PriceListMembershipFee>;
  tokens?: Array<PriceListToken>;
  giftCards?: Array<PriceListGiftCard>;
  dayPasses?: Array<PriceListDayPass>;
}

export default function PriceListPage(
  {
    auth,
    priceList,
    priceListOptions,
    priceListOptionsTree,
    vatRateOptions,
  }: PriceListPageProps) {
  const props = usePage<PageProps>().props;

  const handleSelect = (priceList: AllPriceLists) => {
    switch (priceList.type) {
      case FOLDER:
        router.get(
          route('app.folder-price-lists.show', { folder_price_list: priceList.id!, tenant: props.currentTenantId }),
          undefined,
          { preserveState: true }
        );
        break;
      case MEMBERSHIP:
        router.get(
          route('app.price-lists.memberships.show', { membership: priceList.id!, tenant: props.currentTenantId }),
          undefined,
          { preserveState: true }
        );
        break;
      case DAY_PASS:
        router.get(
          route('app.price-lists.day-passes.show', { day_pass: priceList.id!, tenant: props.currentTenantId }),
          undefined,
          { preserveState: true }
        );
        break;
      case ARTICLE:
        router.get(
          route('app.price-lists.articles.show', { article: priceList.id!, tenant: props.currentTenantId }),
          undefined,
          { preserveState: true }
        );
        break;
      case SUBSCRIPTION:
        router.get(
          route('app.price-lists.subscriptions.show', { subscription: priceList.id!, tenant: props.currentTenantId }),
          undefined,
          { preserveState: true }
        );
        break;
      case TOKEN:
        router.get(
          route('app.price-lists.tokens.show', { token: priceList.id!, tenant: props.currentTenantId }),
          undefined,
          { preserveState: true }
        );
        break;
      case GIFT_CARD:
        router.get(
          route('app.price-lists.gift-cards.show', { gift_card: priceList.id!, tenant: props.currentTenantId }),
          undefined,
          { preserveState: true }
        );
        break;
    }
  };

  return (
    <AppLayout user={auth.user}>
      <Head><title>Listini</title></Head>

      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <PriceListListCard
            onSelect={handleSelect}
            canCreate={true}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          {priceList?.type === FOLDER && (
            <FolderPriceListCard />
          )}
          {priceList?.type === ARTICLE && (
            <ArticlePriceListCard
              priceList={priceList}
              priceListOptions={priceListOptions!}
              priceListOptionsTree={priceListOptionsTree!}
              vatRateOptions={vatRateOptions!}
            />
          )}
          {priceList?.type === MEMBERSHIP && (
            <MembershipFeePriceListCard
              priceList={priceList}
              priceListOptions={priceListOptions!}
              priceListOptionsTree={priceListOptionsTree!}
              vatRateOptions={vatRateOptions!}
            />
          )}
          {priceList?.type === DAY_PASS && (
            <DayPassPriceListCard
              priceList={priceList}
              priceListOptions={priceListOptions!}
              priceListOptionsTree={priceListOptionsTree!}
              vatRateOptions={vatRateOptions!}
            />
          )}
          {priceList?.type === TOKEN && (
            <TokenPriceListCard
              priceList={priceList}
              priceListOptions={priceListOptions!}
              priceListOptionsTree={priceListOptionsTree!}
              vatRateOptions={vatRateOptions!}
            />
          )}
          {priceList?.type === GIFT_CARD && (
            <GiftCardPriceListCard
              priceList={priceList}
              priceListOptions={priceListOptions!}
              priceListOptionsTree={priceListOptionsTree!}
              vatRateOptions={vatRateOptions!}
            />
          )}
          {priceList?.type === SUBSCRIPTION && (
            <SubscriptionPriceListCard
              priceList={priceList}
            />
          )}
          {!priceList && (
            <Grid container spacing={2} sx={{ p: 2 , height: '70vh'}}>
              <Grid size={12} sx={{ textAlign: 'center', p: 2, color: '#666', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  color: '#888',
                }}>
                  <Typography variant="h5" gutterBottom mb={2} sx={{ fontWeight: 500 }}>
                    Benvenuto nella pagina dei listini!
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                    Qui puoi gestire i tuoi listini e le relative opzioni.
                  </Typography>
                  <Box sx={{ fontSize: 100, my: 4 }}>
                    <LoyaltyOutlinedIcon fontSize="inherit" />
                  </Box>
                  <Typography variant="body1" gutterBottom>
                    Seleziona un listino dalla colonna di sinistra per visualizzarne i dettagli e modificarlo.
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Puoi anche creare un nuovo listino cliccando sul pulsante "Crea" in alto a destra.
                  </Typography>
                </div>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </AppLayout>
  );
};
