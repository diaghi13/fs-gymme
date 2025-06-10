<?php

namespace App\Http\Controllers\PriceLists;

use App\Enums\PriceListItemTypeEnum;
use App\Http\Controllers\Controller;
use App\Models\PriceList\Article;
use App\Models\PriceList\PriceList;
use App\Services\PriceList\PriceListService;
use App\Services\VatRateService;
use App\Support\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('price-lists/price-lists', [
            ...PriceListService::getViewAttributes(),
            'priceList' => new Article([
                'color' => Color::randomHex(),
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $article = Article::create($request->only(['name', 'parent_id', 'color', 'vat_rate_id', 'saleable']));

        return to_route('price-lists.articles.show', ['article' => $article->id])
            ->with('status', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(Article $article)
    {
        $article->load('vat_rate');

        return Inertia::render('price-lists/price-lists', [
            ...PriceListService::getViewAttributes(),
            'priceList' => $article,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Article $article)
    {
        $article->update($request->only(['name', 'parent_id', 'color', 'vat_rate_id', 'saleable']));

        return to_route('price-lists.articles.show', ['article' => $article->id])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Article $article)
    {
        $article->delete();

        return to_route('price-lists.index')
            ->with('status', 'success');
    }
}
