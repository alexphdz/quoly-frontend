import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptySection, Icon, ResponseTracker, StatusBadge, TextButton } from '../../design-system'
import { useFormat } from '../../lib/format'
import { useRelativeTime } from '../../lib/relativeTime'
import { referenceSpecificationAttachments } from '../../lib/specScenario'
import ReferenceSpecManager from '../rfq/ReferenceSpecManager'
import SpecScenarioBadge from '../rfq/SpecScenarioBadge'
import type { CommercialRequestDetailProps, DetailTab } from './CommercialRequestDetail'
import { stageOf } from './stages'
import { useStageMeta } from './useStageMeta'

const SUPPLIER_PREVIEW = 6

/** 04A · Resumen: progreso de cotizaciones, siguiente acción, proveedores y requisitos. Sin precios ni «mejor». */
export default function OverviewTab(props: CommercialRequestDetailProps & { onTab: (tab: DetailTab, hash?: string) => void }) {
  const { rfq, suppliers, quotes, openAsks, confirmedQuotes, onTab } = props
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const navigate = useNavigate()
  const relative = useRelativeTime()
  const meta = useStageMeta(props)
  const draft = rfq.status === 'draft'
  const toReview = [...quotes].filter(q => q.status === 'draft').sort((a, b) => a.created_at.localeCompare(b.created_at))
  const firstAsk = [...openAsks].sort((a, b) => a.created_at.localeCompare(b.created_at))[0]
  const deadline = rfq.response_deadline
    ? fmt.date(/^\d{4}-\d{2}-\d{2}$/.test(rfq.response_deadline) ? `${rfq.response_deadline}T12:00:00` : rfq.response_deadline, { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="rd2-overview">
      <section aria-labelledby="rd2-h-summary" className="rd2-block">
        <h2 id="rd2-h-summary" className="rd2-h2">{t('detalle.summary.title')}</h2>
        {deadline && <p className="rd2-lead">{t('detalle.summary.deadline', { date: deadline })}</p>}

        {draft
          ? (
            <div className="rd2-rule-top">
              <EmptySection dense title={t('detalle.summary.draftTitle')} text={t('detalle.summary.draftText')} />
            </div>
          )
          : (
            <div className="rd2-progress">
              <span className="rd2-eyebrow">{t('detalle.summary.received')}</span>
              <span className="rd2-progress-figure">
                <span className="rd2-progress-value">{t('detalle.summary.ofTotal', { count: confirmedQuotes, total: suppliers.length })}</span>
                <span className="rd2-muted">{t('detalle.summary.invited', { count: suppliers.length })}</span>
              </span>
              {suppliers.length > 0 && <ResponseTracker responded={confirmedQuotes} total={suppliers.length} label={t('detalle.summary.trackerLabel')} />}
              {toReview.length > 0 && (
                <div className="rd2-note">
                  <p>
                    {toReview.length === 1
                      ? t('detalle.summary.toReviewOne', { supplier: toReview[0].supplier_name })
                      : t('detalle.summary.toReviewMany', { count: toReview.length })}
                  </p>
                  <TextButton size="sm" iconEnd="caret-right" className="rd2-strong" onClick={() => navigate(`/quotes/${toReview[0].id}`)}>
                    {t('detalle.summary.reviewQuote')}
                  </TextButton>
                </div>
              )}
            </div>
          )}

        {!draft && (
          <div className="rd2-next">
            {firstAsk
              ? (
                <>
                  <span className="rd2-next-icon"><Icon name="chat-text" size={18} /></span>
                  <div className="rd2-next-body">
                    <span className="rd2-next-title">{t('detalle.summary.asks', { count: openAsks.length })}</span>
                    <span className="rd2-muted">
                      {[firstAsk.supplier_name?.trim(), firstAsk.question?.trim()].filter(Boolean).join(t('detalle.summary.askSeparator'))}
                      {` · ${relative(firstAsk.created_at)}`}
                    </span>
                    <TextButton size="sm" iconEnd="caret-right" className="rd2-strong" onClick={() => onTab('replies', 'needs-answer')}>
                      {t('detalle.summary.viewQuestion')}
                    </TextButton>
                  </div>
                </>
              )
              : <p className="rd2-muted">{t('detalle.summary.noAsks')}</p>}
          </div>
        )}
      </section>

      {!draft && (
        <section aria-labelledby="rd2-h-suppliers" className="rd2-block">
          <div className="rd2-block-head">
            <h2 id="rd2-h-suppliers" className="rd2-h2 is-sm">
              {t('detalle.tabs.suppliers')}
              <span className="rd2-count">{suppliers.length}</span>
            </h2>
            {suppliers.length > 0 && (
              <TextButton size="sm" iconEnd="caret-right" className="rd2-strong" onClick={() => onTab('suppliers')}>{t('detalle.summary.allSuppliers')}</TextButton>
            )}
          </div>
          {suppliers.length === 0
            ? (
              <div className="rd2-rule-top">
                <EmptySection
                  dense
                  title={t('detalle.summary.noSuppliersTitle')}
                  text={t('detalle.summary.noSuppliersText')}
                  action={<TextButton iconEnd="caret-right" onClick={() => onTab('suppliers')}>{t('detalle.suppliers.add')}</TextButton>}
                />
              </div>
            )
            : (
              <ul className="rd2-supplier-list">
                {suppliers.slice(0, SUPPLIER_PREVIEW).map(s => {
                  const stage = stageOf(s.status)
                  return (
                    <li key={s.id} className="rd2-supplier">
                      <span className="rd2-supplier-id">
                        <span className="rd2-supplier-name">{s.name}</span>
                        <span className="rd2-supplier-mail">{s.email}</span>
                      </span>
                      <StatusBadge tone={stage.tone} variant="quiet" icon={stage.icon}>{t(`detalle.stage.${stage.key}`, { defaultValue: s.status })}</StatusBadge>
                      <span className="rd2-supplier-meta">{meta(s)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
        </section>
      )}

      <section aria-labelledby="rd2-h-spec" className="rd2-block">
        <h2 id="rd2-h-spec" className="rd2-h2 is-sm">{t('detalle.spec.title')}</h2>
        <dl className="rd2-spec">
          <div>
            <dt>{t('commercial.technicalRequirements')}</dt>
            <dd>
              {rfq.technical_requirements
                || (referenceSpecificationAttachments(rfq.attachments).length > 0
                  ? t('commercial.specSheetOnlyHint')
                  : t('commercial.whatSuppliersDatasheet'))}
            </dd>
          </div>
          <div>
            <dt>{t('commercial.specScenario.label')}</dt>
            <dd><SpecScenarioBadge technicalRequirements={rfq.technical_requirements} attachments={rfq.attachments} /></dd>
          </div>
          <div>
            <dt>{t('commercial.specSheet')}</dt>
            <dd><ReferenceSpecManager rfqId={rfq.id} attachments={rfq.attachments} readOnly={rfq.status === 'closed'} /></dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
