import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Checkbox, Dialog } from '../../design-system'
import { toast } from '../ui'
import { exportComparisonXlsx } from '../../api/comparisons'
import type { ApiError } from '../../api/client'

/** Columnas exportables. Deben coincidir con las claves del backend (comparison_export.py). */
const COLUMN_KEYS = [
  'comparable_price',
  'extended_total',
  'original_price',
  'currency',
  'lead_time',
  'moq',
  'payment_terms',
  'delivery_point',
  'received_at',
] as const

type SupplierRow = { quote_id: string; supplier_name: string }

type Props = {
  open: boolean
  onClose: () => void
  rfqId: string
  locale: string
  rows: SupplierRow[]
}

export default function ExportComparisonDialog({ open, onClose, rfqId, locale, rows }: Props) {
  const { t } = useTranslation('comparison')
  // Por defecto: todas las columnas y todos los proveedores seleccionados.
  const [columns, setColumns] = useState<Set<string>>(() => new Set(COLUMN_KEYS))
  const [suppliers, setSuppliers] = useState<Set<string>>(() => new Set(rows.map(r => r.quote_id)))
  const [exporting, setExporting] = useState(false)

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, key: string) => {
    const next = new Set(set)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setter(next)
  }

  const nothingSelected = suppliers.size === 0

  const handleExport = async () => {
    setExporting(true)
    try {
      const { blob, filename } = await exportComparisonXlsx(rfqId, {
        // "supplier" siempre va; mandamos el resto de columnas elegidas.
        columns: ['supplier', ...COLUMN_KEYS.filter(k => columns.has(k))],
        suppliers: suppliers.size === rows.length ? undefined : [...suppliers],
        locale,
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `comparativo-${rfqId}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
      onClose()
    } catch (err) {
      toast((err as ApiError).detail || t('export.error'), 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={exporting ? undefined : onClose}
      title={t('export.dialogTitle')}
      description={t('export.dialogIntro')}
      size="md"
      footer={
        <div className="cx-export-actions">
          <Button variant="secondary" onClick={onClose} disabled={exporting}>{t('common:cancel', { defaultValue: 'Cancelar' })}</Button>
          <Button icon="file-xls" onClick={handleExport} loading={exporting} disabled={nothingSelected}>
            {t('export.download')}
          </Button>
        </div>
      }
    >
      <div className="cx-export-grid">
        <fieldset className="cx-export-group">
          <legend>{t('export.columnsLegend')}</legend>
          {COLUMN_KEYS.map(key => (
            <Checkbox
              key={key}
              label={t(`export.columns.${key}`)}
              checked={columns.has(key)}
              onChange={() => toggle(columns, setColumns, key)}
            />
          ))}
        </fieldset>
        <fieldset className="cx-export-group">
          <legend>{t('export.suppliersLegend')}</legend>
          {rows.map(row => (
            <Checkbox
              key={row.quote_id}
              label={row.supplier_name}
              checked={suppliers.has(row.quote_id)}
              onChange={() => toggle(suppliers, setSuppliers, row.quote_id)}
            />
          ))}
          {nothingSelected && <small className="cx-export-warn">{t('export.needSupplier')}</small>}
        </fieldset>
      </div>
    </Dialog>
  )
}
