import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
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

interface BarChartLabelProps {
    data: ChartDataItem[]
    title: string
    description?: string
    dataLabel?: string
    barColor?: string
    showLabels?: boolean
    showGrid?: boolean
    labelPosition?: "top" | "bottom" | "inside" | "insideTop" | "insideBottom"
    labelColor?: string
    categoryLabelTruncate?: number
    footerText?: string
    className?: string
    barRadius?: number
}

export function BarChartLabel({
    data,
    title,
    description,
    dataLabel = "Value",
    barColor = "var(--chart-1)",
    showLabels = true,
    showGrid = true,
    labelPosition = "top",
    labelColor = "var(--foreground)",
    categoryLabelTruncate = 3,
    footerText,
    className = "",
    barRadius = 8,
}: BarChartLabelProps) {
    const chartConfig: ChartConfig = {
        value: {
            label: dataLabel,
            color: barColor,
        },
    }

    return (
        <Card className={`flex flex-1 flex-col ${className}`}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 20,
                        }}
                    >
                        {showGrid && <CartesianGrid vertical={false} />}
                        <XAxis
                            dataKey="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) =>
                                categoryLabelTruncate > 0 ? value.slice(0, categoryLabelTruncate) : value
                            }
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="value" fill={barColor} radius={barRadius}>
                            {showLabels && (
                                <LabelList
                                    position={labelPosition}
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                    style={{ fill: labelColor }}
                                />
                            )}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {footerText && (
                <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 leading-none font-medium">
                        {footerText}
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}
