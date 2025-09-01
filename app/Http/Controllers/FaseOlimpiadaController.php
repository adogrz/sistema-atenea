<?php

namespace App\Http\Controllers;

use App\Models\FaseOlimpiada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class FaseOlimpiadaController extends Controller
{
    protected array $guard = ['id','created_at','updated_at'];

    protected function fillableFromRequest(Request $request): array
    {
        $columns = Schema::getColumnListing('fases_olimpiadas');
        $allowed = array_values(array_diff($columns, $this->guard));
        return $request->only($allowed);
    }

    public function index(Request $request)
    {
        $perPage = (int) ($request->integer('per_page') ?: 15);
        $columns = Schema::getColumnListing('fases_olimpiadas');

        $q = FaseOlimpiada::query();

        if ($search = $request->string('q')->toString()) {
            $q->where(function ($qq) use ($columns, $search) {
                foreach ($columns as $col) {
                    $qq->orWhere($col, 'LIKE', '%'.$search.'%');
                }
            });
        }

        foreach ($request->all() as $key => $val) {
            if (in_array($key, $columns, true) && $val !== null && $key !== 'q' && $key !== 'per_page') {
                $q->where($key, $val);
            }
        }

        $q->orderBy($request->get('order_by', 'id'), $request->get('order_dir', 'desc'));
        return response()->json($q->paginate($perPage));
    }

    public function show(FaseOlimpiada $faseOlimpiada)
    {
        return response()->json($faseOlimpiada);
    }

    public function store(Request $request)
    {
        $data = $this->fillableFromRequest($request);
        $fase = FaseOlimpiada::create($data);
        return response()->json($fase, 201);
    }

    public function update(Request $request, FaseOlimpiada $faseOlimpiada)
    {
        $data = $this->fillableFromRequest($request);
        $faseOlimpiada->fill($data)->save();
        return response()->json($faseOlimpiada);
    }

    public function destroy(FaseOlimpiada $faseOlimpiada)
    {
        $faseOlimpiada->delete();
        return response()->json(['deleted' => true]);
    }
}
