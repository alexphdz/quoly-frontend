import { useTranslation } from 'react-i18next'
import type { UseFormRegister, FieldValues, Path, FieldErrors, Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import type { CorrugatedRFQFormValues } from '../../../schemas/corrugatedRfq'
import type { CorrugatedOption } from '../../../constants/corrugatedOptions'
import { FormField, SelectInput, TextInput, TextArea } from '../../ui'

export type StepProps = {
  register: UseFormRegister<CorrugatedRFQFormValues>
  control: Control<CorrugatedRFQFormValues>
  errors: FieldErrors<CorrugatedRFQFormValues>
  watch: UseFormWatch<CorrugatedRFQFormValues>
  setValue: UseFormSetValue<CorrugatedRFQFormValues>
}

function fieldError(
  errors: FieldErrors<CorrugatedRFQFormValues>,
  name: string,
  t: (key: string) => string,
): string | undefined {
  const parts = name.split('.')
  let current: unknown = errors
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  if (!current || typeof current !== 'object' || !('message' in current)) return undefined
  const message = (current as { message?: unknown }).message
  if (!message) return undefined
  return t(String(message))
}

export function EnumSelect<T extends FieldValues>({
  name,
  label,
  options,
  register,
  error,
  required,
  optional,
  includeEmpty,
}: {
  name: Path<T>
  label: string
  options: CorrugatedOption[]
  register: UseFormRegister<T>
  error?: string
  required?: boolean
  optional?: boolean
  includeEmpty?: boolean
}) {
  const { t } = useTranslation(['enums', 'corrugated'])
  return (
    <FormField label={label} required={required} optional={optional} error={error}>
      <SelectInput {...register(name)}>
        {includeEmpty && <option value="">{t('corrugated:actions.select')}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {t(`enums:${opt.labelKey}` as 'corrugated.boxStyle.RSC')}
          </option>
        ))}
      </SelectInput>
    </FormField>
  )
}

export { fieldError, FormField, TextInput, TextArea, SelectInput }
