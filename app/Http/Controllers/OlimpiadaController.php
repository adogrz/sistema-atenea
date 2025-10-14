<?php

namespace App\Http\Controllers;

use App\Models\Olimpiada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class OlimpiadaController extends Controller
{
    protected array $guard = ['id','created_at','updated_at'];

    protected function fillableFromRequest(Request $request): array
    {
        $columns = Schema::getColumnListing('olimpiadas');
        $allowed = array_values(array_diff($columns, $this->guard));
        return $request->only($allowed);
    }

    public function index(Request $request)
    {
        $perPage = (int) ($request->integer('per_page') ?: 15);
        $columns = Schema::getColumnListing('olimpiadas');

        $q = Olimpiada::query();

        // Simple "q" search across string columns
        if ($search = $request->string('q')->toString()) {
            $q->where(function ($qq) use ($columns, $search) {
                foreach ($columns as $col) {
                    $qq->orWhere($col, 'LIKE', '%'.$search.'%');
                }
            });
        }

        // Column-based filters
        foreach ($request->all() as $key => $val) {
            if (in_array($key, $columns, true) && $val !== null && $key !== 'q' && $key !== 'per_page') {
                $q->where($key, $val);
            }
        }

        $q->orderBy($request->get('order_by', 'id'), $request->get('order_dir', 'desc'));

        return response()->json($q->paginate($perPage));
    }

    public function show(Olimpiada $olimpiada)
    {
        return response()->json($olimpiada);
    }

    public function store(Request $request)
    {
        $data = $this->fillableFromRequest($request);
        $olimpiada = Olimpiada::create($data);
        return response()->json($olimpiada, 201);
    }

    public function update(Request $request, Olimpiada $olimpiada)
    {
        $data = $this->fillableFromRequest($request);
        $olimpiada->fill($data)->save();
        return response()->json($olimpiada);
    }

    public function destroy(Olimpiada $olimpiada)
    {
        $olimpiada->delete();
        return response()->json(['deleted' => true]);
    }
}
