import { useState } from 'react'
import { useTheme } from '../../components/ui/theme'
import {
  Avatar, Breadcrumbs, Button, ButtonGroup, Checkbox, Chip, ConfirmDialog, ContentSection, ContextPanel, Counter,
  CurrencyInput, DataTable, DateInput, DetailPanel, Dialog, Divider, Drawer, EmptySection, EmptyState, Expandable,
  IconButton, InfoGroup, InlineAlert, IntelligenceMark, KeyValueGroup, Kbd, Menu, MenuItem, MenuSeparator, Metric,
  MetricGroup, MobileNavDrawer, MultiSelect, NotificationIndicator, NumberInput, PanelSection, Popover, Progress,
  QuolyMark, Radio, SearchInput, SectionHeader, SegmentedControl, Select, SideSheet, Sidebar, Skeleton, Spinner,
  SplitButton, StatusBadge, Switch, TableCell, TablePagination, TableToolbar, Tabs, Tag, TextButton, TextInput,
  Textarea, Toast, Tooltip, TooltipBubble, ValidationMessage, notify, type DataTableColumn, type NavItem,
} from '..'
import './showcase.scss'

type QuoteRow = {
  id: string
  supplier: string
  ref: string
  total: number | null
  currency: string
  qty: number
  due: string
  status: { text: string, tone: 'success' | 'warning' | 'error' | 'info' | 'ai' | 'neutral' }
}

/* Datos ficticios de demostración. */
const ROWS: QuoteRow[] = [
  { id: 'q-1', supplier: 'Empaques del Norte (ficticio)', ref: 'PRV-0056', total: 184250.5, currency: 'MXN', qty: 12000, due: '2026-11-04', status: { text: 'Recibida', tone: 'success' } },
  { id: 'q-2', supplier: 'Cartonera Andina (ficticio)', ref: 'PRV-0087', total: 176900, currency: 'MXN', qty: 12000, due: '2026-10-30', status: { text: 'Pendiente de revisión', tone: 'ai' } },
  { id: 'q-3', supplier: 'Corrugados Delta (ficticio)', ref: 'PRV-0142', total: null, currency: 'MXN', qty: 10000, due: '2026-10-27', status: { text: 'Sin respuesta', tone: 'warning' } },
  { id: 'q-4', supplier: 'Envases Pacífico (ficticio)', ref: 'PRV-0174', total: 9120.75, currency: 'USD', qty: 12000, due: '2026-11-12', status: { text: 'Declinada', tone: 'error' } },
]

const NAV: NavItem[] = [
  { value: 'home', label: 'Inicio', icon: 'house' },
  { value: 'rfq', label: 'Solicitudes', icon: 'files', count: 12 },
  { value: 'quotes', label: 'Cotizaciones', icon: 'quotes', count: 4 },
  { value: 'suppliers', label: 'Proveedores', icon: 'users-three' },
]

const COLOR_ROLES = [
  'canvas', 'surface', 'surface-elevated', 'surface-sunken', 'surface-inverse', 'brand', 'action-primary-bg',
  'text-primary', 'text-secondary', 'border', 'border-strong', 'selection-bg',
  'status-success-text', 'status-warning-text', 'status-error-text', 'status-info-text', 'status-ai-text', 'status-neutral-text',
]

const TYPE_ROLES = ['display-lg', 'heading-xl', 'heading-md', 'title-lg', 'body-lg', 'body-md', 'body-sm', 'label-lg', 'label-md', 'caption', 'figure-lg', 'data-md']

