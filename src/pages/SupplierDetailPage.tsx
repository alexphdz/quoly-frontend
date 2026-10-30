import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SupplierContactList from '../components/suppliers/SupplierContactList'
import SupplierForm, { toSupplierCreatePayload, type SupplierFormValues } from '../components/suppliers/SupplierForm'
import {
  Breadcrumbs, Button, ContentSection, SideSheet, StatusBadge, Tag, TextButton, TextInput,
} from '../design-system'
import {
  useAddSupplierContact, useDeleteSupplierContact, useSupplierCompany,
  useSupplierRfqHistory, useUpdateSupplierCompany, useUpdateSupplierContact,
} from '../hooks/useSupplierDirectory'
import type { ApiError } from '../api/client'
import type { SupplierContactCreate } from '../types/supplierDirectory'
import { FormFeedback, PageSkeleton, toast } from '../components/ui'
import { useFormat } from '../lib/format'
import { useEnumLabels } from '../i18n/labels'
import { stageOf } from '../components/requestDetail/stages'
import { Skel } from '../components/ds'

function websiteHref(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null
  return `https://${value}`
}

function FactRow({ label, value, children, empty }: { label: string, value?: string | null, children?: ReactNode, empty: string }) {
  const shown = value?.trim() || ''
  return <div className="sd-fact"><dt>{label}</dt><dd>{children ?? (shown || <span className="sd-unset">{empty}</span>)}</dd></div>
}

