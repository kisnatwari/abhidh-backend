import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gray-50 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader className="flex flex-col items-center gap-4">
                        <Link href="/" className="flex flex-col items-center gap-2">
                            <div className="flex h-30 w-30 items-center justify-center">
                                <AppLogoIcon />
                            </div>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}
