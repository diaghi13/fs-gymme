<?php

namespace App\Models\Traits;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

trait HasSettings
{
    public static function bootHasSettings()
    {
        static::creating(function ($model) {
            $merged = self::deepMerge(
                $model->getCommonSettingsDefaults(),
                $model->getExtraSettingsDefaults()
            );

            $model->settings = self::deepMerge($merged, $model->settings ?? []);

            $model->validateSettings();
        });

        static::updating(function ($model) {
            $original = $model->getOriginal('settings') ?? [];
            // $model->settings = self::deepMerge($original, $model->settings ?? []);
            // TODO: forse non serve fare il merge in updating, altrimenti non si possono rimuovere le chiavi
            $model->settings = $model->settings ?? $original;
            $model->validateSettings();
        });
    }

    protected function getCommonSettingsDefaults(): array
    {
        return [];
    }

    protected function getExtraSettingsDefaults(): array
    {
        return [];
    }

    protected function getCommonSettingsRules(): array
    {
        return [];
    }

    protected function validateSettings(): void
    {
        $validator = Validator::make($this->settings ?? [], $this->getSettingsRules());

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    protected function getSettingsRules(): array
    {
        return array_merge(
            $this->getCommonSettingsRules(),
            $this->getExtraSettingsRules()
        );
    }

    protected function getExtraSettingsRules(): array
    {
        return [];
    }

    private static function deepMerge(array $origina, array $array2): array
    {
        foreach ($array2 as $key => $value) {
            if (is_array($value)) {
                // If the key exists in the original array and is also an array, merge recursively
                if (isset($origina[$key]) && is_array($origina[$key])) {
                    $origina[$key] = self::deepMerge($origina[$key], $value);
                } else {
                    // Otherwise, directly assign the new array
                    $origina[$key] = $value;
                }
            } else {
                // Overwrite or add new values
                $origina[$key] = $value;
            }
        }

        return $origina;
    }

    public function getSetting(string $key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }

    public function setSetting(string|array $key, $value = null): void
    {
        $new = is_array($key) ? $key : [$key => $value];
        $merged = self::deepMerge($this->settings ?? [], $this->dotToNested($new));
        $this->settings = $merged;
        $this->validateSettings();
    }

    protected function dotToNested(array $dotArray): array
    {
        $nested = [];
        foreach ($dotArray as $key => $value) {
            data_set($nested, $key, $value);
        }

        return $nested;
    }
}
