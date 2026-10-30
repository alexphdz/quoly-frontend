import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShellLayout } from '../components/layout/useShellLayout'
import SupplierForm from '../components/suppliers/SupplierForm'
import { useCreateSupplierCompany, useSetSupplierActive, useSupplierDirectory } from '../hooks/useSupplierDirectory'
import type { ApiError } from '../api/client'
import type { SupplierCompanyListRead } from '../types/supplierDirectory'
import {
  Avatar, Button, Chip, ContentSection, DataTable, SearchInput, Select, SideSheet, StatusBadge, Tag,
  TextButton, type DataTableColumn,
} from '../design-system'
import { toast } from '../components/ui'

type StatusFilter = 'all' | 'active' | 'archived'
const ALL = 'all'
const EMPTY_SUPPLIERS: SupplierCompanyListRead[] = []

export default function SupplierDirectoryPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const layout = useShellLayout()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('active')
  const [tag, setTag] = useState(ALL)
  const [location, setLocation] = useState(ALL)
  const [showAdd, setShowAdd] = useState(false)
  const { data: suppliers, isLoading, error, refetch } = useSupplierDirectory(query, true)
  const createSupplier = useCreateSupplierCompany()
  const setActive = useSetSupplierActive()

  const allSuppliers = suppliers ?? EMPTY_SUPPLIERS
  const active = useMemo(() => allSuppliers.filter(supplier => supplier.is_active), [allSuppliers])
  const archived = useMemo(() => allSuppliers.filter(supplier => !supplier.is_active), [allSuppliers])
  const pool = status === 'active' ? active : status === 'archived' ? archived : allSuppliers
  const tags = useMemo(() => [...new Set(pool.flatMap(supplier => supplier.tags ?? []))].sort((a, b) => a.localeCompare(b)), [pool])
  const locations = useMemo(() => [...new Set(pool.map(supplier => [supplier.city, supplier.country].filter(Boolean).join(', ')).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [pool])
  const visible = useMemo(() => pool.filter(supplier => {
    if (tag !== ALL && !(supplier.tags ?? []).includes(tag)) return false
    const place = [supplier.city, supplier.country].filter(Boolean).join(', ')
    if (location !== ALL && place !== location) return false
    return true
  }), [pool, tag, location])
  const locallyFiltered = tag !== ALL || location !== ALL
  const clearFilters = () => { setTag(ALL); setLocation(ALL) }

  const columns = useMemo<DataTableColumn<SupplierCompanyListRead>[]>(() => [
    {
      key: 'display_name', header: t('suppliers.directory.columns.company'), type: 'identity', minWidth: 240,
      render: supplier => {
        const place = [supplier.city, supplier.country].filter(Boolean).join(', ')
        return <span className="sup-company-cell"><Avatar name={supplier.display_name} kind="organization" /><span className="sup-company-copy"><strong>{supplier.display_name}</strong>{place && <small>{place}</small>}</span>{!supplier.is_active && <StatusBadge tone="neutral" variant="quiet" icon={false}>{t('suppliers.list.archived')}</StatusBadge>}</span>
      },
      sortValue: supplier => supplier.display_name,
      sortable: true,
    },
    {
      key: 'primary_email', header: t('suppliers.directory.columns.contact'), type: 'text', minWidth: 220,
      render: supplier => {
        const primary = supplier.contacts?.find(contact => contact.is_primary) ?? supplier.contacts?.[0]
        return <span className="sup-contact-cell">{primary?.name && <strong>{primary.name}</strong>}<a href={`mailto:${primary?.email ?? supplier.primary_email}`} onClick={event => event.stopPropagation()}>{primary?.email ?? supplier.primary_email}</a></span>
      },
      sortValue: supplier => supplier.contacts?.find(contact => contact.is_primary)?.name ?? supplier.primary_email,
      sortable: true,
    },
    {
      key: 'rfq_count', header: t('suppliers.directory.columns.requests'), type: 'number', width: 140,
      render: supplier => <span className="sup-rfq-count">{t('suppliers.directory.requestCount', { count: supplier.rfq_count })}</span>,
      sortValue: supplier => supplier.rfq_count,
      sortable: true,
    },
    {
      key: 'tags', header: t('suppliers.directory.columns.tags'), type: 'text', minWidth: 220,
      render: supplier => <span className="sup-tags">{(supplier.tags ?? []).slice(0, 3).map(value => <Tag key={value} variant="outline">{value}</Tag>)}{(supplier.tags?.length ?? 0) > 3 && <small>{t('suppliers.list.moreTags', { count: supplier.tags!.length - 3 })}</small>}</span>,
      sortValue: supplier => (supplier.tags ?? []).join(', '),
    },
    ...(status === 'archived' ? [{
      key: 'restore', header: '', type: 'actions' as const, width: 120,
      render: (supplier: SupplierCompanyListRead) => <TextButton onClick={() => setActive.mutate({ id: supplier.id, isActive: true }, { onSuccess: () => toast(t('suppliers.directory.restored')) })}>{t('suppliers.directory.restore')}</TextButton>,
    }] : []),
    {
      key: 'open', header: '', type: 'actions', width: 140,
      primary: supplier => <TextButton iconEnd="caret-right" onClick={() => navigate(`/suppliers/${supplier.id}`)}>{t('suppliers.directory.viewSupplier')}</TextButton>,
    },
  ], [status, setActive, t, navigate])

  const tableState = isLoading ? 'loading' : error ? 'error' : visible.length === 0
    ? (query.trim() || locallyFiltered ? 'no-results' : 'empty')
    : 'ready'
  const emptyAction = <Button icon="plus" onClick={() => setShowAdd(true)}>{t('suppliers.directory.addSupplier')}</Button>
  const noResultsAction = locallyFiltered ? <TextButton onClick={clearFilters}>{t('suppliers.directory.filters.clear')}</TextButton> : undefined

  return (
    <div className="ds-page sup-page">
      <header className="sup-heading">
        <div><h1>{t('suppliers.directory.title')}</h1><p>{t('suppliers.directory.subtitle')}</p></div>
        <Button icon="plus" onClick={() => setShowAdd(true)}>{t('suppliers.directory.addSupplier')}</Button>
      </header>

      <section className="sup-summary" aria-live="polite">
        <div><strong>{active.length}</strong><span>{t('suppliers.directory.activeCount')}</span></div>
        <span className="sup-archive-count"><b>{archived.length}</b> {t('suppliers.directory.archivedCount')}</span>
        <small>{t('suppliers.directory.showing', { count: visible.length })}</small>
      </section>

      <div className="sup-toolbar" role="search">
        <SearchInput
          value={query}
          onChange={event => setQuery(event.target.value)}
          onClear={() => setQuery('')}
          clearLabel={t('actions.clearSearch')}
          placeholder={t('suppliers.directory.searchSupplier')}
          aria-label={t('suppliers.directory.searchSupplier')}
        />
        <div className="sup-filters">
          <Select size="sm" label={t('suppliers.directory.filters.tag')} aria-label={t('suppliers.directory.filters.tag')} value={tag} onChange={event => setTag(event.target.value)} options={[{ value: ALL, label: t('suppliers.directory.filters.allTags') }, ...tags.map(value => ({ value, label: value }))]} />
          {locations.length > 1 && <Select size="sm" label={t('suppliers.directory.filters.location')} aria-label={t('suppliers.directory.filters.location')} value={location} onChange={event => setLocation(event.target.value)} options={[{ value: ALL, label: t('suppliers.directory.filters.allLocations') }, ...locations.map(value => ({ value, label: value }))]} />}
          <div className="sup-status-chips" role="group" aria-label={t('suppliers.directory.filters.status')}>
            {(['all', 'active', 'archived'] as const).map(value => <Chip key={value} selected={status === value} count={value === 'all' ? suppliers?.length ?? 0 : value === 'active' ? active.length : archived.length} onClick={() => setStatus(value)}>{t(`suppliers.directory.status.${value}`)}</Chip>)}
          </div>
        </div>
      </div>

      {layout === 'mobile' && tableState !== 'loading' && tableState !== 'error' ? (
        <ul className="sup-mobile-list" aria-label={t('suppliers.directory.title')}>
          {visible.map(supplier => {
            const primary = supplier.contacts?.find(contact => contact.is_primary) ?? supplier.contacts?.[0]
            return <li key={supplier.id}>
              <button type="button" onClick={() => navigate(`/suppliers/${supplier.id}`)} aria-label={t('suppliers.directory.openSupplier', { name: supplier.display_name })}>
                <span className="sup-mobile-name">{supplier.display_name}{!supplier.is_active && <StatusBadge tone="neutral" variant="quiet" icon={false}>{t('suppliers.list.archived')}</StatusBadge>}</span>
                <span className="sup-mobile-contact">{primary?.name ? `${primary.name} · ${primary.email}` : primary?.email || supplier.primary_email}</span>
                <span className="sup-mobile-rfq-count">{t('suppliers.directory.requestCount', { count: supplier.rfq_count })}</span>
                <span className="sup-tags">{(supplier.tags ?? []).slice(0, 3).map(value => <Tag key={value} variant="outline">{value}</Tag>)}</span>
              </button>
              {!supplier.is_active && <TextButton onClick={() => setActive.mutate({ id: supplier.id, isActive: true }, { onSuccess: () => toast(t('suppliers.directory.restored')) })}>{t('suppliers.directory.restore')}</TextButton>}
            </li>
          })}
          {visible.length === 0 && <li className="sup-mobile-empty">{query || locallyFiltered ? t('suppliers.directory.noResults') : t('suppliers.list.emptyTitle')}</li>}
        </ul>
      ) : <ContentSection>
        <DataTable
          columns={columns}
          rows={visible}
          rowKey="id"
          rowLabel={supplier => t('suppliers.directory.openSupplier', { name: supplier.display_name })}
          onRowClick={supplier => navigate(`/suppliers/${supplier.id}`)}
          state={tableState}
          skeletonRows={7}
          caption={t('suppliers.directory.title')}
          empty={{ title: t('suppliers.list.emptyTitle'), text: t('suppliers.list.emptyDescription'), action: emptyAction }}
          noResults={{ title: t('suppliers.directory.noResults'), text: query.trim() ? t('suppliers.directory.searchScope') : t('suppliers.directory.filters.noMatchHint'), action: noResultsAction }}
          error={{ title: t('suppliers.directory.loadError'), text: (error as ApiError | null)?.detail || t('suppliers.directory.loadErrorText'), retryLabel: t('actions.retry'), onRetry: refetch }}
          density="comfortable"
          className="sup-data-table"
        />
      </ContentSection>}

      <SideSheet open={showAdd} onClose={() => setShowAdd(false)} title={t('suppliers.directory.dialogTitle')} description={t('suppliers.directory.formDescription')}>
        <SupplierForm
          onSubmit={data => createSupplier.mutate(data, { onSuccess: () => { setShowAdd(false); toast(t('suppliers.directory.created')) } })}
          onCancel={() => setShowAdd(false)}
          isPending={createSupplier.isPending}
        />
        {createSupplier.error && <p className="sup-form-error" role="alert">{(createSupplier.error as ApiError).detail || t('suppliers.directory.createError')}</p>}
      </SideSheet>
    </div>
  )
}
