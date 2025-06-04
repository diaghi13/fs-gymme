import * as React from 'react';
import Container from '@mui/material/Container';
import AppLayout from "@/layouts/AppLayout";
import {PageProps} from "@/types";

interface DashboardProps extends PageProps {
    active_membership_fees: number;
    active_subscriptions: number;
    daily_collection_sum: number;
    pending_payments_count: number;
    subscription_diff_per_date: Array<number>;
    daily_collection_diff_sum: Array<number>;
}

export default function Dashboard({auth}: DashboardProps) {
    return (
        <AppLayout user={auth.user}>
            <Container maxWidth="xl" sx={{mt: 2, mb: 2}}>

            </Container>
        </AppLayout>
    );
}
