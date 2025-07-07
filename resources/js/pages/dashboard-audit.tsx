import LogDataTable from '@/components/log-data-table';
import { usePermissions } from '@/hooks/use-permissions';
import { Head, usePage } from '@inertiajs/react';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, Sector } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Auditoría de Usuarios',
        href: '/dashboard/audit',
    },
];

const userStatusChartData = [{ current: 'Usuarios', enabled: 186, disabled: 100 }];

const userStatusChartConfig = {
    enabled: {
        label: 'Habilitados',
        color: '#063970',
    },
    disabled: {
        label: 'Deshabilitados',
        color: '#1e81b0',
    },
} satisfies ChartConfig;

const userRolChartData = [
    { current: 'Administrador', quantity: 10, fill: 'var(--color-admin)' },
    { current: 'Usuario', quantity: 50, fill: 'var(--color-user)' },
    { current: 'Invitado', quantity: 20, fill: 'var(--color-guest)' },
];

const userRolChartConfig = {
    admin: {
        label: 'Administradores',
        color: '#063970',
    },
    user: {
        label: 'Usuarios',
        color: '#1e81b0',
    },
    guest: {
        label: 'Invitados',
        color: '#f97316',
    },
} satisfies ChartConfig;

const userSeatChartData = [
    { current: 'central', quantity: 60, fill: 'var(--color-central)' },
    { current: 'occidental', quantity: 25, fill: 'var(--color-occidental)' },
    { current: 'oriental', quantity: 15, fill: 'var(--color-oriental)' },
];

const userSeatChartConfig = {
    central: {
        label: 'Central',
        color: '#063970',
    },
    occidental: {
        label: 'Occidental',
        color: '#1e81b0',
    },
    oriental: {
        label: 'Oriental',
        color: '#f97316',
    },
    other: {
        label: 'Otros',
        color: '#e2e8f0',
    },
} satisfies ChartConfig;

export function ChartBarStacked() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Usuarios</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center pb-0">
                <ChartContainer config={userStatusChartConfig} className="mx-auto w-full">
                    <BarChart accessibilityLayer data={userStatusChartData} barSize={100}>
                        <CartesianGrid vertical={false} />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="enabled" stackId="a" fill="var(--color-enabled)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="disabled" stackId="a" fill="var(--color-disabled)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function ChartPieInteractive() {
    const id = 'pie-interactive';
    const [activeRole, setActiveRole] = React.useState(userRolChartData[0].current);
    const activeIndex = React.useMemo(() => userRolChartData.findIndex((item) => item.current === activeRole), [activeRole]);
    const roles = React.useMemo(() => userRolChartData.map((item) => item.current), []);

    return (
        <Card data-chart={id} className="flex flex-col">
            <ChartStyle id={id} config={userRolChartConfig} />
            <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                    <CardTitle>Distribución de Roles</CardTitle>
                    <CardDescription>Usuarios por tipo de rol</CardDescription>
                </div>
                <Select value={activeRole} onValueChange={setActiveRole}>
                    <SelectTrigger className="ml-auto h-7 w-[130px] rounded-lg pl-2.5" aria-label="Seleccionar rol">
                        <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {roles.map((role) => {
                            const configKey = role === 'Administrador' ? 'admin' : role === 'Usuario' ? 'user' : 'guest';
                            const config = userRolChartConfig[configKey];

                            return (
                                <SelectItem key={role} value={role} className="rounded-lg [&_span]:flex">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className="flex h-3 w-3 shrink-0 rounded-xs"
                                            style={{
                                                backgroundColor: config.color,
                                            }}
                                        />
                                        {role}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer id={id} config={userRolChartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={userRolChartData}
                            dataKey="quantity"
                            nameKey="current"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={activeIndex}
                            activeShape={({ outerRadius = 0, ...props }) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                    <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                                </g>
                            )}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                    {userRolChartData[activeIndex].quantity.toLocaleString()}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                    Usuarios
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function ChartPieLabel() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Usuarios por sede</CardTitle>
                <CardDescription>Distribución de usuarios por sede</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center pb-0">
                <ChartContainer
                    config={userSeatChartConfig}
                    className="mx-auto aspect-square w-full max-w-[300px] [&_.recharts-pie-label-text]:fill-foreground"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={userSeatChartData} dataKey="quantity" label nameKey="current" />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const { logs } = usePage<{ logs: any[] }>().props;
    const { hasPermission } = usePermissions();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {hasPermission('audit-view') && (
                    <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl border p-4">
                        <h2 className="text-2xl font-bold">Logs de Actividad</h2>
                        <LogDataTable logs={logs} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
