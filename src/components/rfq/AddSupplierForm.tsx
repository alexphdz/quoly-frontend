import { Icon } from '../ds'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { ApiError } from '../../api/client'
import type { SupplierCreate } from '../../types/rfq'
import { Alert, Button } from '../ui'

const schema = z.object({
  name: z.string().min(1, 'addForm.required'),
  email: z.string().email('addForm.invalidEmail'),
})

interface Props {
  onSubmit: (data: SupplierCreate) => void
  isPending: boolean
  error: Error | null
}

export default function AddSupplierForm({ onSubmit, isPending, error }: Props) {
  const { t } = useTranslation('rfq')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierCreate>({
    resolver: zodResolver(schema),
  })

  const handleAdd = (data: SupplierCreate) => {
    onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleAdd)} className="space-y-3">
      <div className="text-sm font-medium text-[var(--text-secondary)]">{t('addForm.title')}</div>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[160px]">
          <input
            {...register('name')}
            placeholder={t('addForm.namePlaceholder')}
            className="input"
          />
          {errors.name && <p className="text-[var(--error-text)] text-xs mt-1">{t(errors.name.message as 'addForm.required')}</p>}
        </div>
        <div className="flex-1 min-w-[200px]">
          <input
            {...register('email')}
            placeholder={t('addForm.emailPlaceholder')}
            className="input"
          />
          {errors.email && <p className="text-[var(--error-text)] text-xs mt-1">{t(errors.email.message as 'addForm.invalidEmail')}</p>}
        </div>
        <Button type="submit" variant="secondary" disabled={isPending}>
          <Icon name="person_add" size={16} /> {isPending ? t('addForm.adding') : t('addForm.add')}
        </Button>
      </div>
      {error && <Alert tone="error">{(error as ApiError).detail || t('addForm.error')}</Alert>}
    </form>
  )
}
