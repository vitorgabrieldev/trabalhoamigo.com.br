<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BulkServicesSeeder extends Seeder
{
    private const BATCH = 250;
    private const TOTAL = 1000;

    private array $titles = [
        'Instalação completa de', 'Manutenção preventiva de', 'Reparo emergencial de',
        'Consultoria especializada em', 'Serviço profissional de', 'Projeto personalizado de',
        'Reforma completa de', 'Limpeza e higienização de', 'Montagem e instalação de',
        'Revisão e ajuste de', 'Treinamento intensivo de', 'Diagnóstico técnico de',
        'Assessoria avançada em', 'Gestão e controle de', 'Desenvolvimento de',
    ];

    private array $subjects = [
        'sistemas elétricos residenciais', 'redes hidráulicas', 'jardins e paisagismo',
        'equipamentos de ar-condicionado', 'câmeras de segurança', 'sistemas de automação',
        'móveis sob medida', 'pisos e revestimentos', 'telhados e coberturas',
        'fachadas e pintura externa', 'ambientes internos', 'cozinhas industriais',
        'banheiros e lavabos', 'varandas e áreas externas', 'escritórios corporativos',
        'lojas e estabelecimentos', 'academias e estúdios', 'clínicas e consultórios',
        'escolas e creches', 'galpões industriais', 'veículos e frotas',
        'computadores e redes', 'softwares empresariais', 'sites e aplicativos',
        'redes sociais corporativas', 'campanhas de marketing', 'identidade visual',
        'planos nutricionais', 'treinos personalizados', 'aulas de idiomas',
    ];

    private array $descriptions = [
        'Serviço executado por profissional certificado com mais de 10 anos de experiência. Garantia de qualidade e satisfação total. Orçamento sem compromisso.',
        'Atendimento rápido e eficiente. Utilizamos materiais de primeira linha e seguimos todas as normas técnicas vigentes. Preço justo e transparente.',
        'Especialista com vasta experiência no mercado. Trabalho feito com dedicação e capricho. Nos adaptamos às suas necessidades e disponibilidade.',
        'Profissional qualificado e comprometido com a excelência. Pontualidade e organização são nossos diferenciais. Solicite seu orçamento agora.',
        'Equipe experiente e ferramentas adequadas para cada tipo de serviço. Limpeza e organização do ambiente ao finalizar o trabalho.',
        'Serviço de alta qualidade com materiais de procedência. Atendimento personalizado e suporte pós-serviço incluso no valor.',
        'Realizamos o serviço com toda a atenção que você merece. Trabalhamos com os melhores produtos do mercado e praticamos preços competitivos.',
        'Profissional dedicado e atencioso. Garantia de serviço executado conforme o combinado, dentro do prazo e do orçamento acordado.',
    ];

    // Unsplash photo IDs agrupados por tema
    private array $images = [
        'photo-1621905251189-08b45d6a269e', // eletricista
        'photo-1607400201889-565b1ee75f8e', // encanador
        'photo-1562259949-e8e7689d7828', // pintura
        'photo-1558618666-fcd25c85cd64', // limpeza
        'photo-1584622650111-993a426fbf0a', // limpeza doméstica
        'photo-1504307651254-35680f356dfd', // pintura comunitária
        'photo-1541888946425-d81bb19240f5', // construção
        'photo-1581578731548-c64695cc6952', // reforma
        'photo-1600585154340-be6161a56a0c', // jardim
        'photo-1416879595882-3373a0480b5b', // jardinagem
        'photo-1467232004584-a241de8bcf5d', // tecnologia
        'photo-1518770660439-4636190af475', // computadores
        'photo-1503951914875-452162b0f3f1', // barbeiro
        'photo-1522335789203-aabd1fc54bc9', // beleza
        'photo-1556909114-f6e7ad7d3136', // gastronomia
        'photo-1414235077428-338989a2e8c0', // culinária
        'photo-1571019613454-1cb2f99b2d8b', // academia
        'photo-1534438327276-14e5300c3a48', // treino
        'photo-1454165804606-c3d57bc86b40', // consultoria
        'photo-1553877522-43269d4ea984', // design
        'photo-1507003211169-0a1dd7228f2d', // pessoa negócios
        'photo-1573496359142-b8d87734a5a2', // pessoa negócios 2
        'photo-1544717305-2782549b5136', // arquitetura
        'photo-1503387762-592deb58ef4e', // projeto
        'photo-1449824913935-59a10b8d2000', // transporte
        'photo-1568605114967-8130f3a36994', // motorista
        'photo-1581092446327-9b52bd1570c2', // segurança
        'photo-1551288049-bebda4e38f71', // câmera
        'photo-1576678927484-cc907957088c', // yoga
        'photo-1593032465175-481ac7f401a0', // home office
    ];

    private array $cities = [
        ['city' => 'São Paulo', 'state' => 'SP'],
        ['city' => 'Rio de Janeiro', 'state' => 'RJ'],
        ['city' => 'Belo Horizonte', 'state' => 'MG'],
        ['city' => 'Curitiba', 'state' => 'PR'],
        ['city' => 'Porto Alegre', 'state' => 'RS'],
        ['city' => 'Fortaleza', 'state' => 'CE'],
        ['city' => 'Recife', 'state' => 'PE'],
        ['city' => 'Salvador', 'state' => 'BA'],
        ['city' => 'Manaus', 'state' => 'AM'],
        ['city' => 'Brasília', 'state' => 'DF'],
    ];

    public function run(): void
    {
        // 1. Categorias
        $categoryIds = Category::pluck('id')->toArray();
        if (empty($categoryIds)) {
            $this->command->error('Rode CategorySeeder primeiro.');
            return;
        }

        // 2. Prestadores — reutiliza existentes + cria novos
        $existingProviders = User::where('role', 'provider')
            ->where('stripe_onboarding_completed', true)
            ->pluck('id')
            ->toArray();

        $providerIds = $existingProviders;

        // Cria 15 novos prestadores em lote
        $newProviders = [];
        $names = [
            ['Paulo','Silva'],['Mariana','Souza'],['Rafael','Costa'],['Camila','Lima'],
            ['Lucas','Ferreira'],['Beatriz','Alves'],['Rodrigo','Pereira'],['Natalia','Gomes'],
            ['Felipe','Rocha'],['Amanda','Martins'],['Gustavo','Carvalho'],['Patricia','Nunes'],
            ['Eduardo','Dias'],['Fernanda','Ribeiro'],['Leonardo','Cardoso'],
        ];

        foreach ($names as [$first, $last]) {
            $email = strtolower($first . '.' . $last . rand(100, 999) . '@bulk.com');
            if (!User::where('email', $email)->exists()) {
                $newProviders[] = [
                    'uuid'                        => (string) Str::uuid(),
                    'first_name'                  => $first,
                    'last_name'                   => $last,
                    'email'                       => $email,
                    'password'                    => Hash::make('password'),
                    'role'                        => 'provider',
                    'email_verified_at'           => now(),
                    'stripe_onboarding_completed' => true,
                    'phone'                       => '(11) 9' . rand(1000, 9999) . '-' . rand(1000, 9999),
                    'created_at'                  => now(),
                    'updated_at'                  => now(),
                ];
            }
        }

        if (!empty($newProviders)) {
            DB::table('users')->insert($newProviders);
            $providerIds = array_merge(
                $providerIds,
                User::where('email', 'like', '%@bulk.com')->pluck('id')->toArray()
            );
        }

        // 3. Gera e insere serviços em batches
        $rows = [];
        $now  = now();

        for ($i = 0; $i < self::TOTAL; $i++) {
            $providerId  = $providerIds[array_rand($providerIds)];
            $categoryId  = $categoryIds[array_rand($categoryIds)];
            $title       = $this->titles[array_rand($this->titles)] . ' ' . $this->subjects[array_rand($this->subjects)];
            $description = $this->descriptions[array_rand($this->descriptions)];
            $imageId     = $this->images[array_rand($this->images)];
            $isCommunity = $i % 15 === 0; // ~6% comunitários
            $acceptsOffer = $i % 5 === 0;  // 20% aceita proposta
            $basePrice   = $isCommunity ? null : round(rand(50, 2000) + rand(0, 99) / 100, 2);
            $daysAgo     = rand(0, 180);

            $rows[] = [
                'uuid'          => (string) Str::uuid(),
                'user_id'       => $providerId,
                'category_id'   => $categoryId,
                'title'         => ucfirst($title),
                'description'   => $description,
                'base_price'    => $basePrice,
                'accepts_offer' => $acceptsOffer,
                'is_community'  => $isCommunity,
                'image_url'     => "https://images.unsplash.com/{$imageId}?w=800&h=600&fit=crop&auto=format",
                'status'        => 'active',
                'created_at'    => $now->copy()->subDays($daysAgo)->subHours(rand(0, 23)),
                'updated_at'    => $now->copy()->subDays($daysAgo),
            ];

            if (count($rows) === self::BATCH) {
                DB::table('services')->insert($rows);
                $rows = [];
            }
        }

        if (!empty($rows)) {
            DB::table('services')->insert($rows);
        }

        $this->command->info('✓ ' . self::TOTAL . ' serviços inseridos.');
    }
}
