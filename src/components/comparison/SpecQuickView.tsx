import { useRef } from 'react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import type { ComparisonRow } from '../../types/comparison'
import { useQuote } from '../../hooks/useQuotes'
import SpecEvidenceSummary from '../spec/SpecEvidenceSummary'
import OriginalDocument from '../documents/OriginalDocument'
import { AiMark, Icon, Skel } from '../ds'

interface Props {
  row: ComparisonRow
  onClose: () => void
}

export default function SpecQuickView({ row, onClose }: Props) {
  const { t } = useTranslation('comparison')
  const { data: quote, isLoading } = useQuote(row.quote_id)
  const returnFocus = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  const evidenceLines = row.spec_evidence_lines?.length
    ? row.spec_evidence_lines
    : (row.extracted_parameters ?? []).map(entry => ({ parameter_name: entry.name, supplier_wording: entry.value }))
  const summary = quote?.faithful_summary || quote?.extraction_pass?.summary

  return (
    <Dialog.Root open onOpenChange={open => { if (!open) onClose() }}>
      <Dialog.Portal>
        <div className="ds-drawer-root">
          <Dialog.Overlay className="ds-drawer-catcher" />
          <Dialog.Content asChild onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus() }}>
            <aside className="ds-drawer">
              <div className="ds-drawer-head spec-drawer-head">
                <div>
                  <p className="ds-drawer-kicker">{t('specQuickView.eyebrow')}</p>
                  <Dialog.Title className="ds-drawer-title">{row.supplier_name}</Dialog.Title>
                  <Dialog.Description className="sr-only">{t('specQuickView.summaryTitle')}</Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button type="button" className="ds-btn ds-btn-secondary" aria-label={t('specQuickView.close')}>
                    <Icon name="close" size={16} />
                  </button>
                </Dialog.Close>
              </div>
              <div className="ds-drawer-body spec-drawer-body">
                {row.spec_source_url && (
                  <OriginalDocument endpoint={`/quotes/${row.quote_id}/original`}
                    fileType={row.file_type || row.spec_document_name?.split('.').pop()} />
                )}
                <section className="ai-panel spec-summary">
                  <div className="ai-panel-head">
                    <h3>{t('specQuickView.summaryTitle')}</h3>
                    <AiMark kind="read" />
                  </div>
                  {summary ? <p className="ai-panel-summary">{summary}</p>
                    : isLoading ? <Skel h={14} /> : null}
                  {evidenceLines.length > 0
                    ? <SpecEvidenceSummary lines={evidenceLines} showVerdicts={Boolean(row.buyer_has_reference)} />
                    : !summary && !isLoading && <p className="ds-meta">{t('specQuickView.empty')}</p>}
                </section>
              </div>
            </aside>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
