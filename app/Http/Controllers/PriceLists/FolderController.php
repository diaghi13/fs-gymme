<?php

namespace App\Http\Controllers\PriceLists;

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
            'priceLists' => (new PriceList())->toTree(),
            'priceListOptions' => PriceList::where('type', PriceListItemTypeEnum::FOLDER->value)->get(['id', 'name'])->map(function ($option) {
                return ['value' => $option->id, 'label' => $option->name];
            }),
            'priceListOptionsTree' => (new PriceList())->folderTree(),
            'priceList' => new Folder(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $folder = Folder::create($request->only(['name', 'parent_id', 'saleable']));

        return to_route('price-lists.folders.show', ['folder' => $folder->id])
            ->with('status', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(Folder $folder)
    {
        return Inertia::render('price-lists/price-lists', [
            'priceLists' => (new PriceList())->toTree(),
            'priceListOptions' => PriceList::where('type', PriceListItemTypeEnum::FOLDER->value)->get(['id', 'name'])->map(function ($option) {
                return ['value' => $option->id, 'label' => $option->name];
            }),
            'priceListOptionsTree' => (new PriceList())->folderTree(),
            'priceList' => $folder,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Folder $folder)
    {
        $folder->update($request->only(['name', 'parent_id', 'saleable']));

        return to_route('price-lists.folders.show', ['folder' => $folder->id])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Folder $folder)
    {
        $folder->delete();

        return to_route('price-lists.index')
            ->with('status', 'success');
    }
}
