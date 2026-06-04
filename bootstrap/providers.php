<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\PassportServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    PassportServiceProvider::class,
    Illuminate\Broadcasting\BroadcastServiceProvider::class,
];
