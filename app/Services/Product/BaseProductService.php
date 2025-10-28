<?php

namespace App\Services\Product;

use App\Dtos\Product\BaseProductDto;
use App\Enums\SkuProductPrefix;
use App\Models\Product\BaseProduct;
use App\Models\Product\Product;
use App\Models\VatRate;
use App\Support\Color;
use App\Support\ProductUtil;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BaseProductService
{
    public function show(BaseProduct $product)
    {
        $product
            ->append('is_schedulable')
            ->load([
                'product_schedules',
                'vat_rate'
            ]);

        //$vatRates = VatRateService::toOptions();
        $vatRates = VatRate::all('id', 'code', 'description');

        return [
            'product' => $product,
            'vatRateOptions' => $vatRates,
        ];
    }

    public function newProduct(): BaseProduct
    {
        return new BaseProduct([
            'name' => '',
            'slug' => '',
            'color' => Color::randomHex(),
            'sku' => '',
            'saleable_in_subscription' => true,
            'is_active' => true,
        ]);
    }

    /**
     * @throws \Throwable
     */
    public function store(array $data): BaseProduct
    {
        return DB::transaction(function () use ($data) {
            $lastId = Product::max('id') ?? 0;
            $sku = ProductUtil::generateSku($data['name'], $lastId + 1, SkuProductPrefix::BASE_PRODUCT->value);
            $slug = ProductUtil::generateProductSlug($data['name'], $lastId + 1);
            $sellingDescription = $data['selling_description'] ?? $data['name'];

            return BaseProduct::create([
                ...$data,
                'sku' => $sku,
                'slug' => $slug,
                'selling_description' => $sellingDescription,
            ]);
        });
    }

    /**
     * @throws \Throwable
     */
    public function update(BaseProductDto $dto): BaseProduct
    {
        $product = BaseProduct::find($dto->id);

        if (!$product) {
            throw ValidationException::withMessages(['product' => 'Product not found.']);
        }

        return DB::transaction(function () use ($product, $dto) {
            $product->fill($dto->toArray());

            if ($dto->name === $dto->selling_description) {
                $product->selling_description = $dto->name;
            }

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
        $product = BaseProduct::find($id);

        if (!$product) {
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
