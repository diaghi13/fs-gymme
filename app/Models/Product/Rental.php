<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Parental\HasParent;

class Rental extends Product
{
    use HasParent;
}
