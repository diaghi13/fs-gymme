import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/tailwind/ui/card';
import { Link } from '@inertiajs/react';
import { Box, Container, Stack } from '@mui/material';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                p: { xs: 3, md: 5 },
                bgcolor: 'background.default',
            }}
        >
            <Container maxWidth="sm">
                <Stack spacing={3} alignItems="center">
                    <Link href={route('home')}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                            }}
                        >
                            <AppLogoIcon className="size-9 fill-current text-black dark:text-white" />
                        </Box>
                    </Link>

                    <Card className="rounded-xl w-full">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">{children}</CardContent>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}
