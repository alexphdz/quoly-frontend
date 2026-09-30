import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { IssueKind, ReviewIssue } from '../../lib/comparisonModel'
import { FX_SWING_PERCENT } from '../../lib/comparisonModel'
import { useEnumLabels } from '../../i18n/labels'
import { Chip, Icon, SectionCard } from '../ds'
import type { CmpFormat } from './useCmpFormat'

const ICONS: Record<IssueKind, string> = {
  unquoted_lines: 'layers',
  moq: 'inventory_2',
  advance: 'payments',
  missing_fields: 'error',
  not_comparable: 'block',
  fx: 'balance',
}

export default function ReviewBeforeChoosing({ issues, f }: { issues: ReviewIssue[], f: CmpFormat }) {
  const { t } = useTranslation('comparison')
  const labels = useEnumLabels()
  const list = (items: string[]) => new Intl.ListFormat(f.fmt.locale, { type: 'conjunction' }).format(items)

  const message = (issue: ReviewIssue) => {
    const amount = issue.impact != null ? f.total(issue.impact) : null
    switch (issue.kind) {
      case 'unquoted_lines': {
        const items = list((issue.kinds ?? []).map(kind => t(`cmp.lines.kinds.${kind}`).toLowerCase()))
        return amount
          ? t('cmp.review.unquoted_lines', { supplier: issue.supplier, items, amount })
          : t('cmp.review.unquoted_linesNoAmount', { supplier: issue.supplier, items })
      }
      case 'moq': {
        const args = { supplier: issue.supplier, moq: f.qty(issue.moq ?? 0), extra: f.qty(issue.extraUnits ?? 0), units: f.units, amount }
        return amount ? t('cmp.review.moq', args) : t('cmp.review.moqNoAmount', args)
      }
      case 'advance':
        return amount
          ? t('cmp.review.advance', { supplier: issue.supplier, percent: issue.percent, amount })
          : t('cmp.review.advanceNoAmount', { supplier: issue.supplier, percent: issue.percent })
      case 'missing_fields':
        return t('cmp.review.missing_fields', {
          supplier: issue.supplier,
          fields: list((issue.fields ?? []).map(field => labels.missingField(field).toLowerCase())),
        })
      case 'not_comparable':
        return t('cmp.review.not_comparable', { supplier: issue.supplier, currency: f.currency, unit: f.unit })
      case 'fx':
        return t('cmp.review.fx', {
          supplier: issue.supplier,
          currency: issue.currency,
          rate: f.fmt.number(issue.rate ?? 0, { maximumFractionDigits: 4 }),
          base: f.currency,
          swing: FX_SWING_PERCENT,
          amount: amount ?? '—',
        })
    }
  }

  return (
    <SectionCard
      icon="error"
      title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{t('cmp.review.title')}<Chip tone={issues.length ? 'warn' : 'success'}>{issues.length}</Chip></span>}
      flush
    >
      {issues.length === 0 ? (
        <p className="cmp-review-empty">{t('cmp.review.empty')}</p>
      ) : (
        <ul className="cmp-review">
          {issues.map(issue => {
            const IconCmp = ICONS[issue.kind]
            return (
              <li key={issue.id} className={`cmp-review-row is-${issue.kind}`}>
                <span className="cmp-review-icon"><Icon name={IconCmp} size={18} /></span>
                <p className="cmp-review-text">{message(issue)}</p>
                {issue.impact != null && issue.kind !== 'fx' ? (
                  <span className="cmp-review-impact qy-num">
                    <span className="cmp-review-impact-label">{t('cmp.review.impact')}</span>
                    {f.total(issue.impact)}
                  </span>
                ) : <span />}
                <Link to={`/quotes/${issue.quoteId}`} className="ds-btn ds-btn-text">
                  {t('cmp.review.openQuote')}
                  <Icon name="arrow_forward" size={14} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
