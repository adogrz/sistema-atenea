import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
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
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartDataItem {
    category: string
    value: number
}

interface BarChartCustomLabelProps {
    data: ChartDataItem[]
    title: string
    description?: string
    dataLabel?: string
    barColor?: string
    showCategoryLabels?: boolean
    showValueLabels?: boolean
    categoryLabelColor?: string
    valueLabelColor?: string
    footerText?: string
    className?: string
    height?: number
    barRadius?: number
}

export function BarChartCustomLabel({
    data,
    title,
    description,
    dataLabel = "Value",
    barColor = "var(--chart-1)",
    showCategoryLabels = true,
    showValueLabels = true,
    categoryLabelColor = "var(--background)",
    valueLabelColor = "var(--foreground)",
    footerText,
    className = "",
    height = 350,
    barRadius = 4,
}: BarChartCustomLabelProps) {
    const chartConfig: ChartConfig = {
        value: {
            label: dataLabel,
            color: barColor,
        },
        label: {
            color: "var(--background)",
        },
    }

    return (
        <Card className={`flex flex-col ${className}`}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1">
                <ChartContainer config={chartConfig} className={`h-[${height}px]`}>
                    <BarChart
                        accessibilityLayer
                        data={data}
                        layout="vertical"
                        margin={{
                            right: 16,
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="category"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            hide
                        />
                        <XAxis
                            dataKey="value"
                            type="number"
                            hide
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="value"
                            layout="vertical"
                            fill={barColor}
                            radius={barRadius}
                        >
                            {showCategoryLabels && (
                                <LabelList
                                    dataKey="category"
                                    position="insideLeft"
                                    offset={8}
                                    className="fill-[--color-label]"
                                    fontSize={12}
                                    style={{ fill: categoryLabelColor }}
                                />
                            )}
                            {showValueLabels && (
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    offset={8}
                                    className="fill-foreground"
                                    fontSize={12}
                                    style={{ fill: valueLabelColor }}
                                />
                            )}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {(footerText) && (
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    {footerText && (
                        <div className="text-muted-foreground leading-none">
                            {footerText}
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}
