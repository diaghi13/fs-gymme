<?php

namespace App\Support;

class Color
{
    public static function randomHex()
    {
        return sprintf('#%06X', mt_rand(0, 0xFFFFFF));
    }

    public static function randomRgb()
    {
        return [
            'r' => mt_rand(0, 255),
            'g' => mt_rand(0, 255),
            'b' => mt_rand(0, 255),
        ];
    }

    public static function randomHsl()
    {
        return [
            'h' => mt_rand(0, 360),
            's' => mt_rand(0, 100),
            'l' => mt_rand(0, 100),
        ];
    }

    public static function randomCmyk()
    {
        return [
            'c' => mt_rand(0, 100),
            'm' => mt_rand(0, 100),
            'y' => mt_rand(0, 100),
            'k' => mt_rand(0, 100),
        ];
    }

    public static function randomName()
    {
        $names = [
            'Red',
            'Green',
            'Blue',
            'Yellow',
            'Cyan',
            'Magenta',
            'Black',
            'White',
            'Gray',
            'Purple',
            'Pink',
            'Orange',
        ];

        return $names[array_rand($names)];
    }

    public static function randomColor()
    {
        return [
            'hex' => self::randomHex(),
            'rgb' => self::randomRgb(),
            'hsl' => self::randomHsl(),
            'cmyk' => self::randomCmyk(),
            'name' => self::randomName(),
        ];
    }

    public static function isValidHex($value): bool
    {
        return preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $value) === 1;
    }
}
