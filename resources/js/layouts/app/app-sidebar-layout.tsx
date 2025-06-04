import { AppContent } from '@/components/tailwind/app-content';
import { AppShell } from '@/components/tailwind/app-shell';
import { AppSidebar } from '@/components/tailwind/app-sidebar';
import { AppSidebarHeader } from '@/components/tailwind/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
