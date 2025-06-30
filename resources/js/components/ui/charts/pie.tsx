import { useState } from "react";
import { ResponsivePie, PieTooltipProps } from "@nivo/pie";
import { schemeCategory10 } from "d3-scale-chromatic";

interface PieChartProps {
  data: Array<{
    id: string;
    label: string;
    value: number;
    color?: string;
  }>;
}

const CustomTooltip = ({ datum, data }: PieTooltipProps<any> & { data: PieChartProps["data"] }) => {
  const total = data.reduce((sum: number, d: any) => sum + d.value, 0);
  const percent = ((datum.value / total) * 100).toFixed(1);

  return (
    <div className="px-3 py-2 rounded-lg text-sm shadow-lg border border-gray-200 bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700">
      <strong>{datum.label}</strong>: {datum.value} ({percent}%)
    </div>
  );
};

function getColor(index: number, data: PieChartProps["data"]) {
  return data[index].color || schemeCategory10[index % schemeCategory10.length];
}

function SummaryTable({ data, onClose }: { data: PieChartProps["data"]; onClose: () => void }) {
  return (
    <>
      {/* Fondo semitransparente */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 dark:bg-black/50 z-50"
      />
      {/* Contenido centrado */}
      <div
        className="fixed top-1/2 left-1/2 z-50 min-w-[260px] p-5 rounded-xl border bg-white text-gray-900 shadow-xl dark:bg-gray-800 dark:text-white dark:border-gray-700"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold">Resumen</span>
          <button
            onClick={onClose}
            className="text-lg hover:text-red-500"
            title="Cerrar"
          >
            ×
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left pb-1">Categoría</th>
              <th className="text-right pb-1">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.id}>
                <td className="py-1 flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full border border-gray-300"
                    style={{ background: getColor(i, data) }}
                  />
                  {d.label}
                </td>
                <td className="py-1 text-right">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function PieChart({ data }: PieChartProps) {
  const [showTable, setShowTable] = useState(false);
  const [showArcLinks, setShowArcLinks] = useState(false); // Nuevo estado

  // Generar colores sincronizados para el gráfico y la leyenda
  const coloredData = data.map((d, i) => ({
    ...d,
    color: getColor(i, data),
  }));

  // Detectar tema (claro/oscuro) usando Tailwind (opcional: puedes usar un hook/contexto si tienes uno)
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="w-full h-full relative">
       {/* Checkbox para activar/desactivar arc links */}
      <label className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 text-xs shadow cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showArcLinks}
          onChange={() => setShowArcLinks((v) => !v)}
          className="accent-blue-500"
        /> Enlaces
      </label>
      <ResponsivePie
        data={coloredData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        innerRadius={0.5}
        padAngle={1.5}
        cornerRadius={1}
        activeOuterRadiusOffset={8}
        colors={coloredData.map(d => d.color)}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={isDark ? "#fff" : "#333"}
        enableArcLinkLabels={showArcLinks}
        arcLinkLabelsSkipAngle={20}
        arcLinkLabelsTextColor={isDark ? "#fff" : "#333"}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        tooltip={props => <CustomTooltip {...props} data={coloredData} />}
        legends={[
          {
            itemTextColor: isDark ? "#fff" : "#333",
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateY: 24,
            itemWidth: 80,
            itemHeight: 18,
            itemsSpacing: 4,
            symbolSize: 14,
            symbolShape: "circle",
            data: coloredData.slice(0, 3).map((d) => ({
              id: d.id,
              label: d.label,
              color: d.color,
            })),
          },
        ]}
      />
      <div className="absolute bottom-6 right-6">
        <button
          onClick={() => setShowTable((v) => !v)}
          className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 shadow flex items-center gap-2"
          title="Mostrar resumen"
        >
          {/* Icono tabla */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.15"/>
            <rect x="7" y="7" width="3" height="3" fill="currentColor" />
            <rect x="14" y="7" width="3" height="3" fill="currentColor" />
            <rect x="7" y="14" width="3" height="3" fill="currentColor" />
            <rect x="14" y="14" width="3" height="3" fill="currentColor" />
          </svg>
        </button>
        {showTable && (
          <SummaryTable data={coloredData} onClose={() => setShowTable(false)} />
        )}
      </div>
    </div>
  );
}