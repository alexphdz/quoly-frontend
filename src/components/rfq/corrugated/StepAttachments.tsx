import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ATTACHMENT_KIND_OPTIONS } from '../../../constants/corrugatedOptions'
import { Alert, Button, Card } from '../../ui'
import { EnumSelect, FormField, TextInput, type StepProps } from './stepShared'

export default function StepAttachments({ register, control }: StepProps) {
  const { t } = useTranslation('corrugated')
  const { fields, append, remove } = useFieldArray({ control, name: 'attachments' })

  return (
    <Card className="card-pad grid gap-4">
      <div>
        <h2 className="qy-heading font-semibold">{t('sections.attachments')}</h2>
        {t('sections.attachmentsHint') ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('sections.attachmentsHint')}</p> : null}
      </div>
      <Alert tone="info">{t('sections.attachmentsNote')}</Alert>
      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-3 rounded border border-[var(--border-subtle)] p-3 md:grid-cols-[1fr_1fr_auto]">
          <EnumSelect
            name={`attachments.${index}.kind`}
            label={t('fields.attachmentKind')}
            options={ATTACHMENT_KIND_OPTIONS}
            register={register}
            required
          />
          <FormField label={t('fields.attachmentFileName')} required>
            <TextInput
              {...register(`attachments.${index}.file_name`)}
              placeholder={t('fields.attachmentFileNamePlaceholder')}
            />
          </FormField>
          <div className="flex items-end">
            <Button type="button" variant="ghost" onClick={() => remove(index)}>
              {t('actions.removeAttachment')}
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({ id: crypto.randomUUID(), kind: 'dieline_drawing', file_name: '' })
        }
      >
        {t('actions.addAttachment')}
      </Button>
    </Card>
  )
}
