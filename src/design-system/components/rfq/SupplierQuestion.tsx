import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { TextButton } from '../actions/TextButton'
import { Icon } from '../core/Icon'

export type SupplierQuestionProps = {
  sender: string
  channel?: string
  /** Fecha de recepción ya formateada. */
  received?: string
  question: ReactNode
  context?: ReactNode
  state?: 'open' | 'answered'
  /** Solo se muestra cuando la respuesta está confirmada (state="answered"). */
  answer?: ReactNode
  answeredBy?: string
  onRespond?: () => void
  respondLabel?: string
  last?: boolean
  className?: string
  style?: CSSProperties
}

/** Pregunta de proveedor: remitente (200) + pregunta, estado y acción. */
export function SupplierQuestion({
  sender, channel, received, question, context, state = 'open', answer, answeredBy, onRespond, respondLabel, last = false, className, style,
}: SupplierQuestionProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLElement>()
  const open = state === 'open'
  return (
    <article
      ref={ref}
      aria-label={t('rfq.question.label', { sender })}
      className={cx('q-supplier-question', width < 600 && 'is-narrow', last && 'is-last', className)}
      style={style}
    >
      <div className="q-question-from">
        <span className="q-question-sender">{sender}</span>
        {(channel || received) && <span className="q-question-meta">{[channel, received].filter(Boolean).join(' · ')}</span>}
      </div>
      <div className="q-question-body">
        <div className="q-question-main">
          <span className={cx('q-question-state', open && 'is-open')}>
            <Icon name={open ? 'warning' : 'check'} size={14} />
            {open ? t('rfq.question.needsAnswer') : t('rfq.question.answered')}
          </span>
          <p className="q-question-text">{question}</p>
          {context && <span className="q-question-meta">{context}</span>}
        </div>
        {!open && answer && (
          <div className="q-question-answer">
            <span className="q-rfq-label">{answeredBy ?? t('rfq.question.answerSent')}</span>
            <p>{answer}</p>
          </div>
        )}
        {open && onRespond && (
          <div className="q-question-action">
            <TextButton icon="arrow-bend-up-left" onClick={onRespond}>
              {respondLabel ?? t('rfq.question.respond')}
              <span className="q-sr-only">{` ${t('rfq.question.respondTo', { sender })}`}</span>
            </TextButton>
          </div>
        )}
      </div>
    </article>
  )
}
