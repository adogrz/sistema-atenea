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

interface CustomizedCategoryLabelProps {
    x?: string | number;
    y?: string | number;
    width?: string | number;
    height?: string | number;
    value?: string | number;
    offset?: number;
    fill?: string;
}

const CustomizedCategoryLabel = (props: CustomizedCategoryLabelProps) => {
    const { x, y, width, height, value, offset, fill } = props;

    const xNum = typeof x === 'string' ? parseFloat(x) : x || 0;
    const yNum = typeof y === 'string' ? parseFloat(y) : y || 0;
    const widthNum = typeof width === 'string' ? parseFloat(width) : width || 0;
    const heightNum = typeof height === 'string' ? parseFloat(height) : height || 0;

    if (value === undefined) {
        return null;
    }

    const valueStr = String(value);

    const charWidth = 7;
    const availableWidth = widthNum - (offset || 0) - 8;

    // Si la barra es demasiado estrecha no mostramos la etiqueta
    if (availableWidth < 20) { 
        return null;
    }

    const maxChars = Math.floor(availableWidth / charWidth);

    let label = valueStr;
    if (valueStr.length > maxChars) {
        label = `${valueStr.substring(0, maxChars)}...`;
    }

    return (
        <text
            x={xNum + (offset || 0)}
            y={yNum + heightNum / 2}
            dy={4}
            fontSize={12}
            fill={fill}
            textAnchor="start"
        >
            {label}
        </text>
    );
};


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
                                    content={(props) => <CustomizedCategoryLabel {...props} fill={categoryLabelColor} />}
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
