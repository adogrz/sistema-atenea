import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types/SharedData';
import { TrendingUp } from 'lucide-react';
import * as React from "react";
import { ViewBox } from 'recharts/types/util/types';

type PolarViewBox = {
  cx: number;
  cy: number;
};

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Pie,
  PieChart,
  Sector
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartStyle
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Panel de Auditoría',
    href: '/dashboard',
  },
];

// Datos para gráficos
const radialChartData = [{ browser: "safari", visitors: 100000, fill: "var(--color-safari)" }];
const barChartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];
const pieChartData = [
  { month: "january", desktop: 186, fill: "var(--color-january)" },
  { month: "february", desktop: 305, fill: "var(--color-february)" },
  { month: "march", desktop: 237, fill: "var(--color-march)" },
  { month: "april", desktop: 173, fill: "var(--color-april)" },
  { month: "may", desktop: 209, fill: "var(--color-may)" },
];

// Configuraciones
const radialChartConfig = {
  visitors: { label: "Visitors" },
  safari: { label: "Safari", color: "var(--chart-1)" },
} satisfies ChartConfig;

const barChartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig;

const pieChartConfig = {
  visitors: { label: "Visitors" },
  desktop: { label: "Desktop" },
  mobile: { label: "Mobile" },
  january: { label: "January", color: "var(--chart-1)" },
  february: { label: "February", color: "var(--chart-2)" },
  march: { label: "March", color: "var(--chart-3)" },
  april: { label: "April", color: "var(--chart-4)" },
  may: { label: "May", color: "var(--chart-5)" },
} satisfies ChartConfig;

// Componentes de gráficos
function ChartRadialText() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Usuarios Totales</CardTitle>
        <CardDescription>Registros acumulados</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={radialChartConfig} className="mx-auto aspect-square max-h-[250px]">
          <RadialBarChart data={radialChartData} startAngle={0} endAngle={250} innerRadius={80} outerRadius={110}>
            <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted last:fill-background" polarRadius={[86, 74]} />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as PolarViewBox;
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={cx} y={cy} className="fill-foreground text-4xl font-bold">
                        {radialChartData[0].visitors.toLocaleString()}
                      </tspan>
                      <tspan x={cx} y={cy + 24} className="fill-muted-foreground">
                        Usuarios
                      </tspan>
                    </text>
                  );
                }}

              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          +5.2% este mes <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}

function ChartBarHorizontal() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Visitas Mensuales</CardTitle>
        <CardDescription>Enero - Junio 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={barChartConfig}>
          <BarChart accessibilityLayer data={barChartData} layout="vertical" height={300} margin={{ left: -20 }}>
            <XAxis type="number" dataKey="desktop" hide />
            <YAxis dataKey="month" type="category" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={value => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="desktop" fill="var(--chart-1)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          +8.1% vs mes anterior <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}

function ChartPieInteractive() {
  const id = "pie-interactive";
  const [activeMonth, setActiveMonth] = React.useState(pieChartData[0].month);
  const activeIndex = pieChartData.findIndex(item => item.month === activeMonth);

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={pieChartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Cambios de Rol</CardTitle>
          <CardDescription>Enero - Mayo 2024</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger className="ml-auto h-7 w-[130px] rounded-lg pl-2.5" aria-label="Seleccionar mes">
            <SelectValue placeholder="Seleccionar mes" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {pieChartData.map(({ month }) => (
              <SelectItem key={month} value={month} className="rounded-lg [&_span]:flex">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-3 w-3 shrink-0 rounded-xs" style={{ backgroundColor: `var(--color-${month})` }} />
                  {pieChartConfig[month as keyof typeof pieChartConfig]?.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer id={id} config={pieChartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={pieChartData}
              dataKey="desktop"
              nameKey="month"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as PolarViewBox;
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={cx} y={cy} className="fill-foreground text-3xl font-bold">
                        {pieChartData[activeIndex].desktop.toLocaleString()}
                      </tspan>
                      <tspan x={cx} y={cy + 24} className="fill-muted-foreground">
                        Cambios
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { auth } = usePage<SharedData>().props;
  const userRole = auth.user?.roles || 'Usuario';

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Dashboard - ${userRole}`} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">

        {/* Primera fila: 3 gráficos principales */}
        <div className="grid auto-rows-fr gap-4 md:grid-cols-3">
          <ChartRadialText />
          <ChartBarHorizontal />
          <ChartPieInteractive />
        </div>

        {/* Segunda fila: Espacio para más contenido */}
        <div className="relative min-h-[50vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
        </div>
      </div>
    </AppLayout>
  );
}