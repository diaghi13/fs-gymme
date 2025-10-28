<?php

namespace App\Dtos;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use ReflectionClass;
use ReflectionNamedType;
use ReflectionProperty;

abstract class BaseDto
{
    public function __construct(array $attributes = [])
    {
        $reflection = new ReflectionClass($this);
        $casts = static::casts();

        foreach ($attributes as $key => $value) {
            if ($reflection->hasProperty($key)) {
                $this->{$key} = isset($casts[$key])
                    ? $this->castValue($value, $casts[$key])
                    : $this->castValue($value, $key);
            }
        }
    }

    public static function fromRequest(Request $request): static
    {
        $data = $request->all();

        $attributeRules = static::extractValidationRules();
        $manualRules = static::validationRules();

        $rules = array_merge($attributeRules, $manualRules);

        $validator = Validator::make($data, $rules);
        $validated = $validator->validate();

        return new static($validated);
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }

    public function toJson(): string
    {
        return json_encode($this->toArray());
    }

    public function __toString(): string
    {
        return $this->toJson();
    }

    public static function fromArray(array $data): static
    {
        $attributeRules = static::extractValidationRules();
        $manualRules = static::validationRules();

        // Unione delle regole: quelle manuali sovrascrivono quelle dagli attributi
        $rules = array_merge($attributeRules, $manualRules);

        $validator = Validator::make($data, $rules);
        $validated = $validator->validate();

        return new static($validated);
    }

    private static function extractValidationRules(): array
    {
        $rules = [];
        $reflection = new ReflectionClass(static::class);

        foreach ($reflection->getProperties(ReflectionProperty::IS_PUBLIC) as $property) {
            $propertyRules = [];

            // Deduce regole base dal tipo della proprietà
            $type = $property->getType();
            if ($type instanceof ReflectionNamedType) {
                $isNullable = $type->allowsNull();
                $typeName = $type->getName();

                if ($isNullable) {
                    $propertyRules[] = 'nullable';
                }

                switch ($typeName) {
                    case 'int':
                        $propertyRules[] = 'integer';
                        break;
                    case 'string':
                        $propertyRules[] = 'string';
                        break;
                    case 'bool':
                        $propertyRules[] = 'boolean';
                        break;
                    case 'array':
                        $propertyRules[] = 'array';
                        break;
                }
            }

            // Aggiungi regole personalizzate definite manualmente
            $attributes = $property->getAttributes(Rule::class);
            foreach ($attributes as $attribute) {
                $ruleInstance = $attribute->newInstance();
                $propertyRules = array_merge($propertyRules, $ruleInstance->rules);
            }

            $rules[$property->getName()] = $propertyRules;
        }

        return $rules;
    }

    // Metodo per definire regole manuali
    protected static function validationRules(): array
    {
        return [];
    }

    private function castValue(mixed $value, string $propertyName): mixed
    {
        $reflection = new ReflectionClass($this);

        if ($reflection->hasProperty($propertyName)) {
            $property = $reflection->getProperty($propertyName);
            $type = $property->getType();

            if ($type instanceof ReflectionNamedType) {
                $typeName = $type->getName();

                if (class_exists($typeName)) {
                    // Delegate Eloquent model handling to a separate method
                    if (is_subclass_of($typeName, 'Illuminate\Database\Eloquent\Model')) {
                        return $this->handleEloquentModel($typeName, $value);
                    }

                    // If the type is a class and the value is an array, instantiate the object
                    if (is_array($value)) {
                        return new $typeName($value);
                    }
                }

                // Default casting logic based on type
                return match ($typeName) {
                    'int' => (int) $value,
                    'float' => (float) $value,
                    'bool' => (bool) $value,
                    'string' => (string) $value,
                    default => $value,
                };
            }
        }

        // Fallback to explicit cast if defined
        $casts = static::casts();
        if (isset($casts[$propertyName])) {
            $castType = $casts[$propertyName];
            if (class_exists($castType) && is_array($value)) {
                return new $castType($value);
            }

            return match ($castType) {
                'int' => (int) $value,
                'float' => (float) $value,
                'bool' => (bool) $value,
                'string' => (string) $value,
                default => $value,
            };
        }

        return $value;
    }

    private function handleEloquentModel(string $modelClass, mixed $value): mixed
    {
        $model = new $modelClass();
        $primaryKey = $model->getKeyName();

        if (is_array($value) && isset($value[$primaryKey])) {
            return $modelClass::findOrFail($value[$primaryKey]);
        }

        if (is_scalar($value)) {
            return $modelClass::findOrFail($value);
        }

        if (is_array($value)) {
            return $model->fill($value);
        }

        return $value;
    }
}
