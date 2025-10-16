import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

import {
    BookOpen,
    Brain,
    Calendar,
    CalendarDays,
    ClipboardListIcon,
    Clock,
    GraduationCap,
    GraduationCapIcon,
    HouseIcon,
    LayoutDashboard,
    School,
    ShieldCheck,
    Stethoscope,
    Users,
} from 'lucide-react';

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
        ...buildClinicalRecordsNav(),
        ...buildAdministrationNav(),
        ...buildAcademicNav(),
        ...buildStudentNav(),
    ].filter((item) => !item.items || item.items.length > 0);

    function buildClinicalRecordsNav(): NavItem[] {
        if (!hasPermission('clinical-records:view-module')) return [];

        const canManage = hasPermission('assignments:manage-medical') || hasPermission('assignments:manage-psychological');
        const isMedical = hasPermission('assignments:view-medical');

        return [
            {
                title: isMedical ? 'Expedientes Medicos' : 'Expe. Psicológicos',
                icon: isMedical ? Stethoscope : Brain,
                items: [
                    {
                        icon: Users,
                        href: '/dashboard/clinical-records/assignments',
                        title: canManage ? 'Asignaciones' : 'Mis Estudiantes',
                    },
                ],
            },
        ];
    }

    function buildAdministrationNav(): NavItem[] {
        const items = [
            hasPermission('users:list') && { title: 'Usuarios', href: '/dashboard/users', icon: Users },
            hasPermission('audit:view') && { title: 'Auditoría', href: '/dashboard/audit', icon: ClipboardListIcon },
        ].filter(Boolean) as NavItem[];

        return items.length > 0 ? [{ title: 'Administración', icon: ShieldCheck, items }] : [];
    }

    function buildAcademicNav(): NavItem[] {
        if (!hasPermission('academic:view')) return [];

        return [
            {
                title: 'Académico',
                icon: School,
                items: [
                    { title: 'Panel Académico', href: '/dashboard/academico', icon: LayoutDashboard },
                    { title: 'Calendario', href: '/dashboard/calendario', icon: CalendarDays },
                    { title: 'Datos Aspirantes', href: '/dashboard/academico/aspirantes', icon: Clock },
                    { title: 'Estudiantes', href: '/dashboard/academico/estudiantes', icon: Users },
                    { title: 'Academia Sabatina', href: '/dashboard/academico/sabatina', icon: BookOpen },
                    { title: 'FDTC', href: '/dashboard/academico/fdtc', icon: GraduationCap },
                ],
            },
        ];
    }

    function buildStudentNav(): NavItem[] {
        if (!hasPermission('profile:view')) return [];

        return [
            {
                title: 'Estudiante',
                icon: GraduationCapIcon,
                items: [
                    { title: 'Inscripciones', href: '/dashboard/inscripciones', icon: LayoutDashboard },
                    { title: 'Calendario', href: '/dashboard/calendario', icon: Calendar },
                    { title: 'FDTC', href: '/dashboard/academico/fdtc', icon: GraduationCap },
                ],
            },
        ];
    }

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
