import { useTranslation } from 'react-i18next'
import { Popover } from 'radix-ui'
import { COMMERCIAL_INCOTERMS, type PlaceRole } from '../../../constants/commercial'
import { Icon } from '../../ds'

function TermInfo({ code, role }: { code: string; role: PlaceRole }) {
  const { t } = useTranslation('rfq')
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="cr-incoterm-info" aria-label={t('commercial.termAbout', { code })}>
          <Icon name="info" size={14} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" align="end" sideOffset={6} className="qy-popover cr-incoterm-define">
          <p className="cr-incoterm-define-title">{t(`commercial.terms.${code}`)}</p>
          <p>{t(`commercial.termDefine.${code}`)}</p>
          <p className="cr-incoterm-define-place">
            {t('commercial.termPlace', { place: t(`commercial.placeRole.${role}`) })}
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default function IncotermPicker({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (code: string) => void
  error?: boolean
}) {
  const { t } = useTranslation('rfq')
  const anyMode = COMMERCIAL_INCOTERMS.filter((item) => !item.sea)
  const seaTerms = COMMERCIAL_INCOTERMS.filter((item) => item.sea)

  const renderGroup = (heading: string, items: typeof COMMERCIAL_INCOTERMS) => (
    <div className="cr-incoterm-group">
      <p className="cr-incoterm-heading">{heading}</p>
      <div className="cr-incoterm-grid">
        {items.map((item) => {
          const selected = value === item.code
          return (
            <div key={item.code} className="cr-incoterm-wrap">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                className="cr-incoterm-card"
                onClick={() => onChange(selected ? '' : item.code)}
              >
                <span className="cr-incoterm-code">{item.code}</span>
                <span className="cr-incoterm-hint">{t(`commercial.termHint.${item.code}`)}</span>
              </button>
              <TermInfo code={item.code} role={item.role} />
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div
      role="radiogroup"
      aria-label={t('commercial.incoterm')}
      aria-invalid={error || undefined}
      className="cr-incoterm"
    >
      <input type="hidden" name="incoterm" value={value} />
      {renderGroup(t('commercial.incotermAnyMode'), anyMode)}
      {renderGroup(t('commercial.incotermSea'), seaTerms)}
      {value ? (
        <button type="button" className="ds-btn ds-btn-text cr-incoterm-clear" onClick={() => onChange('')}>
          {t('commercial.incotermClear')}
        </button>
      ) : null}
    </div>
  )
}
