<?php

namespace App\Rules;

use App\Services\ProgresoFasesService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class FasePreviaPasadaRule implements ValidationRule
{
    public function __construct(
        protected string $estudianteCodigo
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        /** @var ProgresoFasesService $service */
        $service = app(ProgresoFasesService::class);

        if (!$service->puedeInscribirseAFasePorCodigo($this->estudianteCodigo, (int)$value)) {
            $fail('No puedes inscribirte a esta fase hasta aprobar la fase anterior.');
        }
    }
}
