import { PropsWithChildren } from 'react';
import SiteNavigation from '@/components/academy/site-navigation';
import SiteFooter from '@/components/academy/site-footer';

const AcademyLayout = ({ children }: PropsWithChildren) => (
    <div className="min-h-screen bg-background text-foreground">
        <SiteNavigation />
        <main>{children}</main>
        <SiteFooter />
    </div>
);

export default AcademyLayout;

