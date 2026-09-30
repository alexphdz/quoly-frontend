import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SupplierContactList from '../components/suppliers/SupplierContactList'
import SupplierForm, { toSupplierCreatePayload, type SupplierFormValues } from '../components/suppliers/SupplierForm'
import { Icon } from '../components/ds'
import {
  useAddSupplierContact,
  useDeleteSupplierContact,
  useSupplierCompany,
  useUpdateSupplierCompany,
  useUpdateSupplierContact,
} from '../hooks/useSupplierDirectory'
import type { ApiError } from '../api/client'
import type { SupplierContactCreate } from '../types/supplierDirectory'
import { Alert, ErrorState, PageSkeleton, toast } from '../components/ui'
import { useFormat } from '../lib/format'

function websiteHref(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null
  return `https://${value}`
}

function FactRow({
  label,
  value,
  icon,
  empty,
  children,
}: {
  label: string
  value?: string | null
  icon?: string
  empty: string
  children?: ReactNode
}) {
  const text = value?.trim() || ''
  const has = Boolean(children) || Boolean(text)
  return (
    <div className="sd-fact">
      <dt>{label}</dt>
      <dd>
        {has ? (
          <span className="sd-fact-value">
            {icon && <Icon name={icon} size={14} />}
            {children ?? text}
          </span>
        ) : (
          <span className="sd-unset">{empty}</span>
        )}
      </dd>
    </div>
  )
}

