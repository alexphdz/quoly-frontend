import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { SupplierCompanyCreate } from '../../types/supplierDirectory'
import { FormField } from '../ui'

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
  return input.split(',').map(t => t.trim()).filter(Boolean)
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
  return {
    ...rest,
    tags: parseTagsInput(tagsInput ?? (values.tags ?? []).join(', ')),
    packaging_categories: [],
    material_categories: [],
  }
}

export default function SupplierForm({ onSubmit, isPending, defaultValues, submitLabel, onCancel }: Props) {
  const { t } = useTranslation('common')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormValues>({
    defaultValues: {
      ...defaultValues,
      tagsInput: defaultValues?.tags?.join(', ') ?? defaultValues?.tagsInput ?? '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(values => {
        onSubmit(toSupplierCreatePayload(values))
        if (!defaultValues) reset()
      })}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <FormField label={t('suppliers.form.displayName')} required error={errors.display_name ? t('suppliers.form.required') : undefined}>
        <input {...register('display_name', { required: true })} className="input" placeholder={t('suppliers.form.displayNamePlaceholder')} />
      </FormField>
      <FormField label={t('suppliers.form.primaryEmail')} required error={errors.primary_email ? t('suppliers.form.required') : undefined}>
        <input type="email" {...register('primary_email', { required: true })} className="input" placeholder={t('suppliers.form.primaryEmailPlaceholder')} />
      </FormField>
      <FormField label={t('suppliers.form.phone')} optional><input {...register('phone')} className="input" placeholder={t('suppliers.form.phonePlaceholder')} /></FormField>
      <FormField label={t('suppliers.form.website')} optional><input {...register('website')} className="input" placeholder={t('suppliers.form.websitePlaceholder')} /></FormField>
      <FormField label={t('suppliers.form.country')} optional><input {...register('country')} className="input" placeholder={t('suppliers.form.countryPlaceholder')} /></FormField>
      <FormField label={t('suppliers.form.city')} optional><input {...register('city')} className="input" placeholder={t('suppliers.form.cityPlaceholder')} /></FormField>
      <FormField label={t('suppliers.form.defaultPaymentTerms')} optional><input {...register('default_payment_terms')} className="input" placeholder={t('suppliers.form.defaultPaymentTermsPlaceholder')} /></FormField>
      <FormField label={t('suppliers.form.defaultIncoterm')} optional><input {...register('default_incoterm')} className="input" placeholder={t('suppliers.form.defaultIncotermPlaceholder')} /></FormField>
      <div className="md:col-span-2">
        <FormField label={t('suppliers.form.tags')} optional helper={t('suppliers.form.tagsHelp')}>
          <input {...register('tagsInput')} className="input" placeholder={t('suppliers.form.tagsPlaceholder')} />
        </FormField>
      </div>
      <div className="md:col-span-2">
        <FormField label={t('suppliers.form.notes')} optional>
          <textarea {...register('notes')} className="input min-h-[80px]" placeholder={t('suppliers.form.notesPlaceholder')} />
        </FormField>
      </div>
      <div className="md:col-span-2 flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="ds-btn ds-btn-text" onClick={onCancel}>
            {t('actions.cancel')}
          </button>
        )}
        <button type="submit" className="ds-btn ds-btn-primary" disabled={isPending}>
          {isPending ? t('suppliers.form.saving') : (submitLabel ?? t('suppliers.form.save'))}
        </button>
      </div>
    </form>
  )
}
