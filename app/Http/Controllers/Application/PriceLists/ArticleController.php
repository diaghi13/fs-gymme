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
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id'],
            'color' => ['required', 'string', 'max:7'],
            'price' => ['required', 'numeric', 'min:0'],
            'vat_rate_id' => ['required', 'integer', 'exists:vat_rates,id'],
            'saleable' => ['nullable', 'boolean'],
            'saleable_from' => ['nullable', 'date'],
            'saleable_to' => ['nullable', 'date', 'after_or_equal:saleable_from'],
        ]);

        $article = Article::create($validated);

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
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id', function ($attribute, $value, $fail) use ($article) {
                if ($value === $article->id) {
                    $fail('Non puoi selezionare se stesso come parent.');
                }
            }],
            'color' => ['required', 'string', 'max:7'],
            'price' => ['required', 'numeric', 'min:0'],
            'vat_rate_id' => ['required', 'integer', 'exists:vat_rates,id'],
            'saleable' => ['nullable', 'boolean'],
            'saleable_from' => ['nullable', 'date'],
            'saleable_to' => ['nullable', 'date', 'after_or_equal:saleable_from'],
        ]);

        $article->update($validated);

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
