import client from '../data/client.json'

export function ClientCard() {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-lg text-[var(--ink)]">Client</h2>
        <span className="text-xs text-[var(--muted)]">
          Prefill from CRM token (demo)
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <dt className="text-[var(--muted)]">Name</dt>
          <dd className="m-0 font-medium">{client?.name}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Age / DOB</dt>
          <dd className="m-0 font-medium">
            {client?.age} · {client?.dob}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">State</dt>
          <dd className="m-0 font-medium">{client?.state}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Gender</dt>
          <dd className="m-0 font-medium">{client?.gender}</dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-[var(--muted)]">Client ID</dt>
          <dd className="m-0 font-mono text-xs">{client?.clientId}</dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-[var(--muted)]">Agent ID</dt>
          <dd className="m-0 font-mono text-xs">{client?.agentId}</dd>
        </div>
      </dl>
    </section>
  )
}
