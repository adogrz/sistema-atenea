import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { type PropsWithChildren } from 'react';

interface AdmissionLayoutProps {
    sidebar?: React.ReactNode;
}

export default function AdmissionLayout({ children, sidebar }: PropsWithChildren<AdmissionLayoutProps>) {
    return (
        <SidebarProvider defaultOpen={true}>
            {sidebar && (
                <Sidebar side="left" variant="inset" collapsible="offcanvas">
                    {sidebar}
                </Sidebar>
            )}
            <SidebarInset className="overflow-x-hidden">{children}</SidebarInset>
        </SidebarProvider>
    );
}
