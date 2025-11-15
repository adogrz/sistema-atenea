import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

import { BookOpen, Calendar, ClipboardListIcon, Clock, GraduationCap, HouseIcon, LayoutDashboard, ShieldCheck, Users, School, CalendarDays, GraduationCapIcon, Trophy, Award} from 'lucide-react';

import AppLogo from './app-logo';

export function AppSidebar() {
    const { hasPermission, hasRole } = usePermissions();
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
                ...(hasPermission('centros-educativos:import') ? [{ title: 'Importar Centros Educativos', href: route('centros.create'), icon: School }] : []),
            ],
        },
        {
            title: 'Olimpiadas',
            icon: Trophy,
            items: [
                ...(hasPermission('olimpiadas:list') ? [{ title: 'Olimpiadas y Fases', href: route('olimpiadas.index'), icon: GraduationCap }] : []),
                ...(hasPermission('olimpiadas:list') ? [{ title: 'Inscripciones', href: '/dashboard/inscripciones', icon: LayoutDashboard }] : []), // Moved from Estudiante
                ...(hasPermission('resultados:view') ? [{ title: 'Resultados', href: route('resultados.index'), icon: Trophy }] : []),
                // { title: 'Gestión de Resultados', href: route('resultados.management'), icon: ClipboardListIcon }, // Commented out
                ...(hasPermission('academic:view') ? [{ title: 'Centro de Control', href: route('area.dashboard'), icon: LayoutDashboard }] : []),
                ...(hasRole('calificador') ? [{ title: 'Dashboard de Calificador', href: route('calificaciones.olimpiadas.index'), icon: ClipboardListIcon }] : []),
                ...(hasPermission('calificadores:assign') ? [{ title: 'Asignación de Evaluadores', href: route('gestion-evaluacion.index'), icon: ShieldCheck }] : []),
                ...(hasPermission('definiciones-evaluacion:list') ? [{ title: 'Definiciones de Evaluación', href: route('definiciones-evaluacion.index'), icon: ClipboardListIcon }] : []),
                ...(hasPermission('grupos:list') ? [{ title: 'Gestión de Grupos', href: route('grupos.index'), icon: Users }] : []),
                ...(hasPermission('academic:manage') ? [{ title: 'Aprobación Académica', href: route('aprobacion-academica.index'), icon: Award }] : []),
            ],
        },
        ...(hasPermission('academic:view') ? [{
            title: 'Académico',
            icon: School,
            items: [
                ...(hasPermission('academic:view') ? [{ title: 'Panel Académico', href: '/dashboard/academico', icon: LayoutDashboard }] : []),
                // Calendario moved to top-level Eventos
                ...(hasPermission('users:list') ? [{ title: 'Datos Aspirantes', href: '/dashboard/academico/aspirantes', icon: Clock }] : []),
                ...(hasPermission('users:list') ? [{ title: 'Estudiantes', href: '/dashboard/academico/estudiantes', icon: Users }] : []),
                ...(hasPermission('academic:view') ? [{ title: 'Academia Sabatina', href: '/dashboard/academico/sabatina', icon: BookOpen }] : []),
                ...(hasPermission('academic:view') ? [{ title: 'FDTC', href: '/dashboard/academico/fdtc', icon: GraduationCap }] : []),
            ],
        }] : []),
        ...(hasPermission('events:view') ? [{ // New top-level Eventos category
            title: 'Eventos',
            icon: CalendarDays,
            items: [
                { title: 'Calendario', href: '/dashboard/calendario', icon: CalendarDays },
            ],
        }] : []),
        // Estudiante category suppressed
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
