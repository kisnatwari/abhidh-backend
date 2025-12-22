import { PropsWithChildren } from 'react';
import SiteNavigation from '@/components/academy/site-navigation';
import SiteFooter from '@/components/academy/site-footer';
import WhatsAppButton from '@/components/academy/whatsapp-button';

const AcademyLayout = ({ children }: PropsWithChildren) => (
    <div className="min-h-screen bg-background text-foreground">
        <SiteNavigation />
        <main>{children}</main>
        <SiteFooter />
        <WhatsAppButton />
    </div>
);

export default AcademyLayout;

