<?php

namespace App\Http\Controllers\Application\PriceLists;

use App\Enums\PriceListItemTypeEnum;
use App\Http\Controllers\Controller;
use App\Models\PriceList\Folder;
use App\Models\PriceList\PriceList;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FolderController extends Controller
{
    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('price-lists/price-lists', [
            'priceLists' => (new PriceList)->toTree(),
            'priceListOptions' => PriceList::where('type', PriceListItemTypeEnum::FOLDER->value)->get(['id', 'name'])->map(function ($option) {
                return ['value' => $option->id, 'label' => $option->name];
            }),
            'priceListOptionsTree' => (new PriceList)->folderTree(),
            'priceList' => new Folder,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id'],
            'saleable' => ['nullable', 'boolean'],
        ]);

        $folder = Folder::create($data);

        return to_route('app.price-lists.folders.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'folder' => $folder->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(Folder $folder)
    {
        return Inertia::render('price-lists/price-lists', [
            'priceLists' => (new PriceList)->toTree(),
            'priceListOptions' => PriceList::where('type', PriceListItemTypeEnum::FOLDER->value)->get(['id', 'name'])->map(function ($option) {
                return ['value' => $option->id, 'label' => $option->name];
            }),
            'priceListOptionsTree' => (new PriceList)->folderTree(),
            'priceList' => $folder,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Folder $folder)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id', function ($attribute, $value, $fail) use ($folder) {
                if ($value === $folder->id) {
                    $fail('Una cartella non può essere genitore di se stessa');
                }
            }],
            'saleable' => ['nullable', 'boolean'],
        ]);

        $folder->update($data);

        return to_route('app.price-lists.folders.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'folder' => $folder->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Duplicate the specified resource.
     */
    public function duplicate(Folder $folder)
    {
        $newFolder = $folder->replicate();
        $newFolder->name = 'Copia di '.$folder->name;
        $newFolder->save();

        return to_route('app.price-lists.folders.show', [
            'tenant' => session()->get('current_tenant_id'),
            'folder' => $newFolder->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Folder $folder)
    {
        $folder->delete();

        return to_route('app.price-lists.index', [
            'tenant' => session()->get('current_tenant_id'),
        ])
            ->with('status', 'success');
    }
}
