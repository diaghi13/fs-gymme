<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Parental\HasParent;

class Subscription extends Product
{
    use HasParent;
}
