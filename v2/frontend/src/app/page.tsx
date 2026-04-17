import Link from 'next/link'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Shield, Star, Users, CheckCircle, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-primary/5 to-background">
        <Badge variant="secondary" className="mb-4">Marketplace de Serviços</Badge>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground max-w-3xl mb-6">
          Conecte-se com profissionais de confiança
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-10">
          O Trabalho Amigo conecta quem precisa de um serviço com prestadores qualificados.
          Seguro, rápido e transparente.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/services">
              Buscar serviços <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register?role=provider">Seja um prestador</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Por que usar o Trabalho Amigo?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: 'Pagamento seguro',
                desc: 'O pagamento fica protegido até você confirmar que o serviço foi realizado.',
              },
              {
                icon: <Star className="h-8 w-8 text-primary" />,
                title: 'Profissionais avaliados',
                desc: 'Veja avaliações reais de outros clientes antes de contratar.',
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: 'Serviços comunitários',
                desc: 'Prestadores podem oferecer até 3 serviços gratuitos para a comunidade.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-background rounded-2xl p-6 shadow-sm border">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Para quem contrata
              </h3>
              {[
                'Busque o serviço que precisa',
                'Envie uma proposta com seu orçamento',
                'O prestador aceita e o serviço é realizado',
                'Confirme o serviço e o pagamento é liberado',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Para prestadores
              </h3>
              {[
                'Cadastre seus serviços com preços',
                'Receba propostas de clientes',
                'Aceite e execute o serviço',
                'Receba o pagamento automaticamente',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
        <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
          Crie sua conta gratuitamente e comece a usar o Trabalho Amigo hoje mesmo.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Criar conta grátis</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Trabalho Amigo. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
