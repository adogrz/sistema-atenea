import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Brain,
    Calendar,
    CalendarDays,
    ClipboardCheck,
    ClipboardListIcon,
    FileBarChart,
    FileCheck,
    FileHeart,
    GraduationCap,
    GraduationCapIcon,
    HouseIcon,
    LayoutDashboard,
    School,
    ShieldCheck,
    Stethoscope,
    Trophy,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';

import AppLogo from './app-logo';

export function AppSidebar() {
    const { hasPermission, hasRole } = usePermissions();
    const { url } = usePage();

    const isItemActive = (href: string | undefined) => {
        if (!href) return false;

        // Normalizar la URL removiendo el dominio si existe
        const normalizedHref = href.startsWith('http') ? new URL(href).pathname : href;

        const normalizedUrl = url.startsWith('http') ? new URL(url, window.location.origin).pathname : url;

        if (normalizedHref === '/' || normalizedHref === '/dashboard') {
            return normalizedUrl === normalizedHref;
        }

        return normalizedUrl.startsWith(normalizedHref);
    };

    const navStructure: NavItem[] = [
        { title: 'Inicio', href: '/dashboard', icon: HouseIcon },
        ...buildClinicalRecordsNav(),
        ...buildAdministrationNav(),
        ...buildAcademicNav(),
        ...buildOlimpiadasNav(),
        ...buildInternshipNav(),
        ...buildStudentNav(),
    ].filter((item) => !item.items || item.items.length > 0);

    function buildClinicalRecordsNav(): NavItem[] {
        if (!hasPermission('clinical-records:view-module')) return [];

        const canManageMedical = hasPermission('assignments:manage-medical');
        const canManagePsychological = hasPermission('assignments:manage-psychological');

        const items: NavItem[] = [];

        if (canManageMedical) {
            items.push({
                icon: Stethoscope,
                href: '/dashboard/clinical-records/medical-records',
                title: 'Expedientes Médicos',
            });
        }

        if (canManagePsychological) {
            items.push({
                icon: Brain,
                href: '/dashboard/clinical-records/psychological-records',
                title: 'Expedientes Psicológicos',
            });
        }

        items.push({
            icon: Users,
            href: '/dashboard/clinical-records/assignments',
            title: canManageMedical || canManagePsychological ? 'Asignaciones' : 'Mis Estudiantes',
        });

        return items.length > 0
            ? [
                  {
                      title: 'Expediente Clínico',
                      icon: FileHeart,
                      items,
                  },
              ]
            : [];
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
                ],
            },
        ];
    }

    function buildOlimpiadasNav(): NavItem[] {
        // Si no tiene ningún permiso relevante, no mostramos nada
        const canView =
            hasPermission('olimpiadas:list') ||
            hasPermission('resultados:view') ||
            hasPermission('academic:view') ||
            hasRole('calificador') ||
            hasPermission('calificadores:assign') ||
            hasPermission('definiciones-evaluacion:list') ||
            hasPermission('grupos:list');

        if (!canView) return [];

        const items = [];

        if (hasPermission('olimpiadas:list')) {
            items.push(
                { title: 'Olimpiadas y Fases', href: '/dashboard/olimpiadas', icon: GraduationCap },
                { title: 'Inscripciones', href: '/dashboard/inscripciones', icon: LayoutDashboard },
            );
        }

        if (hasPermission('resultados:view')) {
            items.push({ title: 'Resultados', href: '/dashboard/resultados', icon: Trophy });
        }

        if (hasPermission('academic:view')) {
            items.push({ title: 'Centro de Control', href: '/dashboard/area', icon: LayoutDashboard });
        }

        if (hasRole('calificador')) {
            items.push({ title: 'Dashboard de Calificador', href: '/dashboard/calificaciones/olimpiadas', icon: ClipboardListIcon });
        }

        if (hasPermission('calificadores:assign')) {
            items.push({ title: 'Asignación de Evaluadores', href: '/dashboard/gestion-evaluacion', icon: ShieldCheck });
        }

        if (hasPermission('definiciones-evaluacion:list')) {
            items.push({ title: 'Definiciones de Evaluación', href: '/dashboard/definiciones-evaluacion', icon: ClipboardListIcon });
        }

        if (hasPermission('grupos:list')) {
            items.push({ title: 'Gestión de Grupos', href: '/dashboard/grupos', icon: Users });
        }

        return [
            {
                title: 'Olimpiadas',
                icon: Trophy,
                items,
            },
        ];
    }

    function buildInternshipNav(): NavItem[] {
        const canViewModule = hasPermission('internado:view') || hasPermission('internado:admin:view') || hasPermission('internado:asistencias:view');

        if (!canViewModule) return [];

        const items: NavItem[] = [
            ...(hasPermission('internado:admin:view')
                ? [
                      { title: 'Selección FDTC', href: '/dashboard/internado-fdtc/seleccion', icon: UserPlus },
                      { title: 'Participantes', href: '/dashboard/internado-fdtc/participantes', icon: Users },
                      { title: 'Periodos', href: '/dashboard/internado-fdtc/periodos', icon: Calendar },
                  ]
                : []),
            ...(hasPermission('internado:evaluaciones:view')
                ? [{ title: 'Evaluaciones', href: '/dashboard/internado-fdtc/evaluaciones', icon: FileCheck }]
                : []),
            ...(hasPermission('internado:asistencias:view')
                ? [
                      { title: 'Asistencias', href: '/dashboard/internado-fdtc/asistencias', icon: UserCheck },
                      { title: 'Reporte Asistencias', href: '/dashboard/internado-fdtc/asistencias/reporte', icon: FileBarChart },
                  ]
                : []),
            ...(hasPermission('internado:conductas:view')
                ? [
                      { title: 'Conductas', href: '/dashboard/internado-fdtc/conductas', icon: ClipboardCheck },
                      { title: 'Reporte Conductas', href: '/dashboard/internado-fdtc/conductas/reporte', icon: FileBarChart },
                  ]
                : []),
        ];

        return items.length > 0 ? [{ title: 'FDTC', icon: ShieldCheck, items }] : [];
    }

    function buildStudentNav(): NavItem[] {
        // Solo mostrar este grupo si el usuario SOLO tiene permisos de estudiante
        // y NO tiene permisos administrativos o académicos
        const hasAdminPermissions =
            hasPermission('academic:view') || hasPermission('olimpiadas:list') || hasPermission('academic:manage') || hasPermission('users:list');

        if (!hasPermission('profile:view') || hasAdminPermissions) return [];

        return [
            {
                title: 'Estudiante',
                icon: GraduationCapIcon,
                items: [
                    { title: 'Inscripciones', href: '/dashboard/inscripciones', icon: LayoutDashboard },
                    { title: 'Calendario', href: '/dashboard/calendario', icon: Calendar },
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
