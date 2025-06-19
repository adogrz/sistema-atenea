export default function GestionUsuariosCard() {
  return (
    <div className="bg-white shadow p-6 rounded-xl border">
      <h2 className="text-xl font-semibold mb-2">Gestión de Usuarios</h2>
      <p className="text-gray-600 mb-4">Accede a la administración de usuarios registrados en el sistema.</p>
      <a
        href="/usuarios"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Ver usuarios
      </a>
    </div>
  );
}
