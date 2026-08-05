<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\PassportServiceProvider;
use Illuminate\Broadcasting\BroadcastServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    PassportServiceProvider::class,
    BroadcastServiceProvider::class,
];
