<?php

namespace App\Http\Controllers;

use App\Models\ItemDefinido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ItemDefinidoController extends Controller
{
    protected array $guard = ['id','created_at','updated_at'];

    protected function fillableFromRequest(Request $request): array
    {
        $columns = Schema::getColumnListing('items_definidos');
        $allowed = array_values(array_diff($columns, $this->guard));
        return $request->only($allowed);
    }

    public function index(Request $request)
    {
        $perPage = (int) ($request->integer('per_page') ?: 15);
        $columns = Schema::getColumnListing('items_definidos');

        $q = ItemDefinido::query();

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

    public function show(ItemDefinido $itemDefinido)
    {
        return response()->json($itemDefinido);
    }

    public function store(Request $request)
    {
        $data = $this->fillableFromRequest($request);
        $item = ItemDefinido::create($data);
        return response()->json($item, 201);
    }

    public function update(Request $request, ItemDefinido $itemDefinido)
    {
        $data = $this->fillableFromRequest($request);
        $itemDefinido->fill($data)->save();
        return response()->json($itemDefinido);
    }

    public function destroy(ItemDefinido $itemDefinido)
    {
        $itemDefinido->delete();
        return response()->json(['deleted' => true]);
    }
}
