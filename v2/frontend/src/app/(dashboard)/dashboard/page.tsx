'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Briefcase,
  FileText,
  ScrollText,
  TrendingUp,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth'
import { servicesApi, proposalsApi, contractsApi } from '@/lib/api'
import { formatBRL, formatDate, statusLabel, statusColor } from '@/lib/utils'
import type { Service, Proposal, Contract } from '@/types'

function StatCard({
  title,
  value,
  icon,
  href,
  loading,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  href: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold mt-1">{value}</p>
            )}
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground" asChild>
            <Link href={href} className="flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isProvider = user?.role === 'provider'

  const { data: myServices, isLoading: loadingServices } = useQuery({
    queryKey: ['my-services'],
    queryFn: () => servicesApi.listMy().then((r) => r.data.data as Service[]),
    enabled: isProvider,
  })

  const { data: sentProposals, isLoading: loadingSent } = useQuery({
    queryKey: ['proposals-sent'],
    queryFn: () => proposalsApi.listSent().then((r) => r.data.data as Proposal[]),
    enabled: !isProvider,
  })

  const { data: receivedProposals, isLoading: loadingReceived } = useQuery({
    queryKey: ['proposals-received'],
    queryFn: () => proposalsApi.listReceived().then((r) => r.data.data as Proposal[]),
    enabled: isProvider,
  })

  const { data: contracts, isLoading: loadingContracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsApi.list().then((r) => r.data.data as Contract[]),
  })

  const proposals = isProvider ? receivedProposals : sentProposals
  const loadingProposals = isProvider ? loadingReceived : loadingSent
  const pendingProposals = proposals?.filter((p) => p.status === 'pending') ?? []
  const activeContracts = contracts?.filter((c) => c.status === 'active') ?? []
  const recentContracts = contracts?.slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.first_name}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aqui está um resumo da sua atividade no Trabalho Amigo.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isProvider && (
          <StatCard
            title="Meus Serviços"
            value={myServices?.length ?? 0}
            icon={<Briefcase className="h-5 w-5" />}
            href="/dashboard/services"
            loading={loadingServices}
          />
        )}
        <StatCard
          title={isProvider ? 'Propostas Recebidas' : 'Propostas Enviadas'}
          value={pendingProposals.length}
          icon={<FileText className="h-5 w-5" />}
          href="/proposals"
          loading={loadingProposals}
        />
        <StatCard
          title="Contratos Ativos"
          value={activeContracts.length}
          icon={<ScrollText className="h-5 w-5" />}
          href="/contracts"
          loading={loadingContracts}
        />
        {!isProvider && (
          <StatCard
            title="Total de Propostas"
            value={proposals?.length ?? 0}
            icon={<TrendingUp className="h-5 w-5" />}
            href="/proposals"
            loading={loadingProposals}
          />
        )}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent proposals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Propostas Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/proposals" className="text-xs">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingProposals ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : proposals && proposals.length > 0 ? (
              <div className="space-y-2">
                {proposals.slice(0, 5).map((p) => (
                  <Link
                    key={p.uuid}
                    href={`/proposals/${p.uuid}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.service?.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(p.created_at)}
                      </p>
                    </div>
                    <Badge
                      className={`ml-2 text-xs ${statusColor(p.status)}`}
                      variant="outline"
                    >
                      {statusLabel(p.status)}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Nenhuma proposta ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent contracts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Contratos Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/contracts" className="text-xs">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingContracts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : recentContracts.length > 0 ? (
              <div className="space-y-2">
                {recentContracts.map((c) => (
                  <Link
                    key={c.uuid}
                    href={`/contracts/${c.uuid}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {c.proposal?.service?.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatBRL(c.price)}
                        {c.scheduled_at && ` · ${formatDate(c.scheduled_at)}`}
                      </p>
                    </div>
                    <Badge
                      className={`ml-2 text-xs ${statusColor(c.status)}`}
                      variant="outline"
                    >
                      {statusLabel(c.status)}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Nenhum contrato ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ações rápidas</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/services">Buscar serviços</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/proposals">Ver propostas</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/contracts">Ver contratos</Link>
            </Button>
            {isProvider && (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/services">Meus serviços</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/services/new">Criar serviço</Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
