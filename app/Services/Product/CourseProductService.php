<?php

namespace App\Services\Product;

use App\Dtos\Product\CourseProductDto;
use App\Enums\SkuProductPrefix;
use App\Models\Product\BaseProduct;
use App\Models\Product\CourseProduct;
use App\Models\Product\Product;
use App\Models\VatRate;
use App\Support\Color;
use App\Support\ProductUtil;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CourseProductService
{
    public function show(CourseProduct $product): array
    {
        // Ensure settings are initialized if null (for legacy products or edge cases)
        if (is_null($product->settings)) {
            $product->settings = array_merge(
                $product->getCommonSettingsDefaults(),
                $product->getExtraSettingsDefaults()
            );
            $product->save();
        }

        $product->load(['vat_rate', 'plannings.details']);

        $vatRates = VatRate::all('id', 'code', 'description');

        // Format plannings for autocomplete options
        $planningOptions = $product->plannings->map(function ($planning) {
            return [
                'value' => $planning->id,
                'label' => $planning->name.' ('.$planning->start_date->format('d/m/Y').' - '.$planning->end_date->format('d/m/Y').')',
            ];
        })->toArray();

        return [
            'product' => $product,
            'vatRateOptions' => $vatRates,
            'planningOptions' => $planningOptions,
        ];
    }

    public function newProduct(): BaseProduct
    {
        return new BaseProduct([
            'name' => '',
            'slug' => '',
            'color' => Color::randomHex(),
            'sku' => '',
            'is_active' => true,
            'saleable_in_subscription' => true,
        ]);
    }

    /**
     * @throws \Throwable
     */
    public function store(CourseProductDto $dto): CourseProduct
    {
        return DB::transaction(function () use ($dto) {
            $lastId = Product::max('id') ?? 0;
            $sku = ProductUtil::generateSku($dto->name, $lastId + 1, SkuProductPrefix::COURSE_PRODUCT->value);
            $slug = ProductUtil::generateProductSlug($dto->name, $lastId + 1);

            return CourseProduct::create([
                ...$dto->toArray(),
                'sku' => $sku,
                'slug' => $slug,
            ]);
        });
    }

    /**
     * @throws \Throwable
     */
    public function update(CourseProductDto $dto): CourseProduct
    {
        $product = CourseProduct::find($dto->id);

        if (! $product) {
            throw ValidationException::withMessages(['product' => 'Product not found.']);
        }

        return DB::transaction(function () use ($product, $dto) {
            $product->fill($dto->toArray());

            if ($dto->name !== $product->getOriginal('name')) {
                // Name has changed, update slug
                $product->slug = $this->updateSlug([
                    'name' => $dto->name,
                    'id' => $dto->id,
                ]);
            }

            if ($dto->name !== $product->getOriginal('name')) {
                // Name has changed, update SKU
                $product->sku = $this->updateSku([
                    'name' => $dto->name,
                    'id' => $dto->id,
                ]);
            }

            if ($dto->vat_rate) {
                $product->vat_rate()->associate($dto->vat_rate);
            }

            $product->save();

            return $product;
        });
    }

    public function delete(string $id): true
    {
        $product = CourseProduct::find($id);

        if (! $product) {
            throw ValidationException::withMessages(['product' => 'Product not found.']);
        }

        $product->delete();

        return true;
    }

    /** @param array{id: int, name: string} $data */
    private function updateSlug(array $data): string
    {
        return ProductUtil::generateProductSlug($data['name'], $data['id']);
    }

    /** @param array{id: int, name: string} $data */
    private function updateSku(array $data): string
    {
        return ProductUtil::generateSku($data['name'], $data['id'], SkuProductPrefix::BASE_PRODUCT->value);
    }
}
