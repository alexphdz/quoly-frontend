import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { SupplierCompanyCreate } from '../../types/supplierDirectory'
import { Button, TextInput, Textarea } from '../../design-system'

export type SupplierFormValues = SupplierCompanyCreate & { tagsInput?: string }

interface Props {
  onSubmit: (data: SupplierCompanyCreate) => void
  isPending: boolean
  defaultValues?: Partial<SupplierFormValues>
  submitLabel?: string
  onCancel?: () => void
}

function parseTagsInput(input?: string): string[] {
  if (!input?.trim()) return []
  return input.split(',').map(tag => tag.trim()).filter(Boolean)
}

export function toSupplierCreatePayload(values: SupplierFormValues): SupplierCompanyCreate {
  const {
    tagsInput,
    id: _id,
    user_id: _userId,
    source: _source,
    confidence_score: _confidence,
    is_active: _isActive,
    created_at: _createdAt,
    updated_at: _updatedAt,
    contacts: _contacts,
    packaging_categories: _packaging,
    material_categories: _material,
    ...rest
  } = values as SupplierFormValues & Record<string, unknown>
  return { ...rest, tags: parseTagsInput(tagsInput ?? (values.tags ?? []).join(', ')), packaging_categories: [], material_categories: [] }
}

export default function SupplierForm({ onSubmit, isPending, defaultValues, submitLabel, onCancel }: Props) {
  const { t } = useTranslation('common')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormValues>({
    defaultValues: { ...defaultValues, tagsInput: defaultValues?.tags?.join(', ') ?? defaultValues?.tagsInput ?? '' },
  })
  const optional = t('field.optional')
  const requiredError = t('suppliers.form.required')

  return (
    <form onSubmit={handleSubmit(values => {
      onSubmit(toSupplierCreatePayload(values))
      if (!defaultValues) reset()
    })} className="sup-form">
      <TextInput {...register('display_name', { required: true })} label={t('suppliers.form.displayName')} required placeholder={t('suppliers.form.displayNamePlaceholder')} status={errors.display_name ? 'error' : undefined} message={errors.display_name ? requiredError : undefined} />
      <TextInput {...register('primary_email', { required: true })} type="email" label={t('suppliers.form.primaryEmail')} required placeholder={t('suppliers.form.primaryEmailPlaceholder')} status={errors.primary_email ? 'error' : undefined} message={errors.primary_email ? requiredError : undefined} />
      <TextInput {...register('phone')} label={t('suppliers.form.phone')} optionalLabel={optional} placeholder={t('suppliers.form.phonePlaceholder')} />
      <TextInput {...register('website')} label={t('suppliers.form.website')} optionalLabel={optional} placeholder={t('suppliers.form.websitePlaceholder')} />
      <TextInput {...register('country')} label={t('suppliers.form.country')} optionalLabel={optional} placeholder={t('suppliers.form.countryPlaceholder')} />
      <TextInput {...register('city')} label={t('suppliers.form.city')} optionalLabel={optional} placeholder={t('suppliers.form.cityPlaceholder')} />
      <TextInput {...register('default_payment_terms')} label={t('suppliers.form.defaultPaymentTerms')} optionalLabel={optional} placeholder={t('suppliers.form.defaultPaymentTermsPlaceholder')} />
      <TextInput {...register('default_incoterm')} label={t('suppliers.form.defaultIncoterm')} optionalLabel={optional} placeholder={t('suppliers.form.defaultIncotermPlaceholder')} />
      <TextInput {...register('tagsInput')} className="sup-form-wide" label={t('suppliers.form.tags')} optionalLabel={optional} description={t('suppliers.form.tagsHelp')} placeholder={t('suppliers.form.tagsPlaceholder')} />
      <Textarea {...register('notes')} className="sup-form-wide" label={t('suppliers.form.notes')} optionalLabel={optional} rows={3} placeholder={t('suppliers.form.notesPlaceholder')} />
      <div className="sup-form-actions">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>{t('actions.cancel')}</Button>}
        <Button type="submit" loading={isPending}>{isPending ? t('suppliers.form.saving') : submitLabel ?? t('suppliers.form.save')}</Button>
      </div>
    </form>
  )
}
