<?php

namespace Database\Seeders;

use App\Models\PlatformSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'fee_tiers',
                'value' => json_encode([
                    ['max_amount' => 100.00, 'rate' => 0.30],
                    ['max_amount' => 1000.00, 'rate' => 0.15],
                    ['max_amount' => null, 'rate' => 0.10],
                ]),
                'description' => 'Faixas de taxa da plataforma (BRL). max_amount null = sem limite.',
            ],
            [
                'key' => 'community_service_limit_per_user',
                'value' => json_encode(3),
                'description' => 'Máximo de serviços comunitários ativos por usuário.',
            ],
            [
                'key' => 'community_service_platform_ratio',
                'value' => json_encode(0.10),
                'description' => 'Percentual máximo de serviços comunitários em relação ao total da plataforma.',
            ],
            [
                'key' => 'contract_auto_release_days',
                'value' => json_encode(3),
                'description' => 'Dias de prazo para o contratante confirmar após prestador marcar como concluído.',
            ],
            [
                'key' => 'currency',
                'value' => json_encode('BRL'),
                'description' => 'Moeda padrão da plataforma.',
            ],
            [
                'key' => 'maintenance_mode',
                'value' => json_encode(false),
                'description' => 'Modo de manutenção da plataforma.',
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('platform_settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
