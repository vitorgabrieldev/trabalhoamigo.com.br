'use client'

import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { ProposalCard } from '@/components/proposals/ProposalCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { proposalsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Proposal } from '@/types'

export default function ProposalsPage() {
  const { user } = useAuthStore()
  const isProvider = user?.role === 'provider'

  const { data: sentProposals, isLoading: loadingSent, isError: errSent } = useQuery({
    queryKey: ['proposals-sent'],
    queryFn: () => proposalsApi.listSent().then((r) => r.data.data as Proposal[]),
    enabled: !isProvider,
  })

  const { data: receivedProposals, isLoading: loadingReceived, isError: errReceived } = useQuery({
    queryKey: ['proposals-received'],
    queryFn: () => proposalsApi.listReceived().then((r) => r.data.data as Proposal[]),
    enabled: isProvider,
  })

  if (isProvider) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propostas Recebidas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Propostas enviadas por contratantes para seus serviços
          </p>
        </div>

        {errReceived && (
          <Alert variant="destructive">Erro ao carregar propostas. Tente novamente.</Alert>
        )}

        {loadingReceived ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : receivedProposals && receivedProposals.length > 0 ? (
          <div className="space-y-3">
            {receivedProposals.map((p) => (
              <ProposalCard key={p.uuid} proposal={p} viewAs="provider" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma proposta recebida</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Propostas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe as propostas que você enviou
        </p>
      </div>

      {errSent && (
        <Alert variant="destructive">Erro ao carregar propostas. Tente novamente.</Alert>
      )}

      {loadingSent ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : sentProposals && sentProposals.length > 0 ? (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todas ({sentProposals.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pendentes ({sentProposals.filter((p) => p.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Aceitas ({sentProposals.filter((p) => p.status === 'accepted').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {sentProposals.map((p) => (
              <ProposalCard key={p.uuid} proposal={p} viewAs="contractor" />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {sentProposals
              .filter((p) => p.status === 'pending')
              .map((p) => (
                <ProposalCard key={p.uuid} proposal={p} viewAs="contractor" />
              ))}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-3 mt-4">
            {sentProposals
              .filter((p) => p.status === 'accepted')
              .map((p) => (
                <ProposalCard key={p.uuid} proposal={p} viewAs="contractor" />
              ))}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma proposta enviada</p>
          <p className="text-sm text-muted-foreground mt-1">
            Explore os serviços disponíveis e faça uma proposta
          </p>
        </div>
      )}
    </div>
  )
}
