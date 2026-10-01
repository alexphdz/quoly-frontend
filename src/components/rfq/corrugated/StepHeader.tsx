import { useTranslation } from 'react-i18next'
import {
  CURRENCY_OPTIONS,
  EMAIL_LOCALE_OPTIONS,
  INCOTERM_OPTIONS,
} from '../../../constants/corrugatedOptions'
import { Card } from '../../ui'
import { localDateToIso } from '../../ui/DateField'
import { EnumSelect, FormField, TextArea, TextInput, fieldError, type StepProps } from './stepShared'

export default function StepHeader({ register, errors, watch }: StepProps) {
  const { t } = useTranslation('corrugated')
  const incoterm = watch('default_incoterm')
  const needsPlace = Boolean(incoterm && incoterm !== 'not_specified')

  return (
    <Card className="card-pad grid gap-4">
      <div>
        <h2 className="qy-heading font-semibold">{t('sections.header')}</h2>
        {t('sections.headerHint') ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('sections.headerHint')}</p> : null}
      </div>
      <FormField label={t('fields.title')} required error={fieldError(errors, 'name', t)}>
        <TextInput {...register('name')} placeholder={t('fields.titlePlaceholder')} />
      </FormField>
      <FormField label={t('fields.rfqNumber')} optional>
        <TextInput {...register('rfq_number')} placeholder={t('fields.rfqNumberPlaceholder')} />
      </FormField>
      <FormField label={t('fields.description')} required error={fieldError(errors, 'description', t)}>
        <TextArea {...register('description')} rows={3} placeholder={t('fields.descriptionPlaceholder')} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t('fields.buyerCompany')} optional>
          <TextInput {...register('buyer_company')} />
        </FormField>
        <FormField label={t('fields.buyerContactName')} optional>
          <TextInput {...register('buyer_contact_name')} />
        </FormField>
        <FormField label={t('fields.buyerContactEmail')} optional error={fieldError(errors, 'buyer_contact_email', t)}>
          <TextInput type="email" {...register('buyer_contact_email')} />
        </FormField>
        <FormField label={t('fields.responseDeadline')} required error={fieldError(errors, 'response_deadline', t)}>
          <TextInput type="date" min={localDateToIso(new Date())} {...register('response_deadline')} />
        </FormField>
        <FormField label={t('fields.quoteValidityDays')} optional>
          <TextInput type="number" min={1} {...register('quote_validity_days_requested')} />
        </FormField>
        <EnumSelect
          name="base_currency"
          label={t('fields.currency')}
          options={CURRENCY_OPTIONS}
          register={register}
          error={fieldError(errors, 'base_currency', t)}
          required
        />
        <EnumSelect
          name="default_incoterm"
          label={t('fields.incoterm')}
          options={INCOTERM_OPTIONS}
          register={register}
          optional
        />
        <FormField
          label={t('fields.incotermPlace')}
          optional={!needsPlace}
          required={needsPlace}
          error={fieldError(errors, 'incoterm_named_place', t)}
        >
          <TextInput {...register('incoterm_named_place')} placeholder={t('fields.incotermPlacePlaceholder')} />
        </FormField>
        <FormField label={t('fields.deliveryDestination')} required error={fieldError(errors, 'delivery_point', t)}>
          <TextInput {...register('delivery_point')} placeholder={t('fields.deliveryPlaceholder')} />
        </FormField>
        <FormField label={t('fields.paymentTerms')} optional>
          <TextInput {...register('payment_terms_requested')} placeholder={t('fields.paymentTermsPlaceholder')} />
        </FormField>
        <EnumSelect
          name="email_locale"
          label={t('fields.emailLocale')}
          options={EMAIL_LOCALE_OPTIONS}
          register={register}
          required
        />
      </div>
    </Card>
  )
}