export default function SupplierDetailPage() {
  const { t } = useTranslation('common')
  const fmt = useFormat()
  const { id } = useParams<{ id: string }>()
  const { data: supplier, isLoading, error } = useSupplierCompany(id!)
  const updateCompany = useUpdateSupplierCompany(id!)
  const addContact = useAddSupplierContact(id!)
  const updateContact = useUpdateSupplierContact(id!)
  const deleteContact = useDeleteSupplierContact(id!)
  const [editing, setEditing] = useState(false)
  const [pendingContactId, setPendingContactId] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<SupplierContactCreate>()

  if (isLoading) return <div className="ds-page sd-page"><PageSkeleton /></div>
  if (error || !supplier) return <div className="ds-page sd-page"><ErrorState title={t('suppliers.detail.notFound')} /></div>

  const showConfidence = supplier.source !== 'manual' && supplier.confidence_score != null
  const location = [supplier.city, supplier.country].filter(Boolean).join(', ')
  const notSet = t('suppliers.detail.notSet')
  const primary = supplier.contacts?.find(c => c.is_primary) ?? supplier.contacts?.[0]
  const site = supplier.website?.trim() || ''
  const siteHref = site ? websiteHref(site) : null

  return (
    <div className="ds-page sd-page">
      <div className="request-crumb">
        <Link to="/suppliers" className="ds-link">{t('suppliers.detail.breadcrumb')}</Link>
        <span aria-hidden="true">{'/'}</span>
        <span>{supplier.display_name}</span>
      </div>

      <header className="sd-header">
        <div className="ds-toolbar">
          <div className="sd-header-copy">
            <div className="sd-header-title-row">
              <h1 className="ds-detail-title">{supplier.display_name}</h1>
              {!supplier.is_active && <span className="ds-pill ds-pill-warn">{t('suppliers.detail.archived')}</span>}
            </div>
            <p className="sd-header-meta">
              <span className={`sd-header-loc${location ? '' : ' is-unset'}`}>
                <Icon name="location_on" size={14} />
                {location || t('suppliers.list.locationNotSet')}
              </span>
              <span aria-hidden="true">{'·'}</span>
              <span>{t('suppliers.detail.inDirectorySince', { date: fmt.date(supplier.created_at) })}</span>
            </p>
          </div>
          <div className="ds-toolbar-actions">
            {!editing && (
              <button type="button" className="ds-btn ds-btn-secondary" onClick={() => setEditing(true)}>
                {t('suppliers.detail.edit')}
              </button>
            )}
            {supplier.is_active ? (
              <button
                type="button"
                className="ds-btn ds-btn-quiet"
                onClick={() => updateCompany.mutate({ is_active: false }, {
                  onSuccess: () => toast(t('suppliers.detail.archivedToast')),
                })}
              >
                <Icon name="archive" size={16} />
                {t('suppliers.detail.archive')}
              </button>
            ) : (
              <button
                type="button"
                className="ds-btn ds-btn-secondary"
                onClick={() => updateCompany.mutate({ is_active: true }, {
                  onSuccess: () => toast(t('suppliers.detail.restoredToast')),
                })}
              >
                {t('suppliers.detail.restore')}
              </button>
            )}
          </div>
        </div>
      </header>

      {!supplier.is_active && (
        <Alert className="mb-5">{t('suppliers.detail.archivedBanner')}</Alert>
      )}

      {primary && !editing && (
        <section className="sd-primary" aria-labelledby="sd-primary-title">
          <h2 id="sd-primary-title">{t('suppliers.detail.primaryContact')}</h2>
          <div className="sd-primary-head">
            <p className="sd-primary-name">{primary.name}</p>
            {primary.is_primary && <span className="ds-pill">{t('suppliers.contacts.primary')}</span>}
            {primary.job_title && <span className="ds-meta">{primary.job_title}</span>}
          </div>
          <ul className="sd-primary-lines">
            <li>
              <Icon name="mail" size={14} />
              <a href={`mailto:${primary.email}`} className="ds-link">{primary.email}</a>
            </li>
            {primary.phone ? (
              <li>
                <Icon name="phone" size={14} />
                <span>{primary.phone}</span>
              </li>
            ) : (
              <li className="is-unset">
                <Icon name="phone" size={14} />
                <span>{notSet}</span>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="ds-section sd-company">
        <h2>{t('suppliers.detail.company')}</h2>
        {editing ? (
          <div className="mt-4">
            <SupplierForm
              defaultValues={supplier}
              submitLabel={t('suppliers.detail.saveChanges')}
              isPending={updateCompany.isPending}
              onSubmit={data => {
                updateCompany.mutate(toSupplierCreatePayload(data as SupplierFormValues), {
                  onSuccess: () => { setEditing(false); toast(t('suppliers.detail.saved')) },
                })
              }}
            />
            <button type="button" className="ds-btn ds-btn-secondary mt-2" onClick={() => setEditing(false)}>
              {t('suppliers.detail.cancelEdit')}
            </button>
          </div>
        ) : (
          <>
            <dl className="sd-facts">
              <FactRow label={t('suppliers.detail.legalName')} value={supplier.legal_name} empty={notSet} />
              <FactRow label={t('suppliers.detail.phone')} value={supplier.phone} icon="phone" empty={notSet} />
              <FactRow label={t('suppliers.detail.website')} value={site || null} icon={siteHref ? 'globe' : undefined} empty={notSet}>
                {siteHref ? (
                  <a href={siteHref} className="ds-link" target="_blank" rel="noopener noreferrer">{site}</a>
                ) : undefined}
              </FactRow>
              <FactRow
                label={t('suppliers.detail.location')}
                value={location || null}
                icon={location ? 'location_on' : undefined}
                empty={t('suppliers.list.locationNotSet')}
              />
              <FactRow
                label={t('suppliers.detail.paymentTerms')}
                value={supplier.default_payment_terms}
                icon="payments"
                empty={notSet}
              />
              <FactRow label={t('suppliers.detail.incoterm')} value={supplier.default_incoterm} empty={notSet} />
              {showConfidence && (
                <div className="sd-fact">
                  <dt>{t('suppliers.detail.confidence')}</dt>
                  <dd className="sd-fact-num">{Math.round((supplier.confidence_score ?? 0) * 100)}%</dd>
                </div>
              )}
            </dl>
            {(supplier.tags?.length ?? 0) > 0 && (
              <ul className="sd-tags">
                {(supplier.tags ?? []).map(tag => (
                  <li key={tag}><span className="ds-pill ds-pill-muted">{tag}</span></li>
                ))}
              </ul>
            )}
            {supplier.notes && <p className="sd-notes">{supplier.notes}</p>}
          </>
        )}
      </section>

      <section className="ds-section sd-contacts-section">
        <h2>{t('suppliers.detail.contacts')}</h2>
        <div className="sd-contacts-body">
          <SupplierContactList
            contacts={supplier.contacts ?? []}
            editable={supplier.is_active}
            pendingContactId={pendingContactId}
            onSetPrimary={contactId => {
              setPendingContactId(contactId)
              updateContact.mutate({ contactId, data: { is_primary: true } }, {
                onSettled: () => setPendingContactId(null),
                onSuccess: () => toast(t('suppliers.detail.primaryUpdated')),
              })
            }}
            onDelete={contactId => {
              setPendingContactId(contactId)
              deleteContact.mutate(contactId, {
                onSettled: () => setPendingContactId(null),
                onSuccess: () => toast(t('suppliers.detail.contactRemoved')),
                onError: (err) => toast((err as ApiError).detail || t('suppliers.detail.removeContactError')),
              })
            }}
          />
        </div>
        {supplier.is_active && (
          <form
            onSubmit={handleSubmit(data => {
              addContact.mutate(data, { onSuccess: () => { reset(); toast(t('suppliers.detail.contactAdded')) } })
            })}
            className="sd-add-contact"
          >
            <input {...register('name', { required: true })} className="input" placeholder={t('suppliers.detail.namePlaceholder')} />
            <input type="email" {...register('email', { required: true })} className="input" placeholder={t('suppliers.detail.emailPlaceholder')} />
            <input {...register('phone')} className="input" placeholder={t('suppliers.detail.phonePlaceholder')} />
            <input {...register('job_title')} className="input" placeholder={t('suppliers.detail.jobTitlePlaceholder')} />
            <button type="submit" disabled={addContact.isPending} className="ds-btn ds-btn-primary sd-add-contact-submit">
              {addContact.isPending ? t('suppliers.detail.addingContact') : t('suppliers.detail.addContact')}
            </button>
          </form>
        )}
        {addContact.error && (
          <Alert tone="error" className="mt-4">{(addContact.error as ApiError).detail || t('suppliers.detail.addContactError')}</Alert>
        )}
      </section>
    </div>
  )
}
