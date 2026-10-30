import { useEffect, useRef, useState } from 'react'
import { Dialog as RadixDialog } from 'radix-ui'
import Cropper from 'react-easy-crop'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { FormFeedback, toast } from '../ui'
import { getCroppedBlob, type CropArea } from '../../lib/cropImage'

export default function ProfilePhotoDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('common')
  const { uploadAvatar } = useAuth()
  const [src, setSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<CropArea | null>(null)
  const [error, setError] = useState('')
  const [mediaReady, setMediaReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const busy = useRef(false)

  useEffect(() => () => { if (src) URL.revokeObjectURL(src) }, [src])

  const selectFile = (file?: File) => {
    setError('')
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError(t('settings.photo.typeError'))
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError(t('settings.photo.sizeError'))
      return
    }
    setArea(null)
    setMediaReady(false)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setSrc(URL.createObjectURL(file))
  }

  const save = async () => {
    if (!src || !area || !mediaReady || busy.current) return
    busy.current = true
    setSaving(true)
    setError('')
    try {
      const blob = await getCroppedBlob(src, area)
      await uploadAvatar.mutateAsync(blob)
      toast(t('settings.photo.saved'), 'success')
      onClose()
    } catch {
      setError(t('settings.photo.saveError'))
    } finally {
      busy.current = false
      setSaving(false)
    }
  }

  return (
    <RadixDialog.Root open onOpenChange={open => { if (!open && !busy.current) onClose() }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="modal-backdrop" />
        <RadixDialog.Content className="card card-pad photo-dialog">
          <RadixDialog.Title>{t('settings.photo.dialogTitle')}</RadixDialog.Title>
          <RadixDialog.Description className="ds-meta">{t('settings.photo.help')}</RadixDialog.Description>
          <label className="photo-picker">
            <span>{t('settings.photo.choose')}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" disabled={saving}
              onChange={event => { selectFile(event.target.files?.[0]); event.target.value = '' }} />
          </label>
          {src && <>
            <div className="photo-crop">
              <Cropper key={src} image={src} crop={crop} zoom={zoom} aspect={1} cropShape="round"
                showGrid={false} onCropChange={value => { if (!busy.current) setCrop(value) }} onZoomChange={value => { if (!busy.current) setZoom(value) }}
                onCropComplete={(_, pixels) => setArea(pixels)}
                onMediaLoaded={() => setMediaReady(true)}
                mediaProps={{ onError: () => { setMediaReady(false); setArea(null); setError(t('settings.photo.imageError')) } }}
                cropperProps={{ 'aria-label': t('settings.photo.position'), 'aria-disabled': saving }} />
              {saving && <div className="photo-crop-busy" />}
            </div>
            <label className="photo-zoom">
              <span>{t('settings.photo.zoom')}</span>
              <input type="range" min="1" max="3" step="0.05" value={zoom} disabled={saving}
                onChange={event => setZoom(Number(event.target.value))} />
            </label>
          </>}
          {error && <FormFeedback>{error}</FormFeedback>}
          <div className="photo-actions">
            <button type="button" className="ds-btn ds-btn-secondary" disabled={saving} onClick={onClose}>{t('actions.cancel')}</button>
            <button type="button" className="ds-btn ds-btn-primary" disabled={!area || !mediaReady || saving} onClick={() => void save()}>
              {saving ? t('settings.photo.saving') : t('actions.save')}
            </button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
