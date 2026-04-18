<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $organizations = [
            [
                'name' => 'Internal',
                'slug' => 'internal',
                'type' => 'internal',
                'description' => 'Pengguna internal instansi',
                'is_active' => true,
            ],
        ];

        foreach ($organizations as $organization) {
            Organization::firstOrCreate(
                ['slug' => $organization['slug']],
                $organization,
            );
        }
    }
}
