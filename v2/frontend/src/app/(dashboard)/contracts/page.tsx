'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ScrollText } from 'lucide-react'
import { ContractCard } from '@/components/contracts/ContractCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { contractsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Contract } from '@/types'

export default function ContractsPage() {
  const { user } = useAuthStore()
  const isProvider = user?.role === 'provider'
  const [tab, setTab] = useState('all')

  const statusFilter = tab !== 'all' ? tab : undefined

  const { data: contracts, isLoading, isError } = useQuery({
    queryKey: ['contracts', tab],
    queryFn: () =>
      contractsApi.list(statusFilter).then((r) => r.data.data as Contract[]),
  })

  const viewAs = isProvider ? 'provider' : 'contractor'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe o andamento dos seus contratos
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">Erro ao carregar contratos. Tente novamente.</Alert>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="provider_completed">Aguardando confirmação</TabsTrigger>
          <TabsTrigger value="contractor_confirmed">Concluídos</TabsTrigger>
          <TabsTrigger value="disputed">Em disputa</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
            </div>
          ) : contracts && contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <ContractCard key={contract.uuid} contract={contract} viewAs={viewAs} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <ScrollText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Não há nada aqui :\</p>
              <p className="text-sm text-muted-foreground mt-1">
                {tab === 'all'
                  ? 'Seus contratos aparecerão aqui quando propostas forem aceitas'
                  : 'Não há nada aqui :\\' }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
