import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardListIcon, HouseIcon, ShieldCheck, User } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { hasPermission } = usePermissions();
    const { url } = usePage();

    const isItemActive = (href: string) => {
        if (href === '/' || href === '/dashboard') {
            return url === href;
        }
        return url.startsWith(href);
    };

    const navStructure: NavItem[] = [
        { title: 'Inicio', href: '/dashboard', icon: HouseIcon },
        {
            title: 'Administración',
            href: '#',
            icon: ShieldCheck,
            items: [
                ...(hasPermission('user-list') ? [{ title: 'Usuarios', href: '/dashboard/users', icon: User }] : []),
                ...(hasPermission('audit-view')
                    ? [
                          {
                              title: 'Auditoría',
                              href: '/dashboard/audit',
                              icon: ClipboardListIcon,
                          },
                      ]
                    : []),
            ],
        },
    ];

    const mainNavItems = navStructure
        .filter((item) => !item.items || item.items.length > 0)
        .map((item) => {
            const isGroup = !!item.items;
            const groupIsOpen = isGroup ? item.items!.some((sub) => isItemActive(sub.href)) : false;

            return {
                ...item,
                isActive: !isGroup && isItemActive(item.href),
                isOpen: groupIsOpen,
                href: isGroup ? item.items![0].href : item.href,
                items: item.items?.map((subItem) => ({
                    ...subItem,
                    isActive: isItemActive(subItem.href),
                })),
            };
        });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" preserveState>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
