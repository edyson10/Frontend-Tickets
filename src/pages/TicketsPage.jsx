import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ticketsApi } from '../api/tickets.api.js'
import { useAuth } from '../auth/useAuth.js'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ErrorState, EmptyState } from '../components/ui/EmptyState.jsx'
import { Pagination } from '../components/ui/Pagination.jsx'
import { TicketFilters } from '../components/tickets/TicketFilters.jsx'
import { TicketTable } from '../components/tickets/TicketTable.jsx'

const DEFAULT_FILTERS = { page: 1, pageSize: 10 }

export default function TicketsPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const canCreate = user.role === 'admin' || user.role === 'agent'

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tickets', filters, user.id],
    queryFn: () => ticketsApi.list(filters, user),
    placeholderData: (previous) => previous,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-sm text-slate-500">
            {user.role === 'agent'
              ? 'Tickets asignados a ti o creados por ti.'
              : 'Listado completo de tickets de soporte.'}
          </p>
        </div>
        {canCreate && (
          <Link to="/tickets/new">
            <Button>+ Nuevo ticket</Button>
          </Link>
        )}
      </div>

      <Card title="Filtros">
        <TicketFilters filters={filters} onChange={setFilters} />
      </Card>

      <Card bodyClassName="p-0">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner label="Cargando tickets..." />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorState message={error.message} />
          </div>
        ) : data.data.length === 0 ? (
          <EmptyState title="No hay tickets" description="Ajusta los filtros o crea un nuevo ticket." />
        ) : (
          <>
            <TicketTable tickets={data.data} />
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          </>
        )}
      </Card>
    </div>
  )
}
