import { useTranslation } from 'react-i18next'
import {
  ALL_RESPONSE_FIELD_KEYS,
  PREFERRED_FORMAT_OPTIONS,
  RESPONSE_FIELD_OPTIONS,
} from '../../../constants/corrugatedOptions'
import type { ResponseFieldKey } from '../../../types/corrugated'
import { Card } from '../../ui'
import { EnumSelect, fieldError, type StepProps } from './stepShared'

type ChecklistState = 'off' | 'optional' | 'required'

function stateFor(
  key: ResponseFieldKey,
  required: ResponseFieldKey[],
  optional: ResponseFieldKey[],
): ChecklistState {
  if (required.includes(key)) return 'required'
  if (optional.includes(key)) return 'optional'
  return 'off'
}

function nextState(current: ChecklistState): ChecklistState {
  if (current === 'off') return 'optional'
  if (current === 'optional') return 'required'
  return 'off'
}

export default function StepChecklist({ register, watch, setValue, errors }: StepProps) {
  const { t } = useTranslation(['corrugated', 'enums'])
  const required = (watch('required_response_fields') || []) as ResponseFieldKey[]
  const optional = (watch('optional_response_fields') || []) as ResponseFieldKey[]

  const cycle = (key: ResponseFieldKey) => {
    const current = stateFor(key, required, optional)
    const next = nextState(current)
    const nextRequired = required.filter(k => k !== key)
    const nextOptional = optional.filter(k => k !== key)
    if (next === 'required') nextRequired.push(key)
    if (next === 'optional') nextOptional.push(key)
    setValue('required_response_fields', nextRequired, { shouldDirty: true, shouldValidate: true })
    setValue('optional_response_fields', nextOptional, { shouldDirty: true })
  }

  const labelFor = (key: ResponseFieldKey) => {
    const opt = RESPONSE_FIELD_OPTIONS.find(o => o.value === key)
    return opt ? t(`enums:${opt.labelKey}` as 'corrugated.responseField.moq') : key
  }

  const stateLabel = (s: ChecklistState) => {
    if (s === 'required') return t('corrugated:checklist.required')
    if (s === 'optional') return t('corrugated:checklist.optional')
    return t('corrugated:checklist.off')
  }

  return (
    <Card className="card-pad grid gap-4">
      <div>
        <h2 className="qy-heading font-semibold">{t('corrugated:sections.checklist')}</h2>
        {t('corrugated:sections.checklistHint') ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('corrugated:sections.checklistHint')}</p> : null}
        <p className="mt-1 text-xs text-[var(--text-muted)]">{t('corrugated:checklist.hint')}</p>
        {errors.required_response_fields && (
          <p className="field-error mt-2">
            {fieldError(errors, 'required_response_fields', key => t(`corrugated:${key}`))}
          </p>
        )}
      </div>
      <ul className="grid gap-2">
        {ALL_RESPONSE_FIELD_KEYS.map(key => {
          const state = stateFor(key, required, optional)
          return (
            <li key={key}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded border border-[var(--border-subtle)] px-3 py-2 text-left text-sm"
                onClick={() => cycle(key)}
              >
                <span>{labelFor(key)}</span>
                <span className="shrink-0 text-[var(--text-muted)]">{stateLabel(state)}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <EnumSelect
        name="preferred_response_format"
        label={t('corrugated:fields.preferredFormat')}
        options={PREFERRED_FORMAT_OPTIONS}
        register={register}
        optional
        includeEmpty
      />
    </Card>
  )
}
