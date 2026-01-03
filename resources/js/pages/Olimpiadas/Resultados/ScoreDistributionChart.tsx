import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Resultado } from '@/types';

interface ScoreDistributionChartProps {
    data: Resultado[];
    maxScore: number;
}

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ data, maxScore }) => {
    const scoreDistribution = React.useMemo(() => {
        if (!data || data.length === 0 || !maxScore) return [];

        const bins = 10;
        const binSize = maxScore / bins;
        const distribution = Array(bins).fill(0).map((_, i) => ({
            range: `${(i * binSize).toFixed(0)}-${((i + 1) * binSize).toFixed(0)}`,
            count: 0,
        }));

        data.forEach(result => {
            const binIndex = Math.min(Math.floor(result.total_score / binSize), bins - 1);
            distribution[binIndex].count++;
        });

        return distribution;
    }, [data, maxScore]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Número de Estudiantes" />
            </BarChart>
        </ResponsiveContainer>
    );
};