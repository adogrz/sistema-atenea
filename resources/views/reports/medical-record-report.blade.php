<!DOCTYPE html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Historial Médico</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1f2937; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 5px 0 0; font-size: 20px; text-transform: uppercase; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table th, .info-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        .section-title { background-color: #f3f4f6; padding: 6px 10px; font-weight: bold; margin-top: 15px; }
        .consultation { border: 1px solid #e5e7eb; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
        .meta { font-size: 11px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
    <img src="{{ public_path('app-logo.svg') }}" alt="Logo Sistema Atenea" width="90">
        <h1>Historial Médico Confidencial</h1>
        <p class="meta">Generado el {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <table class="info-table">
        <tr>
            <th>Estudiante</th>
            <td>{{ $student?->user?->name ?? 'N/A' }}</td>
            <th>NIE</th>
            <td>{{ $student?->nie ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Edad</th>
            <td>
                @if ($student?->fecha_nacimiento)
                    {{ $student->fecha_nacimiento->age }} años
                @else
                    N/A
                @endif
            </td>
            <th>Profesional Responsable</th>
            <td>{{ $record->creator?->name ?? 'No asignado' }}</td>
        </tr>
    </table>

    <div class="section-title">Antecedentes Médicos</div>
    <p>{{ $record->general_background ?? 'No registrados' }}</p>

    <div class="section-title">Consultas Médicas</div>
    @forelse ($consultations as $consulta)
        <div class="consultation">
            <strong>Fecha:</strong> {{ optional($consulta->consultation_date)->format('d/m/Y') ?? 'N/A' }}<br>
            <strong>Médico:</strong> {{ $consulta->doctor?->name ?? 'N/A' }}<br>
            <strong>Diagnóstico:</strong> {{ $consulta->diagnosis ?? 'Sin diagnóstico' }}<br>
            <strong>Tratamiento:</strong> {{ $consulta->treatment ?? 'No especificado' }}<br>
            @if(!empty($consulta->observations))
                <strong>Observaciones:</strong> {{ $consulta->observations }}<br>
            @endif
            @if($consulta->consentForm)
                <strong>Consentimiento:</strong> Firmado por {{ $consulta->consentForm->responsible?->nombres_responsable }}
            @endif
        </div>
    @empty
        <p>No hay consultas registradas.</p>
    @endforelse
</body>
</html>
