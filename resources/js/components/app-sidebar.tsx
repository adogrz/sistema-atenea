import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardListIcon, HouseIcon, ShieldCheck, User, Calendar, Clock, BookOpen, GraduationCap, LayoutDashboard, Users, GraduationCapIcon } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { hasPermission } = usePermissions();
    const { url } = usePage();

    const isItemActive = (href: string | undefined) => {
        if (href === '/' || href === '/dashboard') {
            return url === href;
        }
        return url.startsWith(href as string);
    };

    const navStructure: NavItem[] = [
        { title: 'Inicio', href: '/dashboard', icon: HouseIcon },
        {
            title: 'Administración',
            icon: ShieldCheck,
            items: [
                ...(hasPermission('users:list') ? [{ title: 'Usuarios', href: '/dashboard/users', icon: User }] : []),
                ...(hasPermission('audit:view')
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
        {
            title: 'Académico',
            icon: Calendar,
            items: [
                ...(hasPermission('events:view') ? [{ title: 'Panel Académico', href: '/dashboard/academico', icon: LayoutDashboard }] : []),
                ...(hasPermission('events:view') ? [{ title: 'Calendario', href: '/dashboard/calendario', icon: Calendar }] : []),
                ...(hasPermission('events:view') ? [{ title: 'Datos Aspirantes', href: '/dashboard/academico/aspirantes', icon: Clock }] : []),
                ...(hasPermission('events:view') ? [{ title: 'Estudiantes', href: '/dashboard/academico/estudiantes', icon: Users }] : []),
                ...(hasPermission('events:view') ? [{ title: 'Academia Sabatina', href: '/dashboard/academico/sabatina', icon: BookOpen }] : []),
                ...(hasPermission('events:view') ? [{ title: 'FDTC', href: '/dashboard/academico/fdtc', icon: GraduationCap }] : []),
                
            ],
        },
        {
            title: 'Estudiante',
            icon: GraduationCapIcon,
            items: [
                ...(hasPermission('profile:view') ? [{ title: 'Inscripciones', href: '/dashboard/inscripciones', icon: LayoutDashboard }] : []),
                ...(hasPermission('profile:view') ? [{ title: 'Calendario', href: '/dashboard/calendario', icon: Calendar }] : []),
                ...(hasPermission('profile:view') ? [{ title: 'FDTC', href: '/dashboard/academico/fdtc', icon: GraduationCap }] : []),
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
