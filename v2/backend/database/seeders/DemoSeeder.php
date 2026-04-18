<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Usuários ────────────────────────────────────────────────────────────

        // Limpa dados demo anteriores para re-seed idempotente
        $demoEmails = ['carlos@demo.com','fernanda@demo.com','ricardo@demo.com','ana@demo.com','bruno@demo.com','juliana@demo.com','thiago@demo.com'];
        $demoUserIds = User::whereIn('email', $demoEmails)->pluck('id');
        if ($demoUserIds->isNotEmpty()) {
            DB::table('messages')->whereIn('sender_id', $demoUserIds)->delete();
            DB::table('conversations')->whereIn('contractor_id', $demoUserIds)->orWhereIn('provider_id', $demoUserIds)->delete();
            DB::table('disputes')->whereIn('raised_by_id', $demoUserIds)->delete();
            DB::table('reviews')->whereIn('reviewer_id', $demoUserIds)->delete();
            DB::table('contracts')->whereIn('contractor_id', $demoUserIds)->orWhereIn('provider_id', $demoUserIds)->delete();
            DB::table('proposals')->whereIn('contractor_id', $demoUserIds)->orWhereIn('provider_id', $demoUserIds)->delete();
            DB::table('services')->whereIn('user_id', $demoUserIds)->delete();
            User::whereIn('id', $demoUserIds)->forceDelete();
        }

        $providers = collect([
            ['first_name' => 'Carlos',   'last_name' => 'Oliveira',  'email' => 'carlos@demo.com'],
            ['first_name' => 'Fernanda', 'last_name' => 'Santos',    'email' => 'fernanda@demo.com'],
            ['first_name' => 'Ricardo',  'last_name' => 'Mendes',    'email' => 'ricardo@demo.com'],
        ])->map(fn ($data) => User::create([
            'uuid'                        => Str::uuid(),
            'first_name'                  => $data['first_name'],
            'last_name'                   => $data['last_name'],
            'email'                       => $data['email'],
            'password'                    => Hash::make('password'),
            'role'                        => 'provider',
            'email_verified_at'           => now(),
            'stripe_onboarding_completed' => true,
            'phone'                       => '(11) 9' . fake()->numerify('####-####'),
        ]));

        $contractors = collect([
            ['first_name' => 'Ana',      'last_name' => 'Lima',      'email' => 'ana@demo.com'],
            ['first_name' => 'Bruno',    'last_name' => 'Ferreira',  'email' => 'bruno@demo.com'],
            ['first_name' => 'Juliana',  'last_name' => 'Costa',     'email' => 'juliana@demo.com'],
            ['first_name' => 'Thiago',   'last_name' => 'Rodrigues', 'email' => 'thiago@demo.com'],
        ])->map(fn ($data) => User::create([
            'uuid'              => Str::uuid(),
            'first_name'        => $data['first_name'],
            'last_name'         => $data['last_name'],
            'email'             => $data['email'],
            'password'          => Hash::make('password'),
            'role'              => 'contractor',
            'email_verified_at' => now(),
            'phone'             => '(21) 9' . fake()->numerify('####-####'),
        ]));

        [$carlos, $fernanda, $ricardo] = [$providers[0], $providers[1], $providers[2]];
        [$ana, $bruno, $juliana, $thiago] = [$contractors[0], $contractors[1], $contractors[2], $contractors[3]];

        // ─── Categorias ──────────────────────────────────────────────────────────

        $catPintura    = Category::where('slug', 'pintura')->first()    ?? Category::where('order', 1)->first();
        $catElétrica   = Category::where('slug', 'elétrica')->first()   ?? Category::where('order', 2)->first();
        $catHidráulica = Category::where('slug', 'hidráulica')->first() ?? Category::where('order', 3)->first();
        $catLimpeza    = Category::where('slug', 'limpeza')->first()     ?? Category::where('order', 4)->first();

        // Fallback: usa qualquer categoria disponível
        $cats = Category::orderBy('order')->get();
        $catPintura    ??= $cats->get(0);
        $catElétrica   ??= $cats->get(1) ?? $cats->first();
        $catHidráulica ??= $cats->get(2) ?? $cats->first();
        $catLimpeza    ??= $cats->get(3) ?? $cats->first();

        // ─── Serviços ────────────────────────────────────────────────────────────

        $services = [
            // Carlos — prestador de pintura
            $svcPintura = $this->service($carlos, $catPintura, 'Pintura residencial completa',
                'Pintura interna e externa com tinta de qualidade premium. Inclui preparo da superfície, massa corrida e duas demãos.',
                350.00, true, false,
                'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop&auto=format'),

            $svcPinturaComunitaria = $this->service($carlos, $catPintura, 'Pintura de quarto (comunitário)',
                'Pintura gratuita de um quarto para famílias em necessidade. Projeto social — sem custo.',
                null, false, true,
                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&auto=format'),

            // Fernanda — elétrica e hidráulica
            $svcEletrica = $this->service($fernanda, $catElétrica, 'Instalação elétrica residencial',
                'Instalação e manutenção de circuitos elétricos, troca de tomadas, disjuntores e quadros de distribuição.',
                200.00, false, false,
                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop&auto=format'),

            $svcHidraulica = $this->service($fernanda, $catHidráulica, 'Conserto de vazamentos',
                'Identificação e reparo de vazamentos em tubulações, registros e torneiras. Atendimento emergencial disponível.',
                150.00, true, false,
                'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&h=600&fit=crop&auto=format'),

            // Ricardo — limpeza
            $svcLimpeza = $this->service($ricardo, $catLimpeza, 'Limpeza pós-obra',
                'Limpeza completa de imóvel após obras ou reformas. Inclui remoção de entulho, limpeza de pisos, vidros e esquadrias.',
                500.00, false, false,
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format'),

            $svcLimpezaCom = $this->service($ricardo, $catLimpeza, 'Limpeza básica doméstica (comunitário)',
                'Limpeza básica para idosos e pessoas com dificuldade de locomoção. Serviço comunitário gratuito.',
                null, false, true,
                'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&auto=format'),
        ];

        // ─── Cenários de Proposta + Contrato ─────────────────────────────────────

        // 1. Ana → Carlos | pintura | contrato concluído + avaliação 5 estrelas
        $p1 = $this->proposal($ana, $carlos, $svcPintura, 350.00, 'accepted', 'transferred', now()->subDays(30));
        $c1 = $this->contract($p1, $svcPintura, $ana, $carlos, 350.00, 'contractor_confirmed', now()->subDays(25));
        $this->contractTimestamps($c1, now()->subDays(26), now()->subDays(25));
        $this->review($c1, $svcPintura, $ana, $carlos, 5, 'Serviço impecável! Carlos foi super pontual e o resultado ficou perfeito. Recomendo muito!');
        $conv1 = $this->conversation($p1, $ana, $carlos);
        $this->messages($conv1, $ana, $carlos, [
            [$ana,    'Oi Carlos, vi seu serviço de pintura e gostei muito. Preciso pintar dois quartos e a sala.'],
            [$carlos, 'Olá Ana! Que bom. Me conta mais sobre os ambientes, tamanho aproximado?'],
            [$ana,    'São dois quartos de uns 12m² cada e uma sala de 25m². Precisaria de tinta fosca nas paredes e semi-brilho no teto.'],
            [$carlos, 'Consigo fazer sim. Tenho disponibilidade para essa semana ainda.'],
            [$ana,    'Perfeito! Então vou enviar a proposta aqui pelo sistema.'],
            [$carlos, 'Proposta aceita! Combinado para dia '.now()->subDays(26)->format('d/m').'.'],
            [$ana,    'Ótimo! Estarei em casa o dia todo.'],
            [$carlos, 'Cheguei aqui, pode abrir 😄'],
            [$ana,    'Caramba ficou lindo! Muito melhor do que eu esperava.'],
            [$carlos, 'Fico feliz! Qualquer dúvida sobre a secagem me chama.'],
        ]);

        // 2. Bruno → Carlos | pintura | proposta pendente
        $p2 = $this->proposal($bruno, $carlos, $svcPintura, 320.00, 'pending', 'pending', now()->subHours(5));
        $conv2 = $this->conversation($p2, $bruno, $carlos);
        $this->messages($conv2, $bruno, $carlos, [
            [$bruno,  'Oi Carlos, tenho interesse no serviço de pintura. É possível fazer no fim de semana?'],
            [$carlos, 'Oi Bruno! Depende do fim de semana, estou verificando minha agenda.'],
            [$bruno,  'Enviando a proposta, coloquei R$ 320 pela negociação. O serviço é para uma varanda de 15m².'],
            [$carlos, 'Recebi! Vou analisar e te dou uma resposta em breve.'],
        ]);

        // 3. Juliana → Fernanda | elétrica | proposta rejeitada
        $p3 = $this->proposal($juliana, $fernanda, $svcEletrica, 180.00, 'rejected', 'pending', now()->subDays(10));
        $conv3 = $this->conversation($p3, $juliana, $fernanda);
        $this->messages($conv3, $juliana, $fernanda, [
            [$juliana,  'Fernanda, preciso trocar o quadro de luz do meu apartamento. Seria urgente.'],
            [$fernanda, 'Oi Juliana! Para troca de quadro o valor mínimo é R$ 200 pelo material e serviço.'],
            [$juliana,  'Entendi, mas meu orçamento está apertado. Enviando proposta com R$ 180.'],
            [$fernanda, 'Infelizmente não consigo cobrir o custo do material por esse valor. Vou ter que recusar.'],
            [$juliana,  'Tudo bem, obrigada pela atenção!'],
        ]);

        // 4. Thiago → Fernanda | hidráulica | contrato ativo (em andamento)
        $p4 = $this->proposal($thiago, $fernanda, $svcHidraulica, 150.00, 'accepted', 'captured', now()->subDays(2));
        $c4 = $this->contract($p4, $svcHidraulica, $thiago, $fernanda, 150.00, 'active', now()->subDays(1));
        $conv4 = $this->conversation($p4, $thiago, $fernanda);
        $this->messages($conv4, $thiago, $fernanda, [
            [$thiago,   'Fernanda, tenho um cano vazando debaixo da pia da cozinha. É urgente!'],
            [$fernanda, 'Oi Thiago! Consigo ir amanhã de manhã. Você tem acesso ao registro geral?'],
            [$thiago,   'Sim, tenho acesso sim. Qual horário você consegue?'],
            [$fernanda, 'Por volta das 9h, pode ser?'],
            [$thiago,   'Perfeito! Te espero. Endereço: Rua das Flores, 123.'],
            [$fernanda, 'Chegando em 10 minutos!'],
            [$thiago,   'Pode vir, portaria já está avisada.'],
        ]);

        // 5. Ana → Ricardo | limpeza | contrato provider_completed aguardando confirmação
        $p5 = $this->proposal($ana, $ricardo, $svcLimpeza, 500.00, 'accepted', 'captured', now()->subDays(5));
        $c5 = $this->contract($p5, $svcLimpeza, $ana, $ricardo, 500.00, 'provider_completed', now()->subDays(3));
        DB::table('contracts')->where('id', $c5)->update([
            'provider_completed_at' => now()->subHours(12),
            'auto_release_at'       => now()->addDays(3)->subHours(12),
        ]);
        $conv5 = $this->conversation($p5, $ana, $ricardo);
        $this->messages($conv5, $ana, $ricardo, [
            [$ana,     'Ricardo, preciso de limpeza pós-obra. A reforma terminou ontem.'],
            [$ricardo, 'Olá Ana! Posso ir em 3 dias. Qual o tamanho do imóvel?'],
            [$ana,     'Apartamento de 80m², tem bastante pó de obra mesmo.'],
            [$ricardo, 'Sem problema, venho com equipe e equipamento próprio.'],
            [$ana,     'Ótimo! Proposta enviada.'],
            [$ricardo, 'Aceito! Combinado para o dia '.now()->subDays(3)->format('d/m').'.'],
            [$ricardo, 'Finalizamos a limpeza. Ficou muito bem! Pode confirmar no sistema quando ver tudo certo?'],
            [$ana,     'Caramba, que diferença! Mas ainda tem umas manchas no banheiro. Pode ver?'],
            [$ricardo, 'Claro! Pode me mandar foto pelo chat que resolvo amanhã.'],
        ]);

        // 6. Bruno → Ricardo | limpeza | contrato em disputa
        $p6 = $this->proposal($bruno, $ricardo, $svcLimpeza, 500.00, 'accepted', 'captured', now()->subDays(15));
        $c6 = $this->contract($p6, $svcLimpeza, $bruno, $ricardo, 500.00, 'disputed', now()->subDays(14));
        DB::table('contracts')->where('id', $c6)->update([
            'provider_completed_at' => now()->subDays(8),
        ]);
        $this->dispute($c6, $bruno, 'O prestador alegou que finalizou o serviço, mas várias áreas ficaram com sujeira visível. Janelas não foram limpas, banheiro com manchas e cozinha com gordura no fogão. Solicitei que voltasse e ele se recusou a retornar sem cobrar a mais.');
        $conv6 = $this->conversation($p6, $bruno, $ricardo);
        $this->messages($conv6, $bruno, $ricardo, [
            [$bruno,   'Ricardo, contratei a limpeza pós-obra. Quando podemos marcar?'],
            [$ricardo, 'Olá Bruno! Semana que vem tenho disponibilidade na terça ou quarta.'],
            [$bruno,   'Terça está ótimo. 8h pode ser?'],
            [$ricardo, 'Confirmado para terça às 8h!'],
            [$ricardo, 'Serviço concluído. Marquei como finalizado no sistema.'],
            [$bruno,   'Ricardo, as janelas não foram limpas e o banheiro continua com manchas. Isso não é o combinado.'],
            [$ricardo, 'Fiz o serviço completo sim. As manchas que você citou são permanentes, não saem com limpeza normal.'],
            [$bruno,   'Não concordo. Vou abrir uma reclamação no sistema.'],
            [$ricardo, 'Faça o que achar necessário, o serviço foi entregue conforme combinado.'],
        ]);

        // 7. Juliana → Carlos | pintura comunitária | concluído
        $p7 = $this->proposal($juliana, $carlos, $svcPinturaComunitaria, 0.00, 'accepted', 'transferred', now()->subDays(45));
        $c7 = $this->contract($p7, $svcPinturaComunitaria, $juliana, $carlos, 0.00, 'contractor_confirmed', now()->subDays(40));
        $this->contractTimestamps($c7, now()->subDays(41), now()->subDays(40));
        $this->review($c7, $svcPinturaComunitaria, $juliana, $carlos, 5, 'Carlos é uma pessoa incrível! Pintou o quarto da minha mãe de graça e ficou maravilhoso. Que Deus abençoe!');
        $conv7 = $this->conversation($p7, $juliana, $carlos);
        $this->messages($conv7, $juliana, $carlos, [
            [$juliana, 'Carlos, vi o serviço comunitário. Minha mãe é idosa e o quarto dela precisa muito de uma pintura.'],
            [$carlos,  'Oi Juliana! Fico feliz em ajudar. Pode me passar o endereço?'],
            [$juliana, 'Rua Esperança, 45 — bairro Vila Nova.'],
            [$carlos,  'Vou dia 20. Pode deixar que vou levar tudo.'],
            [$juliana, 'Muito obrigada! Minha mãe ficou emocionada.'],
            [$carlos,  'Pronto! Ficou bem bonito 😊'],
            [$juliana, 'Carlos não tenho palavras para agradecer. Minha mãe estava com os olhos cheios de lágrimas!'],
        ]);

        // 8. Thiago → Carlos | pintura | proposta cancelada antes da aceitação
        $p8 = $this->proposal($thiago, $carlos, $svcPintura, 350.00, 'cancelled', 'refunded', now()->subDays(20));
        $conv8 = $this->conversation($p8, $thiago, $carlos);
        $this->messages($conv8, $thiago, $carlos, [
            [$thiago,  'Carlos, quero contratar a pintura mas preciso de um prazo específico.'],
            [$carlos,  'Pode falar! Qual data você precisa?'],
            [$thiago,  'Precisaria que fosse na próxima segunda-feira sem falta, tenho visita de família.'],
            [$carlos,  'Infelizmente segunda estou comprometido com outro cliente.'],
            [$thiago,  'Entendi. Vou cancelar a proposta então. Obrigado pela atenção!'],
        ]);

        // 9. Ana → Fernanda | elétrica | auto_completed (liberação automática)
        $p9 = $this->proposal($ana, $fernanda, $svcEletrica, 200.00, 'accepted', 'transferred', now()->subDays(20));
        $c9 = $this->contract($p9, $svcEletrica, $ana, $fernanda, 200.00, 'auto_completed', now()->subDays(18));
        DB::table('contracts')->where('id', $c9)->update([
            'provider_completed_at' => now()->subDays(15),
            'auto_release_at'       => now()->subDays(12),
            'transferred_at'        => now()->subDays(12),
        ]);
        $this->review($c9, $svcEletrica, $ana, $fernanda, 4, 'Serviço bem feito, pontual e organizada. Só não deu 5 estrelas porque demorou um pouquinho mais do que o esperado, mas o resultado foi ótimo.');
        $conv9 = $this->conversation($p9, $ana, $fernanda);
        $this->messages($conv9, $ana, $fernanda, [
            [$ana,      'Fernanda, preciso instalar 3 tomadas novas na cozinha e uma no quarto.'],
            [$fernanda, 'Oi Ana! Consigo na semana que vem. Quarta-feira às 14h seria bom?'],
            [$ana,      'Ótimo! Confirmado.'],
            [$fernanda, 'Terminei a instalação. Tudo funcionando, testei cada tomada.'],
            [$ana,      'Muito obrigada Fernanda! Ficou ótimo.'],
            [$fernanda, 'Pode confirmar o recebimento no app quando tiver um momento.'],
            [$ana,      'Vou confirmar sim! Desculpa a demora, estava viajando.'],
        ]);

        // 10. Juliana → Ricardo | limpeza | proposta pendente recente
        $p10 = $this->proposal($juliana, $ricardo, $svcLimpeza, 450.00, 'pending', 'pending', now()->subHours(2));
        $conv10 = $this->conversation($p10, $juliana, $ricardo);
        $this->messages($conv10, $juliana, $ricardo, [
            [$juliana, 'Ricardo, preciso de limpeza na minha casa antes de uma festa de aniversário no sábado!'],
            [$ricardo, 'Oi Juliana! Que dia você precisa? Sexta à tarde tenho espaço.'],
            [$juliana, 'Sexta seria perfeito! Vou enviar a proposta agora.'],
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private function service(User $provider, Category $category, string $title, string $desc, ?float $price, bool $acceptsOffer, bool $isCommunity, ?string $imageUrl = null): int
    {
        return DB::table('services')->insertGetId([
            'uuid'          => Str::uuid(),
            'user_id'       => $provider->id,
            'category_id'   => $category->id,
            'title'         => $title,
            'description'   => $desc,
            'base_price'    => $price,
            'accepts_offer' => $acceptsOffer,
            'is_community'  => $isCommunity,
            'image_url'     => $imageUrl,
            'status'        => 'active',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    private function proposal(User $contractor, User $provider, int $serviceId, float $price, string $status, string $paymentStatus, Carbon $createdAt): object
    {
        $rate = $price >= 1000 ? 0.10 : ($price >= 100 ? 0.15 : 0.30);
        $fee  = round($price * $rate, 2);
        $net  = round($price - $fee, 2);

        $id = DB::table('proposals')->insertGetId([
            'uuid'                    => Str::uuid(),
            'service_id'              => $serviceId,
            'contractor_id'           => $contractor->id,
            'provider_id'             => $provider->id,
            'offered_price'           => $price,
            'platform_fee_rate'       => $rate,
            'platform_fee_amount'     => $fee,
            'provider_amount'         => $net,
            'description'             => fake('pt_BR')->sentence(10),
            'status'                  => $status,
            'schedule_type'           => 'to_be_arranged',
            'schedule_agreed'         => true,
            'schedule_agreed_at'      => $createdAt,
            'stripe_payment_intent_id'=> 'pi_demo_' . Str::random(20),
            'payment_status'          => $paymentStatus,
            'created_at'              => $createdAt,
            'updated_at'              => $createdAt,
        ]);

        return (object) ['id' => $id];
    }

    private function contract(object $proposal, int $serviceId, User $contractor, User $provider, float $price, string $status, Carbon $createdAt): int
    {
        $rate = $price >= 1000 ? 0.10 : ($price >= 100 ? 0.15 : 0.30);
        $fee  = round($price * $rate, 2);
        $net  = round($price - $fee, 2);

        return DB::table('contracts')->insertGetId([
            'uuid'                => Str::uuid(),
            'proposal_id'         => $proposal->id,
            'service_id'          => $serviceId,
            'contractor_id'       => $contractor->id,
            'provider_id'         => $provider->id,
            'agreed_price'        => $price,
            'platform_fee_rate'   => $rate,
            'platform_fee_amount' => $fee,
            'provider_amount'     => $net,
            'scheduled_at'        => $createdAt->copy()->addDays(2),
            'status'              => $status,
            'created_at'          => $createdAt,
            'updated_at'          => $createdAt,
        ]);
    }

    private function contractTimestamps(int $contractId, Carbon $providerAt, Carbon $contractorAt): void
    {
        DB::table('contracts')->where('id', $contractId)->update([
            'provider_completed_at'  => $providerAt,
            'contractor_confirmed_at' => $contractorAt,
            'transferred_at'         => $contractorAt,
        ]);
    }

    private function review(int $contractId, int $serviceId, User $reviewer, User $reviewed, int $stars, string $comment): void
    {
        $contract = DB::table('contracts')->where('id', $contractId)->first();
        DB::table('reviews')->insert([
            'uuid'        => Str::uuid(),
            'contract_id' => $contractId,
            'service_id'  => $serviceId,
            'reviewer_id' => $reviewer->id,
            'reviewed_id' => $reviewed->id,
            'stars'       => $stars,
            'comment'     => $comment,
            'trigger'     => 'completed',
            'created_at'  => $contract->updated_at,
            'updated_at'  => $contract->updated_at,
        ]);
    }

    private function dispute(int $contractId, User $raisedBy, string $reason): void
    {
        $contract = DB::table('contracts')->where('id', $contractId)->first();
        DB::table('disputes')->insert([
            'uuid'        => Str::uuid(),
            'contract_id' => $contractId,
            'raised_by_id'=> $raisedBy->id,
            'reason'      => $reason,
            'status'      => 'under_review',
            'created_at'  => now()->subDays(7),
            'updated_at'  => now()->subDays(7),
        ]);
    }

    private function conversation(object $proposal, User $contractor, User $provider): object
    {
        $id = DB::table('conversations')->insertGetId([
            'uuid'            => Str::uuid(),
            'proposal_id'     => $proposal->id,
            'contractor_id'   => $contractor->id,
            'provider_id'     => $provider->id,
            'last_message_at' => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
        return (object) ['id' => $id];
    }

    private function messages(object $conversation, User $userA, User $userB, array $lines): void
    {
        $total  = count($lines);
        $baseAt = now()->subMinutes($total * 3);

        foreach ($lines as $i => [$sender, $text]) {
            $sentAt = $baseAt->copy()->addMinutes($i * 3);
            DB::table('messages')->insert([
                'uuid'            => Str::uuid(),
                'conversation_id' => $conversation->id,
                'sender_id'       => $sender->id,
                'body'            => $text,
                'read_at'         => $sentAt->copy()->addMinutes(1),
                'created_at'      => $sentAt,
                'updated_at'      => $sentAt,
            ]);
        }

        DB::table('conversations')->where('id', $conversation->id)->update([
            'last_message_at' => $baseAt->copy()->addMinutes(($total - 1) * 3),
        ]);
    }
}
