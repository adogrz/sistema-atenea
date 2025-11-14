import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, ClipboardListIcon, Clock, GraduationCap, HouseIcon, LayoutDashboard, ShieldCheck, Users, School, CalendarDays, UserPlus, FileCheck, UserCheck, ClipboardCheck, FileBarChart } from 'lucide-react';
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
                ...(hasPermission('users:list') ? [{ title: 'Usuarios', href: '/dashboard/users', icon: Users }] : []),
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
        ...(hasPermission('academic:view') ? [{
            title: 'Académico',
            icon: School,
            items: [
                { title: 'Panel Académico', href: '/dashboard/academico', icon: LayoutDashboard },
                { title: 'Calendario', href: '/dashboard/calendario', icon: CalendarDays },
            ],
        }] : []),
        ...(hasPermission('internado:view') || hasPermission('internado:admin:view') || hasPermission('internado:asistencias:view') ? [{
            title: 'FDTC',
            icon: ShieldCheck,
            items: [
                ...(hasPermission('internado:admin:view') ? [
                    { title: 'Selección FDTC', href: '/dashboard/internado-fdtc/seleccion', icon: UserPlus },
                    { title: 'Participantes', href: '/dashboard/internado-fdtc/participantes', icon: Users },
                    { title: 'Periodos', href: '/dashboard/internado-fdtc/periodos', icon: Calendar },
                ] : []),
                ...(hasPermission('internado:evaluaciones:view') ? [
                    { title: 'Evaluaciones', href: '/dashboard/internado-fdtc/evaluaciones', icon: FileCheck },
                ] : []),
                ...(hasPermission('internado:asistencias:view') ? [
                    { title: 'Asistencias', href: '/dashboard/internado-fdtc/asistencias', icon: UserCheck },
                    { title: 'Reporte Asistencias', href: '/dashboard/internado-fdtc/asistencias/reporte', icon: FileBarChart },
                ] : []),
                ...(hasPermission('internado:conductas:view') ? [
                    { title: 'Conductas', href: '/dashboard/internado-fdtc/conductas', icon: ClipboardCheck },
                    { title: 'Reporte Conductas', href: '/dashboard/internado-fdtc/conductas/reporte', icon: FileBarChart },
                ] : []),
            ],
        }] : []),
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
