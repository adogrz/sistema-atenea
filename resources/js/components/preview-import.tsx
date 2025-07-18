import { router } from '@inertiajs/react';
import PropTypes from 'prop-types'; // Si usas JS, esto ayuda con tipado ligero

export default function PreviewImport({ preview, archivoTemp }: any) {
  const confirmImport = () => {
    router.post('/centros-educativos/importar-final', { archivoTemp });
  };

  if (!preview || preview.length === 0) {
    return <p className="text-red-600">No hay datos para mostrar.</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Previsualización de Importación</h2>

      <div className="overflow-auto border rounded">
        <table className="table-auto w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {Object.keys(preview[0]).map((key) => (
                <th key={key} className="px-2 py-1 border text-left">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {Object.entries(row).map(([key, value]) => {
                  const isEmpty = value === '' || value == null;
                  const isInvalid =
                    key === 'sector' && !['PÚBLICO', 'PRIVADO'].includes(value) ||
                    key === 'zona' && !['Urbana', 'Rural'].includes(value) ||
                    key === 'internacional' && !['SI', 'NO'].includes(value);

                  return (
                    <td
                      key={key}
                      className={`px-2 py-1 border ${
                        isEmpty ? 'bg-yellow-50 text-red-600' :
                        isInvalid ? 'bg-red-100 text-red-700' : ''
                      }`}
                    >
                      {value || '–'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={confirmImport}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Confirmar Importación
      </button>
    </div>
  );
}

PreviewImport.propTypes = {
  preview: PropTypes.arrayOf(PropTypes.object).isRequired,
  archivoTemp: PropTypes.string.isRequired,
};