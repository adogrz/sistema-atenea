import { useForm } from '@inertiajs/react';

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    area_academica: '',
    activa: true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(route('olimpiadas.store'));
  }

  return (
    <div>
      <h1>Crear Olimpiada</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" value={data.nombre} onChange={e => setData('nombre', e.target.value)} placeholder="Nombre" />
        {errors.nombre && <div>{errors.nombre}</div>}

        <textarea value={data.descripcion} onChange={e => setData('descripcion', e.target.value)} placeholder="Descripción" />
        {errors.descripcion && <div>{errors.descripcion}</div>}

        <input type="date" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} />
        {errors.fecha_inicio && <div>{errors.fecha_inicio}</div>}

        <input type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} />
        {errors.fecha_fin && <div>{errors.fecha_fin}</div>}

        <input type="text" value={data.area_academica} onChange={e => setData('area_academica', e.target.value)} placeholder="Área académica" />
        {errors.area_academica && <div>{errors.area_academica}</div>}

        <label>
          <input type="checkbox" checked={data.activa} onChange={e => setData('activa', e.target.checked)} />
          Activa
        </label>

        <button type="submit" disabled={processing}>Guardar</button>
      </form>
    </div>
  );
}