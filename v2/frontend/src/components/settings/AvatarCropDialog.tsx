'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface AvatarCropDialogProps {
  imageSrc: string | null
  onConfirm: (blob: Blob) => Promise<void>
  onCancel: () => void
}

function getCroppedBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const size = 400
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')!
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    size,
    size,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/jpeg', 0.92)
  })
}

export function AvatarCropDialog({ imageSrc, onConfirm, onCancel }: AvatarCropDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [uploading, setUploading] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initial = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
      width,
      height,
    )
    setCrop(initial)
  }, [])

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return
    setUploading(true)
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop)
      await onConfirm(blob)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={!!imageSrc} onOpenChange={(open) => { if (!uploading && !open) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar foto</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              className="max-h-80"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={onImageLoad}
                className="max-h-80 object-contain"
                alt="Crop"
              />
            </ReactCrop>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={uploading} className="cursor-pointer">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!completedCrop || uploading} className="cursor-pointer">
            {uploading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Enviando...
              </span>
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
