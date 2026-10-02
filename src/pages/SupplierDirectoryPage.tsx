import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SupplierDirectoryList from '../components/suppliers/SupplierDirectoryList'
import SupplierForm from '../components/suppliers/SupplierForm'
import { Btn, Empty, Icon, Select, Skel, Tabs } from '../components/ds'
import { useCreateSupplierCompany, useSetSupplierActive, useSupplierDirectory } from '../hooks/useSupplierDirectory'
import type { ApiError } from '../api/client'
import { FormFeedback, toast } from '../components/ui'

const ALL = 'all'

export default function SupplierDirectoryPage() {
  const { t } = useTranslation('common')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [tag, setTag] = useState(ALL)
  const [location, setLocation] = useState(ALL)
  const [showAdd, setShowAdd] = useState(false)
  const { data: suppliers, isLoading } = useSupplierDirectory(query, true)
  const createSupplier = useCreateSupplierCompany()
  const setActive = useSetSupplierActive()

  const active = useMemo(() => (suppliers ?? []).filter(supplier => supplier.is_active), [suppliers])
  const archived = useMemo(() => (suppliers ?? []).filter(supplier => !supplier.is_active), [suppliers])
  const pool = tab === 'active' ? active : archived

  const tags = useMemo(() => {
    const values = new Set<string>()
    for (const supplier of pool) for (const item of supplier.tags ?? []) values.add(item)
    return [...values].sort((a, b) => a.localeCompare(b))
  }, [pool])

  const locations = useMemo(() => {
    const values = new Set<string>()
    for (const supplier of pool) {
      const place = [supplier.city, supplier.country].filter(Boolean).join(', ')
      if (place) values.add(place)
    }
    return [...values].sort((a, b) => a.localeCompare(b))
  }, [pool])

  const tagFilter = tags.includes(tag) ? tag : ALL
  const locationFilter = locations.includes(location) ? location : ALL

  const visible = useMemo(() => pool.filter((supplier) => {
    if (tagFilter !== ALL && !(supplier.tags ?? []).includes(tagFilter)) return false
    if (locationFilter !== ALL) {
      const place = [supplier.city, supplier.country].filter(Boolean).join(', ')
      if (place !== locationFilter) return false
    }
    return true
  }), [pool, tagFilter, locationFilter])

  const filtered = tagFilter !== ALL || locationFilter !== ALL
  const clearFilters = () => { setTag(ALL); setLocation(ALL) }

  return (
    <div className="ds-page sup-page">
      <header className="qy-page-head">
        <div>
          <h1 className="ds-title">{t('suppliers.directory.title')}</h1>
        </div>
        <Btn
          variant={showAdd ? 'secondary' : 'primary'}
          size="md"
          icon="add"
          aria-expanded={showAdd}
          onClick={() => setShowAdd(open => !open)}
        >
          {t('suppliers.directory.addSupplier')}
        </Btn>
      </header>

      {showAdd && (
        <section className="ds-add-panel" aria-labelledby="add-supplier-title">
          <h2 id="add-supplier-title">{t('suppliers.directory.dialogTitle')}</h2>
          <SupplierForm
            onSubmit={(data) => createSupplier.mutate(data, { onSuccess: () => { setShowAdd(false); toast(t('suppliers.directory.created')) } })}
            onCancel={() => setShowAdd(false)}
            isPending={createSupplier.isPending}
          />
          {createSupplier.error && (
            <FormFeedback>{(createSupplier.error as ApiError).detail || t('suppliers.directory.createError')}</FormFeedback>
          )}
        </section>
      )}

      <div className="sup-toolbar">
        <label className="ds-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t('suppliers.directory.searchPlaceholder')}
            title={t('suppliers.directory.searchPlaceholder')}
            aria-label={t('suppliers.directory.searchPlaceholder')}
          />
        </label>
        {tags.length > 0 && (
          <Select
            compact
            value={tagFilter}
            onValueChange={setTag}
            ariaLabel={t('suppliers.directory.filters.tag')}
            options={[
              { value: ALL, label: t('suppliers.directory.filters.allTags') },
              ...tags.map(item => ({ value: item, label: item })),
            ]}
          />
        )}
        {locations.length > 1 && (
          <Select
            compact
            value={locationFilter}
            onValueChange={setLocation}
            ariaLabel={t('suppliers.directory.filters.location')}
            options={[
              { value: ALL, label: t('suppliers.directory.filters.allLocations') },
              ...locations.map(item => ({ value: item, label: item })),
            ]}
          />
        )}
        {filtered && (
          <Btn variant="text" size="sm" onClick={clearFilters}>{t('suppliers.directory.filters.clear')}</Btn>
        )}
      </div>

      {isLoading ? (
        <div className="qy-card qy-card-body" aria-busy>
          <Skel h={44} />
          <Skel h={220} className="sup-skel" />
        </div>
      ) : (
        <>
          <Tabs
            layoutId="sup-tabs"
            label={t('suppliers.directory.title')}
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'active', label: t('suppliers.directory.tabs.active'), count: active.length },
              { id: 'archived', label: t('suppliers.directory.tabs.archived'), count: archived.length },
            ]}
          />
          {visible.length === 0 ? (
            <div className="ds-empty">
              {query.trim() ? (
                <Empty
                  icon="suppliers"
                  title={t('suppliers.directory.noMatch', { query: query.trim() })}
                  description={t('suppliers.directory.searchScope')}
                />
              ) : tab === 'archived' ? (
                <Empty icon="suppliers" title={t('suppliers.directory.noArchived')} />
              ) : filtered ? (
                <Empty
                  icon="filter_list"
                  title={t('suppliers.directory.filters.noMatch')}
                  description={t('suppliers.directory.filters.noMatchHint')}
                  action={<Btn variant="secondary" onClick={clearFilters}>{t('suppliers.directory.filters.clear')}</Btn>}
                />
              ) : (
                <Empty
                  icon="suppliers"
                  title={t('suppliers.list.emptyTitle')}
                  description={t('suppliers.list.emptyDescription')}
                />
              )}
            </div>
          ) : (
            <SupplierDirectoryList
              suppliers={visible}
              onRestore={tab === 'archived'
                ? (id) => setActive.mutate(
                  { id, isActive: true },
                  { onSuccess: () => toast(t('suppliers.directory.restored')) },
                )
                : undefined}
            />
          )}
        </>
      )}
    </div>
  )
}
