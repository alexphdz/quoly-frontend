// Quoly 2.0 Design System — API pública de componentes.
export { cx } from './utils'

// core
export { Icon, iconWeightFor, type IconName, type IconProps, type IconWeight } from './components/core/Icon'
export { IntelligenceMark, type IntelligenceMarkProps } from './components/core/IntelligenceMark'
export { QUOLY_ICONS, type QuolyIconName } from './components/core/icons'

// 05A · actions
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './components/actions/Button'
export { IconButton, type IconButtonProps } from './components/actions/IconButton'
export { TextButton, type TextButtonProps } from './components/actions/TextButton'
export { SplitButton, type SplitButtonProps } from './components/actions/SplitButton'
export { ButtonGroup, type ButtonGroupProps, type ButtonGroupItem } from './components/actions/ButtonGroup'

// 05A · inputs
export { Field, fieldAria, controlClass, type FieldProps, type FieldBaseProps, type FieldStatus, type ControlSize } from './components/inputs/Field'
export { TextInput, type TextInputProps } from './components/inputs/TextInput'
export { Textarea, type TextareaProps } from './components/inputs/Textarea'
export { NumberInput, type NumberInputProps } from './components/inputs/NumberInput'
export { SearchInput, type SearchInputProps } from './components/inputs/SearchInput'
export { CurrencyInput, type CurrencyInputProps } from './components/inputs/CurrencyInput'
export { Select, type SelectProps, type SelectOption } from './components/inputs/Select'
export { MultiSelect, type MultiSelectProps, type MultiSelectOption } from './components/inputs/MultiSelect'
export { DateInput, type DateInputProps } from './components/inputs/DateInput'

// 05A · selection
export { Checkbox, type CheckboxProps } from './components/selection/Checkbox'
export { Radio, type RadioProps } from './components/selection/Radio'
export { Switch, type SwitchProps } from './components/selection/Switch'
export { SegmentedControl, type SegmentedControlProps, type SegmentedOption } from './components/selection/SegmentedControl'

// 05A · indicators
export { StatusBadge, type StatusBadgeProps, type StatusTone } from './components/indicators/StatusBadge'
export { Tag, type TagProps } from './components/indicators/Tag'
export { Chip, type ChipProps } from './components/indicators/Chip'
export { Counter, type CounterProps } from './components/indicators/Counter'
export { NotificationIndicator, type NotificationIndicatorProps } from './components/indicators/NotificationIndicator'
export { Progress, type ProgressProps } from './components/indicators/Progress'

// 05A · feedback
export { ValidationMessage, type ValidationMessageProps, type FeedbackTone } from './components/feedback/ValidationMessage'
export { InlineAlert, type InlineAlertProps } from './components/feedback/InlineAlert'
export { Tooltip, TooltipBubble, type TooltipProps, type TooltipBubbleProps } from './components/feedback/Tooltip'
export { Popover, PopoverPanel, type PopoverProps, type PopoverPanelProps } from './components/feedback/Popover'
export { Toast, notify, type ToastProps, type ToastTone, type NotifyOptions } from './components/feedback/Toast'
export { Spinner, type SpinnerProps } from './components/feedback/Spinner'
export { Skeleton, type SkeletonProps } from './components/feedback/Skeleton'
export { EmptyState, type EmptyStateProps } from './components/feedback/EmptyState'

// 05A · auxiliary
export { Divider, type DividerProps } from './components/auxiliary/Divider'
export { Avatar, initials, type AvatarProps } from './components/auxiliary/Avatar'
export { Kbd, type KbdProps } from './components/auxiliary/Kbd'
export { Breadcrumbs, BreadcrumbItem, type BreadcrumbsProps, type BreadcrumbItemProps } from './components/auxiliary/Breadcrumbs'
export { Menu, MenuItem, MenuSeparator, MenuLabel, type MenuProps, type MenuItemProps } from './components/auxiliary/Menu'
export { Tabs, type TabsProps, type TabItem } from './components/auxiliary/Tabs'

// 05A · navigation
export { Sidebar, NavAccount, type SidebarProps, type NavItem, type NavAccountProps } from './components/navigation/Sidebar'
export { SidebarItem, type SidebarItemProps } from './components/navigation/SidebarItem'
export { MobileNavDrawer, type MobileNavDrawerProps } from './components/navigation/MobileNavDrawer'
export { QuolyMark } from './components/navigation/QuolyMark'

// 05B.1 · table
export { DataTable, type DataTableProps, type DataTableColumn, type DataTableSort } from './components/table/DataTable'
export { TableCell, type TableCellProps, type TableCellType } from './components/table/TableCell'
export { TableToolbar, type TableToolbarProps } from './components/table/TableToolbar'
export { TablePagination, type TablePaginationProps } from './components/table/TablePagination'
export { RecoveryState, EmptyRegion, NoResultsRegion, type RecoveryStateProps, type EmptyRegionProps, type NoResultsRegionProps } from './components/table/TableStates'

// 05B.2 · structure
export { SectionHeader, type SectionHeaderProps, type HeadingLevel } from './components/structure/SectionHeader'
export { ContentSection, type ContentSectionProps } from './components/structure/ContentSection'
export { InfoGroup, type InfoGroupProps, type InfoItem } from './components/structure/InfoGroup'
export { KeyValueGroup, type KeyValueGroupProps, type KeyValueItem } from './components/structure/KeyValueGroup'
export { Metric, MetricGroup, type MetricProps, type MetricGroupProps } from './components/structure/Metric'
export { ContextPanel, PanelSection, type ContextPanelProps } from './components/structure/ContextPanel'
export { DetailPanel, type DetailPanelProps } from './components/structure/DetailPanel'
export { Expandable, type ExpandableProps } from './components/structure/Expandable'
export { EmptySection, type EmptySectionProps } from './components/structure/EmptySection'
export { MissingValue } from './components/structure/shared'
export { Dialog, type DialogProps, type DialogSize } from './components/structure/Dialog'
export { ConfirmDialog, type ConfirmDialogProps } from './components/structure/ConfirmDialog'
export { SideSheet, type SideSheetProps } from './components/structure/SideSheet'
export { Drawer, type DrawerProps } from './components/structure/Drawer'
