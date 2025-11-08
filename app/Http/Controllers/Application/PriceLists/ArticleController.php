<?php

namespace App\Http\Controllers\Application\PriceLists;

use App\Http\Controllers\Controller;
use App\Models\PriceList\Article;
use App\Services\PriceList\PriceListService;
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
        $article = Article::create($request->only(['name', 'parent_id', 'color', 'price', 'vat_rate_id', 'saleable', 'saleable_from', 'saleable_to']));

        return to_route('app.price-lists.articles.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'article' => $article->id,
        ])
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
        $article->update($request->only(['name', 'parent_id', 'color', 'price', 'vat_rate_id', 'saleable', 'saleable_from', 'saleable_to']));

        return to_route('app.price-lists.articles.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'article' => $article->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Article $article)
    {
        $article->delete();

        return to_route('app.price-lists.index', [
            'tenant' => session()->get('current_tenant_id'),
        ])
            ->with('status', 'success');
    }
}