export default function SupplierDetailPage() {
  const { t } = useTranslation('common')
  const labels = useEnumLabels()
  const fmt = useFormat()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: supplier, isLoading, error } = useSupplierCompany(id!)
  const { data: history, isLoading: historyLoading, error: historyError, refetch: refetchHistory } = useSupplierRfqHistory(id!)
  const updateCompany = useUpdateSupplierCompany(id!)
  const addContact = useAddSupplierContact(id!)
  const updateContact = useUpdateSupplierContact(id!)
  const deleteContact = useDeleteSupplierContact(id!)
  const [editing, setEditing] = useState(false)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [pendingContactId, setPendingContactId] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<SupplierContactCreate>()

  if (isLoading) return <div className="ds-page sd-page"><PageSkeleton /></div>
  if (error || !supplier) return <div className="ds-page sd-page"><div className="sd-error" role="alert">{t('suppliers.detail.notFound')}</div></div>

  const notSet = t('suppliers.detail.notSet')
  const location = [supplier.city, supplier.country].filter(Boolean).join(', ')
  const site = supplier.website?.trim() || ''
  const siteHref = site ? websiteHref(site) : null
  const primaryContactExists = (supplier.contacts ?? []).some(contact => contact.is_primary)

  return (
    <div className="ds-page sd-page">
      <Breadcrumbs items={[{ label: t('suppliers.detail.breadcrumb'), to: '/suppliers' }, { label: supplier.display_name }]} />
      <header className="sd-header">
        <div className="sd-title-copy">
          {supplier.is_active === false && <StatusBadge tone="neutral" variant="quiet" icon={false}>{t('suppliers.detail.archived')}</StatusBadge>}
          <h1>{supplier.display_name}</h1>
          <div className="sd-tags">{(supplier.tags ?? []).map(tag => <Tag key={tag} variant="outline">{tag}</Tag>)}{!supplier.tags?.length && <span className="sd-unset">{t('suppliers.detail.noTags')}</span>}</div>
        </div>
        <div className="sd-header-actions">
          <Button variant="secondary" icon="pencil-simple" onClick={() => setEditing(true)}>{t('suppliers.detail.edit')}</Button>
          {supplier.is_active
            ? <Button variant="tertiary" icon="prohibit" loading={updateCompany.isPending} onClick={() => updateCompany.mutate({ is_active: false }, { onSuccess: () => toast(t('suppliers.detail.archivedToast')) })}>{t('suppliers.detail.archive')}</Button>
            : <Button variant="secondary" icon="arrow-counter-clockwise" loading={updateCompany.isPending} onClick={() => updateCompany.mutate({ is_active: true }, { onSuccess: () => toast(t('suppliers.detail.restoredToast')) })}>{t('suppliers.detail.restore')}</Button>}
        </div>
      </header>

      {!supplier.is_active && <div className="sd-archived-note"><StatusBadge tone="neutral" variant="quiet" icon={false}>{t('suppliers.detail.archived')}</StatusBadge><span>{t('suppliers.detail.archivedBanner')}</span></div>}

      <div className="sd-layout">
        <main className="sd-main">
          <ContentSection title={t('suppliers.detail.contacts')} actions={supplier.is_active ? <Button variant="tertiary" size="sm" icon="plus" onClick={() => setAddContactOpen(true)}>{t('suppliers.detail.addContact')}</Button> : undefined}>
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
                  onError: err => toast((err as ApiError).detail || t('suppliers.detail.removeContactError'), 'error'),
                })
              }}
            />
          </ContentSection>

          <ContentSection
            title={t('suppliers.detail.relatedRequests')}
            meta={!historyLoading && !historyError && history ? t('suppliers.detail.relatedRequestsCount', { count: history.total }) : undefined}
            className="sd-related-rfqs"
          >
            {historyLoading ? (
              <div className="sd-rfq-loading" role="status" aria-label={t('suppliers.detail.relatedRequests')}>
                <Skel h={17} /><Skel h={17} /><Skel h={17} />
              </div>
            ) : historyError ? (
              <div className="sd-rfq-error" role="alert">
                <div><strong>{t('suppliers.detail.relatedRequestsError')}</strong><span>{t('suppliers.detail.relatedRequestsErrorText')}</span></div>
                <Button variant="tertiary" size="sm" onClick={() => void refetchHistory()}>{t('actions.retry')}</Button>
              </div>
            ) : history?.items.length ? (
              <ul className="sd-related-list">
                {history.items.map(item => {
                  const participation = stageOf(item.supplier_status)
                  const requestTone = item.rfq_status === 'open' ? 'info' : 'neutral'
                  return (
                    <li key={item.rfq_id}>
                      <div className="sd-related-copy">
                        <strong>{item.rfq_name}</strong>
                        <span><StatusBadge tone={participation.tone} variant="quiet" icon={participation.icon}>{labels.supplierStatus(participation.key)}</StatusBadge></span>
                      </div>
                      <StatusBadge tone={requestTone} variant="quiet">{labels.rfqStatus(item.rfq_status)}</StatusBadge>
                      <TextButton size="sm" iconEnd="caret-right" onClick={() => navigate(`/rfqs/${item.rfq_id}`)}>{t('suppliers.detail.viewRequest')}</TextButton>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="sd-empty-copy">{t('suppliers.detail.noRelatedRequests')}</p>
            )}
          </ContentSection>
        </main>

        <aside className="sd-info" aria-labelledby="sd-info-title">
          <h2 id="sd-info-title">{t('suppliers.detail.supplierData')}</h2>
          <dl>
            <FactRow label={t('suppliers.detail.legalName')} value={supplier.legal_name} empty={notSet} />
            <FactRow label={t('suppliers.detail.primaryEmail')} value={supplier.primary_email} empty={notSet}>
              <a href={`mailto:${supplier.primary_email}`}>{supplier.primary_email}</a>
            </FactRow>
            <FactRow label={t('suppliers.detail.phone')} value={supplier.phone} empty={notSet} />
            <FactRow label={t('suppliers.detail.website')} value={site || null} empty={notSet}>{siteHref ? <a href={siteHref} target="_blank" rel="noopener noreferrer">{site}</a> : undefined}</FactRow>
            <FactRow label={t('suppliers.detail.location')} value={location} empty={t('suppliers.list.locationNotSet')} />
            <FactRow label={t('suppliers.detail.paymentTerms')} value={supplier.default_payment_terms} empty={notSet} />
            <FactRow label={t('suppliers.detail.incoterm')} value={supplier.default_incoterm} empty={notSet} />
            <FactRow label={t('suppliers.detail.inDirectorySinceLabel')} value={fmt.date(supplier.created_at)} empty={notSet} />
            {supplier.source !== 'manual' && supplier.confidence_score != null && <FactRow label={t('suppliers.detail.confidence')} value={`${Math.round(supplier.confidence_score * 100)}%`} empty={notSet} />}
          </dl>
          {supplier.notes && <div className="sd-notes"><span>{t('suppliers.form.notes')}</span><p>{supplier.notes}</p></div>}
        </aside>
      </div>

      <SideSheet open={editing} onClose={() => setEditing(false)} title={t('suppliers.detail.edit')} description={t('suppliers.detail.editDescription')}>
        <SupplierForm
          defaultValues={supplier}
          submitLabel={t('suppliers.detail.saveChanges')}
          isPending={updateCompany.isPending}
          onCancel={() => setEditing(false)}
          onSubmit={data => updateCompany.mutate(toSupplierCreatePayload(data as SupplierFormValues), { onSuccess: () => { setEditing(false); toast(t('suppliers.detail.saved')) } })}
        />
        {updateCompany.error && <FormFeedback>{(updateCompany.error as ApiError).detail || t('suppliers.detail.saveError')}</FormFeedback>}
      </SideSheet>

      <SideSheet
        open={addContactOpen}
        onClose={() => { setAddContactOpen(false); reset() }}
        title={t('suppliers.detail.addContact')}
        description={t('suppliers.detail.contactFormDescription')}
        footer={<div className="sd-sheet-actions"><Button variant="secondary" onClick={() => { setAddContactOpen(false); reset() }}>{t('actions.cancel')}</Button><Button type="submit" form="sd-contact-form" loading={addContact.isPending}>{addContact.isPending ? t('suppliers.detail.addingContact') : t('suppliers.detail.addContact')}</Button></div>}
      >
        <form id="sd-contact-form" className="sd-add-contact" onSubmit={handleSubmit(data => {
          addContact.mutate({ ...data, is_primary: data.is_primary ?? !primaryContactExists }, { onSuccess: () => { reset(); setAddContactOpen(false); toast(t('suppliers.detail.contactAdded')) } })
        })}>
          <TextInput {...register('name', { required: true })} label={t('suppliers.detail.contactName')} required placeholder={t('suppliers.detail.namePlaceholder')} />
          <TextInput {...register('email', { required: true })} type="email" label={t('suppliers.detail.contactEmail')} required placeholder={t('suppliers.detail.emailPlaceholder')} />
          <TextInput {...register('phone')} label={t('suppliers.detail.phone')} optionalLabel={t('field.optional')} placeholder={t('suppliers.detail.phonePlaceholder')} />
          <TextInput {...register('job_title')} label={t('suppliers.detail.jobTitle')} optionalLabel={t('field.optional')} placeholder={t('suppliers.detail.jobTitlePlaceholder')} />
          {!primaryContactExists && <label className="sd-primary-checkbox"><input type="checkbox" {...register('is_primary')} defaultChecked />{t('suppliers.contacts.makePrimary')}</label>}
        </form>
        {addContact.error && <FormFeedback>{(addContact.error as ApiError).detail || t('suppliers.detail.addContactError')}</FormFeedback>}
      </SideSheet>
    </div>
  )
}
