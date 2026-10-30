import { Icon } from '../ds'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { ApiError } from '../../api/client'
import type { SupplierCreate } from '../../types/rfq'
import { Button, FormFeedback } from '../ui'

const schema = z.object({
  company_name: z.string().min(1, 'addForm.required'),
  email: z.string().email('addForm.invalidEmail'),
  contact_name: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (data: SupplierCreate) => void
  isPending: boolean
  error: Error | null
}

export default function AddSupplierForm({ onSubmit, isPending, error }: Props) {
  const { t } = useTranslation('rfq')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const handleAdd = (data: FormValues) => {
    const contact = data.contact_name?.trim()
    onSubmit({
      company_name: data.company_name.trim(),
      email: data.email,
      contact_name: contact ? contact : null,
    })
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleAdd)} className="space-y-3">
      <div className="text-sm font-medium text-[var(--text-secondary)]">{t('addForm.title')}</div>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[160px]">
          <input
            {...register('company_name')}
            placeholder={t('addForm.companyNamePlaceholder')}
            className="input"
          />
          {errors.company_name && <p className="text-[var(--error-text)] text-xs mt-1">{t(errors.company_name.message as 'addForm.required')}</p>}
        </div>
        <div className="flex-1 min-w-[200px]">
          <input
            {...register('email')}
            placeholder={t('addForm.emailPlaceholder')}
            className="input"
          />
          {errors.email && <p className="text-[var(--error-text)] text-xs mt-1">{t(errors.email.message as 'addForm.invalidEmail')}</p>}
        </div>
        <div className="flex-1 min-w-[160px]">
          <input
            {...register('contact_name')}
            placeholder={t('addForm.contactNamePlaceholder')}
            className="input"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={isPending}>
          <Icon name="person_add" size={16} /> {isPending ? t('addForm.adding') : t('addForm.add')}
        </Button>
      </div>
      {error && <FormFeedback>{(error as ApiError).detail || t('addForm.error')}</FormFeedback>}
    </form>
  )
}
