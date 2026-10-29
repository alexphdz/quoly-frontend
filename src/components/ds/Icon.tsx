import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import {
  Archive,
  ArrowRight,
  Bell,
  Calculator,
  ChartBar,
  ChartBarHorizontal,
  ChartDonut,
  Circle,
  ClockCounterClockwise,
  Database,
  Desktop,
  DotsThreeVertical,
  Globe,
  Lightning,
  LinkBreak,
  ListBullets,
  ListChecks,
  Moon,
  Phone,
  Scales,
  SlidersHorizontal,
  SquaresFour,
  Sun,
  Table,
  Tray,
  TrendDown,
  Wallet,
} from '@phosphor-icons/react'
import { Icon as QIcon, iconWeightFor, type IconName } from '../../design-system/components/core/Icon'
import { cn } from '../ui'

/* Nombres legacy (estilo Material) → vocabulario Quoly 2.0. Los que aún no
   tienen equivalente en el catálogo curado se resuelven con Phosphor directo
   hasta que su pantalla migre (fase de pantallas). */
const QUOLY: Record<string, IconName> = {
  add: 'plus',
  assignment: 'clipboard-text',
  search: 'magnifying-glass',
  filter_list: 'funnel-simple',
  download: 'download-simple',
  emoji_events: 'trophy',
  event_available: 'calendar-check',
  edit: 'pencil-simple',
  do_not_disturb_on: 'prohibit',
  warning: 'warning',
  undo: 'arrow-counter-clockwise',
  check_circle: 'check-circle',
  delete: 'trash',
  auto_awesome: 'quoly-intelligence',
  error: 'warning-circle',
  chat: 'chat-text',
  visibility: 'eye',
  visibility_off: 'eye-slash',
  send: 'paper-plane-tilt',
  upload: 'upload-simple',
  drafts: 'envelope-simple',
  mail: 'envelope-simple',
  apartment: 'buildings',
  receipt_long: 'receipt',
  description: 'file-text',
  group: 'users-three',
  person_add: 'user-plus',
  content_copy: 'copy',
  inventory_2: 'package',
  inventory: 'package',
  location_on: 'map-pin',
  calendar_today: 'calendar-blank',
  event: 'calendar-blank',
  content_paste: 'clipboard-text',
  chevron_left: 'caret-left',
  expand_more: 'caret-down',
  expand_less: 'caret-up',
  chevron_right: 'caret-right',
  close: 'x',
  check: 'check',
  arrow_back: 'arrow-left',
  directions_boat: 'boat',
  layers: 'stack',
  attach_file: 'paperclip',
  menu: 'list',
  schedule: 'clock',
  timelapse: 'timer',
  savings: 'coins',
  payments: 'coins',
  progress_activity: 'circle-notch',
  settings: 'gear-six',
  logout: 'door-open',
  more_horiz: 'dots-three',
  open_in_new: 'arrow-square-out',
  sync: 'arrow-clockwise',
  cancel: 'x-circle',
  home: 'house-simple',
  files: 'files',
  quotes: 'quotes',
  handshake: 'handshake',
  suppliers: 'users-three',
  outlook: 'microsoft-outlook-logo',
  info: 'info',
  unfold_more: 'caret-up-down',
  block: 'prohibit',
}

const OFF_CATALOGUE: Record<string, PhosphorIcon> = {
  archive: Archive,
  globe: Globe,
  balance: Scales,
  format_list_bulleted: ListBullets,
  calculate: Calculator,
  leaderboard: ChartBar,
  bolt: Lightning,
  table_rows: Table,
  trending_down: TrendDown,
  arrow_forward: ArrowRight,
  bar_chart: ChartBar,
  donut_small: ChartDonut,
  inbox: Tray,
  database: Database,
  checklist: ListChecks,
  space_dashboard: SquaresFour,
  stacked_bar_chart: ChartBarHorizontal,
  history: ClockCounterClockwise,
  more_vert: DotsThreeVertical,
  notifications_active: Bell,
  circle: Circle,
  link_off: LinkBreak,
  phone: Phone,
  account_balance_wallet: Wallet,
  sliders: SlidersHorizontal,
  sun: Sun,
  moon: Moon,
  desktop: Desktop,
}

export function Icon({
  name,
  size = 16,
  filled = false,
  className,
  label,
}: {
  name: string
  size?: number
  filled?: boolean
  className?: string
  label?: string
}) {
  const weight = filled ? 'fill' : iconWeightFor(size)
  const quoly = QUOLY[name]
  if (quoly) {
    return <QIcon name={quoly} size={size} weight={weight} label={label} className={cn('qy-icon', className)} />
  }
  const Cmp = OFF_CATALOGUE[name] ?? Circle
  return (
    <Cmp
      size={size}
      weight={weight}
      className={cn('qy-icon', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  )
}
