import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Icon, KeyValueGroup, TextButton } from '../../design-system'
import { useFormat } from '../../lib/format'
import type { RFQDetail } from '../../types/rfq'

const INCOTERM_NAME: Record<string, string> = {
  EXW: 'Ex Works', FCA: 'Free Carrier', CPT: 'Carriage Paid To', CIP: 'Carriage and Insurance Paid To', DAP: 'Delivered at Place',
  DPU: 'Delivered at Place Unloaded', DDP: 'Delivered Duty Paid', FAS: 'Free Alongside Ship', FOB: 'Free on Board',
  CFR: 'Cost and Freight', CIF: 'Cost, Insurance and Freight',
}

/** Panel de contexto: datos de la solicitud y su correo de respuesta. Se conserva en todas las pestañas. */
export default function RequestPanel({ rfq, stacked, mobile, copied, onCopyEmail }: {
  rfq: RFQDetail
  stacked: boolean
  mobile: boolean
  copied: boolean
  onCopyEmail: () => void
}) {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const navigate = useNavigate()
  const day = (iso: string) => fmt.date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso, { day: 'numeric', month: 'short', year: 'numeric' })
  const canEdit = rfq.status !== 'decided' && rfq.status !== 'closed'
  const unit = t(`commercial.units.${rfq.base_unit}`, { defaultValue: rfq.base_unit })
  const rule = rfq.incoterms?.rule
  const role = rfq.incoterms?.place_role
  const none = <span className="rd2-none">{t('detalle.panel.notSet')}</span>

  const items = [
    { label: t('crear.fields.quantity'), value: `${fmt.number(rfq.quantity)} ${unit}` },
    { label: t('detalle.panel.currency'), value: rfq.base_currency || none },
    { label: t('crear.fields.incoterm'), value: rule ? `${rule} — ${INCOTERM_NAME[rule] ?? rule}` : none },
    ...(rule && rfq.incoterms?.named_place
      ? [{ label: t(`crear.place.${role ?? 'none'}.label`, { defaultValue: t('crear.place.none.label') }), value: rfq.incoterms.named_place }]
      : []),
    { label: t('crear.fields.deliveryDate'), value: rfq.requested_delivery_date ? day(rfq.requested_delivery_date) : none },
    { label: t('detalle.panel.deadline'), value: rfq.response_deadline ? day(rfq.response_deadline) : none },
    ...(rfq.internal_reference
      ? [{
          label: t('crear.fields.reference'),
          value: (
            <>
              {rfq.internal_reference}
              <span className="rd2-kv-note">{rfq.share_internal_reference ? t('crear.fields.shareOn') : t('crear.fields.shareOff')}</span>
            </>
          ),
        }]
      : []),
  ]

  return (
    <aside className={`rd2-panel${stacked ? ' is-stacked' : ''}`} aria-label={t('detalle.panel.label')}>
      <section aria-labelledby="rd2-h-data" className="rd2-panel-section">
        <div className="rd2-block-head">
          <h2 id="rd2-h-data" className="rd2-h3">{t('detalle.panel.title')}</h2>
          {canEdit && <TextButton size="sm" icon="pencil-simple" onClick={() => navigate(`/rfqs/${rfq.id}/edit`)}>{t('detalle.panel.edit')}</TextButton>}
        </div>
        <KeyValueGroup items={items} columns={stacked && !mobile ? 2 : 1} label={t('detalle.panel.title')} />
      </section>
      <section aria-labelledby="rd2-h-mail" className="rd2-panel-section is-mail">
        <h2 id="rd2-h-mail" className="rd2-h3">{t('detalle.panel.mailTitle')}</h2>
        <p className="rd2-muted">{t('detalle.panel.mailText')}</p>
        <span className="rd2-mail"><Icon name="envelope-simple" size={16} /><span className="rd2-mail-address">{rfq.email_address}</span></span>
        <span>
          <Button variant="secondary" size="sm" icon={copied ? 'check' : 'copy'} onClick={onCopyEmail}>
            {copied ? t('detalle.panel.copied') : t('detalle.panel.copy')}
          </Button>
        </span>
      </section>
    </aside>
  )
}