export default function DesignSystemShowcase() {
  const { theme, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [nav, setNav] = useState('rfq')
  const [tableState, setTableState] = useState<'ready' | 'loading' | 'empty' | 'no-results' | 'error'>('ready')
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [segment, setSegment] = useState('all')
  const [date, setDate] = useState('2026-11-04')
  const [multi, setMulti] = useState<string[]>(['mx', 'co', 'pe'])
  const [search, setSearch] = useState('')
  const [overlay, setOverlay] = useState<null | 'dialog' | 'confirm' | 'sheet' | 'drawer' | 'bottom' | 'nav'>(null)
  const close = () => setOverlay(null)

  const columns: DataTableColumn<QuoteRow>[] = [
    { key: 'supplier', header: 'Proveedor', type: 'identity', sortable: true, minWidth: 220, render: (r) => <TableCell type="identity" value={r.supplier} secondary={r.ref} /> },
    { key: 'total', header: 'Total', type: 'money', group: 'Oferta', sortable: true, width: 170, render: (r) => <TableCell type="money" value={r.total} currency={r.currency} reason="Sin cotización" /> },
    { key: 'qty', header: 'Cantidad', type: 'number', group: 'Oferta', width: 130, render: (r) => <TableCell type="number" value={r.qty} unit="uds" /> },
    { key: 'due', header: 'Vence', type: 'date', sortable: true, width: 140, hideBelow: 720, render: (r) => <TableCell type="date" value={r.due} tone={r.id === 'q-3' ? 'overdue' : undefined} note={r.id === 'q-3' ? 'Hace 2 días' : undefined} /> },
    { key: 'status', header: 'Estado', type: 'status', width: 190, render: (r) => <TableCell type="status" value={r.status.text} tone={r.status.tone} /> },
    {
      key: 'actions', type: 'actions', width: 150,
      render: () => <IconButton icon="dots-three" label="Más acciones" size="xs" />,
      primary: () => <TextButton size="sm">Abrir</TextButton>,
    },
  ]

  return (
    <div className="ds-sc">
      <header className="ds-sc-top">
        <span className="ds-sc-brand"><QuolyMark size={24} />Quoly 2.0 · Design System</span>
        <StatusBadge tone="info">Datos ficticios</StatusBadge>
        <Button variant="secondary" size="sm" icon={theme === 'dark' ? 'circle-half' : 'circle-half'} onClick={toggleTheme}>
          {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
        </Button>
      </header>

      <main className="ds-sc-main">
        <ContentSection title="01 · Color" description="Roles --color-* (claro/oscuro). La marca coral es interacción, foco y selección; nunca «mejor».">
          <div className="ds-sc-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {COLOR_ROLES.map((r) => (
              <div key={r} className="ds-sc-swatch">
                <span style={{ background: `var(--color-${r})` }} />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </ContentSection>

        <ContentSection title="02 · Tipografía" description="Outfit (display, títulos, cifras destacadas) + Inter (texto, controles, datos). Cifras tabulares.">
          <div className="ds-sc-stack">
            {TYPE_ROLES.map((r) => (
              <div key={r} className="ds-sc-row" style={{ alignItems: 'baseline' }}>
                <span className="q-type-caption" style={{ width: 120, color: 'var(--color-text-secondary)' }}>{r}</span>
                <span className={`q-type-${r}`}>{r.startsWith('figure') || r.startsWith('data') ? '1.284.500,00' : 'Comparar ofertas de proveedores'}</span>
              </div>
            ))}
          </div>
        </ContentSection>

        <ContentSection title="04 · Iconografía" description="Phosphor curado + Quoly Intelligence Graph.">
          <div className="ds-sc-row">
            <IntelligenceMark size={24} />
            <IntelligenceMark size={24} variant="proposed" />
            <IntelligenceMark size={24} processing />
            <IntelligenceMark size={32} />
          </div>
        </ContentSection>

        <ContentSection title="05A · Acciones">
          <div className="ds-sc-stack">
            <div className="ds-sc-row">
              <Button>Enviar solicitud</Button>
              <Button variant="secondary" icon="paperclip">Adjuntar</Button>
              <Button variant="tertiary">Cancelar</Button>
              <Button variant="destructive" icon="trash">Eliminar</Button>
              <Button variant="destructive-strong">Confirmar eliminación</Button>
              <Button loading>Guardando</Button>
              <Button disabled>Deshabilitado</Button>
            </div>
            <div className="ds-sc-row">
              <Button size="xs">xs</Button>
              <Button size="sm">sm</Button>
              <Button size="md">md</Button>
              <Button size="lg">lg</Button>
              <Button size="xl" iconEnd="arrow-square-out">xl</Button>
            </div>
            <div className="ds-sc-row">
              <IconButton icon="pencil-simple" label="Editar" />
              <IconButton icon="copy" label="Copiar" variant="secondary" />
              <IconButton icon="flag" label="Marcar" selected />
              <IconButton icon="trash" label="Eliminar" variant="destructive" />
              <TextButton icon="plus">Agregar proveedor</TextButton>
              <TextButton tone="destructive">Quitar</TextButton>
              <SplitButton icon="export" onClick={() => notify({ title: 'Exportación iniciada', children: 'Te avisaremos al terminar.' })}>Exportar decisión</SplitButton>
              <SplitButton variant="secondary">Exportar</SplitButton>
            </div>
            <ButtonGroup
              attached
              label="Vista"
              items={[{ label: 'Tabla', icon: 'columns', selected: true }, { label: 'Tarjetas' }, { icon: 'list', ariaLabel: 'Lista' }]}
            />
          </div>
        </ContentSection>

        <ContentSection title="05A · Campos">
          <div className="ds-sc-grid">
            <TextInput label="Nombre de la solicitud" placeholder="Ej. Caja corrugada 40×30" required />
            <TextInput label="Correo del proveedor" icon="envelope-simple" defaultValue="ventas@ejemplo.test" description="Usaremos este correo para enviar la solicitud." />
            <TextInput label="Referencia" defaultValue="RFQ-0318" readOnly />
            <TextInput label="Código postal" defaultValue="0600" status="error" message="El código postal debe tener 5 dígitos." />
            <NumberInput label="Cantidad" unit="uds" defaultValue="12000" />
            <CurrencyInput label="Precio objetivo" defaultValue="14.50" currency="MXN" currencies={['MXN', 'USD', 'EUR']} unit="ud" />
            <Select label="Incoterm" placeholder="Seleccionar" options={['EXW', 'FCA', 'FOB', 'CIF', 'DAP', 'DDP']} />
            <MultiSelect
              label="Países"
              value={multi}
              onChange={setMulti}
              options={[{ value: 'mx', label: 'México' }, { value: 'co', label: 'Colombia' }, { value: 'pe', label: 'Perú', meta: '3 proveedores' }, { value: 'cl', label: 'Chile' }]}
            />
            <DateInput label="Fecha límite" value={date} onChange={setDate} />
            <SearchInput label="Buscar" placeholder="Buscar proveedores" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} shortcut="/" />
            <Textarea label="Notas para proveedores" maxLength={280} placeholder="Condiciones de entrega, tolerancias…" optionalLabel="opcional" />
            <TextInput label="Deshabilitado" placeholder="No editable" disabled />
          </div>
        </ContentSection>

        <ContentSection title="05A · Selección">
          <div className="ds-sc-grid">
            <div className="ds-sc-stack">
              <Checkbox label="Incluir flete" defaultChecked />
              <Checkbox label="Parcial" indeterminate />
              <Checkbox label="Acepto los términos" status="error" message="Necesario para continuar." />
              <Checkbox label="Deshabilitado" disabled />
            </div>
            <div className="ds-sc-stack" role="radiogroup" aria-label="Entrega">
              <Radio name="ship" value="a" label="Entrega en planta" description="Proveedor entrega en el destino." defaultChecked />
              <Radio name="ship" value="b" label="Recolección" />
              <Radio name="ship" value="c" label="No disponible" disabled />
            </div>
            <div className="ds-sc-stack">
              <Switch label="Recordatorios automáticos" description="Cada 48 h a proveedores sin respuesta." defaultChecked />
              <Switch label="Con etiquetas" stateLabels={['Sí', 'No']} />
              <Switch label="Guardando" loading defaultChecked />
              <SegmentedControl
                label="Filtro"
                value={segment}
                onChange={setSegment}
                options={[{ value: 'all', label: 'Todas', count: 24 }, { value: 'open', label: 'Abiertas', count: 9 }, { value: 'closed', label: 'Cerradas' }]}
              />
            </div>
          </div>
        </ContentSection>

        <ContentSection title="05A · Indicadores">
          <div className="ds-sc-stack">
            <div className="ds-sc-row">
              <StatusBadge tone="success">Recibida</StatusBadge>
              <StatusBadge tone="warning">Por vencer</StatusBadge>
              <StatusBadge tone="error">Declinada</StatusBadge>
              <StatusBadge tone="info">Enviada</StatusBadge>
              <StatusBadge tone="ai">Propuesto por IA</StatusBadge>
              <StatusBadge>Borrador</StatusBadge>
              <StatusBadge tone="success" variant="strong">Adjudicada</StatusBadge>
              <StatusBadge tone="warning" variant="quiet">Pendiente</StatusBadge>
            </div>
            <div className="ds-sc-row">
              <Tag>Corrugado</Tag>
              <Tag variant="outline" icon="package">Caja RSC</Tag>
              <Tag variant="plain">Doble pared</Tag>
              <Chip selected count={4}>Recibidas</Chip>
              <Chip count={2}>Pendientes</Chip>
              <Chip removable>México</Chip>
              <Chip disabled>Deshabilitado</Chip>
              <Counter value={128} />
              <Counter value={7} variant="subtle" />
              <Counter value={3} tone="ai" />
              <NotificationIndicator label="3 respuestas nuevas" count={3}><IconButton icon="tray-arrow-down" label="Bandeja" /></NotificationIndicator>
              <NotificationIndicator label="Novedades"><Avatar name="Ana Ruiz" /></NotificationIndicator>
            </div>
            <div className="ds-sc-grid">
              <Progress label="Respuestas" value={3} max={5} variant="ratio" valueText="3 de 5" />
              <Progress label="Extracción" value={64} valueText="64%" tone="ai" />
              <Progress label="Pasos" variant="steps" value={2} steps={4} stepLabels={['Datos', 'Proveedores', 'Revisión', 'Envío']} />
              <Progress label="Procesando" variant="indeterminate" />
            </div>
          </div>
        </ContentSection>

        <ContentSection title="05A · Feedback">
          <div className="ds-sc-stack">
            <InlineAlert tone="info" title="Recordatorio:" divider>Dos proveedores no han respondido.</InlineAlert>
            <InlineAlert prominence="contextual" tone="ai" title="Campos propuestos por IA" actions={<TextButton size="sm">Revisar campos</TextButton>}>
              Revisa y confirma los valores extraídos antes de comparar.
            </InlineAlert>
            <InlineAlert
              prominence="blocking"
              tone="error"
              title="No se pudo enviar la solicitud"
              resolution="Verifica la conexión de correo en Configuración."
              actions={<Button variant="secondary" size="sm">Ir a Configuración</Button>}
              onDismiss={() => undefined}
            >
              El servidor de correo rechazó la autenticación.
            </InlineAlert>
            <div className="ds-sc-row">
              <ValidationMessage>Campo obligatorio.</ValidationMessage>
              <ValidationMessage tone="success">Guardado.</ValidationMessage>
              <ValidationMessage tone="warning">Revisa la unidad.</ValidationMessage>
            </div>
            <div className="ds-sc-row" style={{ alignItems: 'flex-start' }}>
              <Toast title="Solicitud enviada" onDismiss={() => undefined}>5 proveedores notificados.</Toast>
              <Toast tone="error" title="Error al guardar" action={<TextButton size="sm">Reintentar</TextButton>} />
              <Toast tone="loading" title="Extrayendo datos…" />
            </div>
            <div className="ds-sc-row">
              <TooltipBubble shortcut="⌘K">Buscar</TooltipBubble>
              <Tooltip content="Copiar referencia" shortcut="⌘C"><Button variant="secondary" size="sm">Tooltip</Button></Tooltip>
              <Popover
                trigger={<Button variant="secondary" size="sm">Popover</Button>}
                title="Plazo de respuesta"
                closable
                footer={<Button size="sm">Aplicar</Button>}
              >
                Los proveedores podrán responder hasta la fecha límite.
              </Popover>
              <Menu trigger={<Button variant="secondary" size="sm" iconEnd="caret-down">Menú</Button>}>
                <MenuItem icon="pencil-simple" shortcut="E">Editar</MenuItem>
                <MenuItem icon="copy" description="Crea un borrador con los mismos datos">Duplicar</MenuItem>
                <MenuItem selected>Ordenar por fecha</MenuItem>
                <MenuSeparator />
                <MenuItem icon="trash" tone="destructive">Eliminar</MenuItem>
                <MenuItem disabled>No disponible</MenuItem>
              </Menu>
              <Spinner showLabel />
            </div>
            <div className="ds-sc-grid">
              <div className="ds-sc-stack"><Skeleton lines={3} /><Skeleton shape="control" /><Skeleton shape="circle" /></div>
              <EmptyState title="Sin cotizaciones" actions={<Button size="sm">Crear solicitud</Button>}>Las respuestas de proveedores aparecerán aquí.</EmptyState>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="05A · Auxiliares">
          <div className="ds-sc-stack">
            <Breadcrumbs items={[{ label: 'Solicitudes', to: '/_ds' }, { label: 'RFQ-0318', to: '/_ds' }, { label: 'Comparación' }]} />
            <Tabs label="Secciones" items={[{ value: 'resumen', label: 'Resumen' }, { value: 'prov', label: 'Proveedores', count: 5 }, { value: 'docs', label: 'Documentos' }, { value: 'x', label: 'Historial', disabled: true }]} />
            <Tabs variant="secondary" items={['Todas', 'Recibidas', 'Pendientes']} />
            <div className="ds-sc-row">
              <Avatar name="Ana Ruiz" size={20} />
              <Avatar name="Ana Ruiz" size={24} />
              <Avatar name="Ana Ruiz" />
              <Avatar name="Empaques del Norte" kind="organization" size={40} />
              <Kbd keys={['⌘', 'K']} />
              <Divider orientation="vertical" />
              <span className="q-link">Enlace .q-link</span>
            </div>
            <Divider label="o" />
            <Divider tone="structural" />
          </div>
        </ContentSection>

        <ContentSection title="05A · Navegación" actions={<Button variant="secondary" size="sm" onClick={() => setOverlay('nav')}>Abrir cajón móvil</Button>}>
          <div className="ds-sc-nav">
            <Sidebar
              height="100%"
              collapsed={collapsed}
              onToggle={() => setCollapsed((c) => !c)}
              items={NAV}
              active={nav}
              onNavigate={setNav}
              onSearch={() => undefined}
              user="Ana Ruiz"
              workspace="Empaques Demo (ficticio)"
              accountMenu={<><MenuItem icon="user-circle">Perfil</MenuItem><MenuItem icon="door-open">Cerrar sesión</MenuItem></>}
            />
            <div style={{ flex: 1, padding: 24 }}>
              <SectionHeader title="Solicitudes" description="Contenido de ejemplo junto al sidebar." />
            </div>
          </div>
        </ContentSection>

        <ContentSection title="05B.1 · Tabla">
          <div className="ds-sc-stack">
            <SegmentedControl
              label="Estado de la tabla"
              value={tableState}
              onChange={setTableState}
              options={[{ value: 'ready', label: 'Datos' }, { value: 'loading', label: 'Cargando' }, { value: 'empty', label: 'Vacía' }, { value: 'no-results', label: 'Sin resultados' }, { value: 'error', label: 'Error' }]}
            />
            <DataTable
              columns={columns}
              rows={ROWS}
              state={tableState}
              selectable
              selected={selected}
              onSelectedChange={setSelected}
              rowLabel={(r) => r.supplier}
              onRowClick={() => undefined}
              empty={{ title: 'Todavía no hay cotizaciones', text: 'Envía una solicitud para recibir ofertas.', action: <Button>Crear solicitud</Button> }}
              noResults={{ onClear: () => setTableState('ready') }}
              error={{ onRetry: () => new Promise((resolve) => setTimeout(resolve, 900)).then(() => setTableState('ready')) }}
              toolbar={(
                <TableToolbar
                  title="Cotizaciones"
                  count={ROWS.length}
                  context="RFQ-0318 · Caja corrugada 40×30 (ficticio)"
                  selectedCount={selected.length}
                  onClearSelection={() => setSelected([])}
                  selectionActions={<Button size="sm" variant="secondary">Comparar</Button>}
                  groups={[<SearchInput key="s" size="sm" placeholder="Buscar" aria-label="Buscar" />, <Button key="e" size="sm" variant="secondary" icon="export">Exportar</Button>]}
                />
              )}
              footer={<TablePagination page={page} total={248} pageSize={25} onPageChange={setPage} pageSizeOptions={[25, 50, 100]} />}
            />
            <DataTable variant="contained" density="compact" columns={columns.slice(0, 3)} rows={ROWS} />
          </div>
        </ContentSection>

        <ContentSection title="05B.2 · Estructura">
          <div className="ds-sc-split">
            <div className="ds-sc-stack">
              <SectionHeader title="Resumen de la solicitud" description="Hechos clave de la RFQ." meta="Actualizado hoy" actions={<Button size="sm" variant="secondary">Editar</Button>} divider />
              <InfoGroup items={[{ label: 'Proveedores', value: '5', detail: '3 respondieron' }, { label: 'Cantidad', value: '12.000 uds' }, { label: 'Incoterm', value: 'DAP' }, { label: 'Presupuesto', value: null }]} />
              <MetricGroup dividers>
                <Metric label="Respuestas" value="3" unit="de 5" />
                <Metric label="Rango de precio" value="14,20–15,80" unit="MXN / ud" />
                <Metric label="Días restantes" value="6" marker="var(--color-dv-cat-1)" />
              </MetricGroup>
              <KeyValueGroup items={[{ label: 'Material', value: 'Cartón corrugado doble pared' }, { label: 'Dimensiones', value: '40 × 30 × 25 cm' }, { label: 'Tolerancia', value: null }, { label: 'Notas', value: 'Entrega en dos lotes con 15 días de diferencia; etiquetado por lote.', span: true, long: true }]} />
              <Expandable title="Condiciones comerciales" meta="3 campos">Pago a 30 días, entrega DAP en Monterrey.</Expandable>
              <Expandable title="Historial" defaultOpen>Solicitud creada y enviada a 5 proveedores.</Expandable>
              <ContentSection variant="delimited" title="Sección delimitada" density="dense">
                <EmptySection title="Sin documentos" text="Adjunta planos o especificaciones para los proveedores." action={<Button size="sm" variant="secondary" icon="paperclip">Adjuntar</Button>} dense />
              </ContentSection>
              <DetailPanel context="Cotización" title="Empaques del Norte (ficticio)" meta={<><span>Recibida 28 oct</span><span>PDF · 2 páginas</span></>} actions={<Button size="sm">Revisar</Button>}>
                Oferta por 12.000 cajas con entrega DAP en 15 días hábiles.
              </DetailPanel>
            </div>
            <ContextPanel title="Contexto" icon="info" footer={<TextButton size="sm">Ver todo</TextButton>}>
              <PanelSection title="Solicitud" divider={false}>
                <span className="q-type-body-sm">RFQ-0318 · enviada el 21 oct.</span>
              </PanelSection>
              <PanelSection title="Proveedores">
                <span className="q-type-body-sm">5 invitados, 3 respuestas.</span>
              </PanelSection>
            </ContextPanel>
          </div>
          <div className="ds-sc-row">
            <Button variant="secondary" onClick={() => setOverlay('dialog')}>Dialog</Button>
            <Button variant="secondary" onClick={() => setOverlay('confirm')}>ConfirmDialog</Button>
            <Button variant="secondary" onClick={() => setOverlay('sheet')}>SideSheet</Button>
            <Button variant="secondary" onClick={() => setOverlay('drawer')}>Drawer</Button>
            <Button variant="secondary" onClick={() => setOverlay('bottom')}>Drawer inferior</Button>
          </div>
          <div className="ds-sc-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))' }}>
            <Dialog inline title="Renombrar solicitud" description="El nombre es visible para los proveedores." footer={<><Button variant="secondary">Cancelar</Button><Button>Guardar</Button></>}>
              <TextInput label="Nombre" defaultValue="Caja corrugada 40×30" />
            </Dialog>
            <ConfirmDialog inline tone="destructive" title="¿Eliminar la solicitud?" description="Esta acción no se puede deshacer." details={[{ label: 'Solicitud', value: 'RFQ-0318' }, { label: 'Proveedores', value: '5' }]} confirmLabel="Eliminar" />
          </div>
        </ContentSection>
      </main>

      <Dialog open={overlay === 'dialog'} onClose={close} title="Renombrar solicitud" footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button onClick={close}>Guardar</Button></>}>
        <TextInput label="Nombre" defaultValue="Caja corrugada 40×30" />
      </Dialog>
      <ConfirmDialog open={overlay === 'confirm'} title="¿Adjudicar a Empaques del Norte?" description="Se notificará al proveedor." details={[{ label: 'Total', value: '184.250,50 MXN' }]} onCancel={close} onConfirm={close} confirmLabel="Adjudicar" />
      <SideSheet open={overlay === 'sheet'} onClose={close} title="Detalle del proveedor" description="Empaques del Norte (ficticio)" footer={<Button onClick={close}>Listo</Button>}>
        <KeyValueGroup columns={1} items={[{ label: 'Contacto', value: 'ventas@ejemplo.test' }, { label: 'País', value: 'México' }]} />
      </SideSheet>
      <Drawer open={overlay === 'drawer'} onClose={close} title="Filtros" footer={<><Button variant="secondary" onClick={close}>Limpiar</Button><Button onClick={close}>Aplicar</Button></>}>
        <Checkbox label="Solo con respuesta" />
        <Select label="Estado" options={['Todas', 'Recibidas', 'Pendientes']} />
      </Drawer>
      <Drawer side="bottom" open={overlay === 'bottom'} onClose={close} title="Acciones" footer={<Button fullWidth onClick={close}>Cerrar</Button>}>
        <span className="q-type-body-md">Cajón inferior para móvil.</span>
      </Drawer>
      <MobileNavDrawer
        open={overlay === 'nav'}
        onOpenChange={(o) => setOverlay(o ? 'nav' : null)}
        items={NAV}
        active={nav}
        onNavigate={setNav}
        onSearch={() => undefined}
        user="Ana Ruiz"
        workspace="Empaques Demo (ficticio)"
      />
    </div>
  )
}
