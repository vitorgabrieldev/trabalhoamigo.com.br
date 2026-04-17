<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    private array $categories = [
        ['name' => 'Elétrica', 'slug' => 'eletrica', 'description' => 'Instalações e reparos elétricos'],
        ['name' => 'Jardinagem', 'slug' => 'jardinagem', 'description' => 'Paisagismo e manutenção de jardins'],
        ['name' => 'Construção', 'slug' => 'construcao', 'description' => 'Obras e reformas'],
        ['name' => 'Limpeza', 'slug' => 'limpeza', 'description' => 'Limpeza residencial e comercial'],
        ['name' => 'Tecnologia', 'slug' => 'tecnologia', 'description' => 'Suporte técnico e desenvolvimento'],
        ['name' => 'Transporte', 'slug' => 'transporte', 'description' => 'Mudanças e entregas'],
        ['name' => 'Pintura', 'slug' => 'pintura', 'description' => 'Pintura residencial e comercial'],
        ['name' => 'Marcenaria', 'slug' => 'marcenaria', 'description' => 'Móveis sob medida e reparos'],
        ['name' => 'Climatização', 'slug' => 'climatizacao', 'description' => 'Instalação e manutenção de ar-condicionado'],
        ['name' => 'Segurança', 'slug' => 'seguranca', 'description' => 'Câmeras, alarmes e segurança patrimonial'],
        ['name' => 'Gastronomia', 'slug' => 'gastronomia', 'description' => 'Culinária, buffet e confeitaria'],
        ['name' => 'Educação', 'slug' => 'educacao', 'description' => 'Aulas particulares e tutoria'],
        ['name' => 'Automotivo', 'slug' => 'automotivo', 'description' => 'Mecânica e estética automotiva'],
        ['name' => 'Beleza', 'slug' => 'beleza', 'description' => 'Cabelo, maquiagem e estética'],
        ['name' => 'Eventos', 'slug' => 'eventos', 'description' => 'Organização e produção de eventos'],
        ['name' => 'Fotografia', 'slug' => 'fotografia', 'description' => 'Fotografias e videografia'],
        ['name' => 'Design', 'slug' => 'design', 'description' => 'Design gráfico e digital'],
        ['name' => 'Arquitetura', 'slug' => 'arquitetura', 'description' => 'Projetos arquitetônicos'],
        ['name' => 'Marketing', 'slug' => 'marketing', 'description' => 'Marketing digital e comunicação'],
        ['name' => 'Logística', 'slug' => 'logistica', 'description' => 'Gestão de estoque e entregas'],
        ['name' => 'Recursos Humanos', 'slug' => 'recursos-humanos', 'description' => 'Recrutamento e gestão de pessoas'],
        ['name' => 'Consultoria Financeira', 'slug' => 'consultoria-financeira', 'description' => 'Planejamento financeiro e contabilidade'],
        ['name' => 'Consultoria Jurídica', 'slug' => 'consultoria-juridica', 'description' => 'Assessoria jurídica'],
        ['name' => 'Psicologia', 'slug' => 'psicologia', 'description' => 'Acompanhamento psicológico'],
        ['name' => 'Fisioterapia', 'slug' => 'fisioterapia', 'description' => 'Reabilitação física'],
        ['name' => 'Nutrição', 'slug' => 'nutricao', 'description' => 'Orientação nutricional'],
        ['name' => 'Treinamento Físico', 'slug' => 'treinamento-fisico', 'description' => 'Personal trainer'],
        ['name' => 'Veterinária', 'slug' => 'veterinaria', 'description' => 'Cuidados com animais'],
        ['name' => 'Agricultura', 'slug' => 'agricultura', 'description' => 'Serviços rurais e agrícolas'],
        ['name' => 'Turismo', 'slug' => 'turismo', 'description' => 'Guias e agências de viagem'],
        ['name' => 'Tradução', 'slug' => 'traducao', 'description' => 'Tradução e interpretação'],
        ['name' => 'Moda', 'slug' => 'moda', 'description' => 'Costura e estilismo'],
        ['name' => 'Engenharia', 'slug' => 'engenharia', 'description' => 'Projetos e laudos de engenharia'],
        ['name' => 'Seguros', 'slug' => 'seguros', 'description' => 'Corretagem de seguros'],
        ['name' => 'Desenvolvimento Pessoal', 'slug' => 'desenvolvimento-pessoal', 'description' => 'Coaching e mentoria'],
        ['name' => 'Consultoria Ambiental', 'slug' => 'consultoria-ambiental', 'description' => 'Sustentabilidade e meio ambiente'],
        ['name' => 'Administração', 'slug' => 'administracao', 'description' => 'Gestão empresarial'],
        ['name' => 'Auditoria', 'slug' => 'auditoria', 'description' => 'Auditoria e compliance'],
        ['name' => 'Mecânica', 'slug' => 'mecanica', 'description' => 'Manutenção de máquinas e equipamentos'],
        ['name' => 'Manutenção', 'slug' => 'manutencao', 'description' => 'Reparos gerais e manutenção predial'],
    ];

    public function run(): void
    {
        foreach ($this->categories as $index => $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'uuid' => Str::uuid(),
                    'name' => $category['name'],
                    'slug' => $category['slug'],
                    'description' => $category['description'],
                    'order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }
    }
}
