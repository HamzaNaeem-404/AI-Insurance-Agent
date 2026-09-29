import client from '../data/client.json'

export function ClientCard() {
  return (
    <section className="panel overflow-hidden">
      <div className="panel-header">
        <h2 className="panel-title">Client record</h2>
        <span className="text-[0.6875rem] font-medium uppercase tracking-wide text-[var(--muted)]">
          Loaded from CRM launch token
        </span>
      </div>
      <div className="panel-body">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-[var(--navy)]">{client?.name}</div>
            <div className="text-sm text-[var(--muted)]">
              {client?.age} yrs · {client?.gender} · {client?.state}
            </div>
          </div>
          <span className="status-pill bg-[var(--ok-bg)] text-[var(--ok)]">Active session</span>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[var(--line)] pt-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[0.6875rem] uppercase tracking-wide text-[var(--muted)]">DOB</dt>
            <dd className="m-0 font-medium">{client?.dob}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] uppercase tracking-wide text-[var(--muted)]">Phone</dt>
            <dd className="m-0 font-medium">{client?.phone}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] uppercase tracking-wide text-[var(--muted)]">Client ID</dt>
            <dd className="m-0 font-mono text-xs">{client?.clientId}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] uppercase tracking-wide text-[var(--muted)]">Agent ID</dt>
            <dd className="m-0 font-mono text-xs">{client?.agentId}</dd>
          </div>
        </dl>
        {client?.address ? (
          <p className="mb-0 mt-3 text-xs text-[var(--muted)]">{client.address}</p>
        ) : null}
      </div>
    </section>
  )
}
