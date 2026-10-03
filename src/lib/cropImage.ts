/** Pixel crop rectangle from react-easy-crop's `onCropComplete`. */
export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image_load_failed'))
    img.src = src
  })
}

/**
 * Render the selected crop area to a square canvas and export a compressed
 * image blob (WebP, JPEG fallback). `size` is the output edge in px.
 */
export async function getCroppedBlob(
  src: string,
  crop: CropArea,
  size = 512,
): Promise<Blob> {
  const image = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas_unsupported')

  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size,
  )

  const toBlob = (type: string, quality?: number) =>
    new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality))

  const webp = await toBlob('image/webp', 0.85)
  if (webp && webp.type === 'image/webp') return webp
  const jpeg = await toBlob('image/jpeg', 0.85)
  if (jpeg) return jpeg
  throw new Error('image_encode_failed')
}
