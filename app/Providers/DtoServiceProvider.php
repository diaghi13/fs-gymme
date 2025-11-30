<?php

namespace App\Providers;

use App\Dtos\BaseDto;
use Illuminate\Support\ServiceProvider;

class DtoServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->app->beforeResolving(BaseDto::class, function ($dto, $parameters, $app) {
            if ($app->has($dto)) {
                return;
            }

            $app->bind(
                $dto,
                fn($container) => $dto::fromRequest($container['request'])
            );
        });
    }
}
