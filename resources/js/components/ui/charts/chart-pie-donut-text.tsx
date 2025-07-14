import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartDataItem {
    name: string
    value: number
    fill?: string
}

interface DonutChartProps {
    data: ChartDataItem[]
    title: string
    description?: string
    centerLabel?: string
    footerText?: string
    className?: string
    innerRadius?: number
    strokeWidth?: number
    maxHeight?: number
    colors?: string[]
}

const DEFAULT_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
]

export function DonutChart({
    data,
    title,
    description,
    centerLabel = "Total",
    footerText,
    className = "",
    innerRadius = 60,
    strokeWidth = 5,
    maxHeight = 250,
    colors = DEFAULT_COLORS,
}: DonutChartProps) {
    const chartData = React.useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            fill: item.fill || colors[index % colors.length],
        }))
    }, [data, colors])

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            value: {
                label: centerLabel,
            },
        }

        chartData.forEach((item, index) => {
            config[item.name] = {
                label: item.name,
                color: colors[index % colors.length],
            }
        })

        return config
    }, [chartData, colors, centerLabel])

    const totalValue = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.value, 0)
    }, [chartData])

    return (
        <Card className={`flex flex-col ${className}`}>
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 pb-0 flex items-center justify-center">
                <div className="w-full max-w-sm">
                    <ChartContainer
                        config={chartConfig}
                        className={`mx-auto aspect-square max-h-[${maxHeight}px]`}
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={innerRadius}
                                strokeWidth={strokeWidth}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalValue.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground"
                                                    >
                                                        {centerLabel}
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                            <ChartLegend
                                content={<ChartLegendContent nameKey="name" />}
                                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                            />
                        </PieChart>
                    </ChartContainer>
                </div>
            </CardContent>
            {(footerText) && (
                <CardFooter className="flex-col gap-2 text-sm">
                    {footerText && (
                        <div className="flex items-center gap-2 leading-none font-medium">
                            {footerText}
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}
