import { CameraOff, LoaderCircle, ScanLine, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { IScannerControls } from '@zxing/browser'
import { isSupportedProductBarcode, normalizeBarcode } from '../lib/barcode'

type Props = {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export function BarcodeCameraScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [state, setState] = useState<'starting' | 'ready' | 'error'>('starting')
  const [message, setMessage] = useState('Opening the rear camera…')

  useEffect(() => {
    let active = true
    const stop = () => {
      controlsRef.current?.stop()
      controlsRef.current = null
      const stream = videoRef.current?.srcObject
      if (typeof MediaStream !== 'undefined' && stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop())
    }

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
        setState('error')
        setMessage('Camera scanning is not supported by this browser. Enter the EAN-13 barcode manually.')
        return
      }
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        if (!active || !videoRef.current) return
        const reader = new BrowserMultiFormatReader()
        let controls: IScannerControls | undefined
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
          videoRef.current,
          (result) => {
            if (!active || !result) return
            const barcode = normalizeBarcode(result.getText())
            if (!isSupportedProductBarcode(barcode)) {
              setMessage('A code was detected, but sork. needs an 8–14 digit product barcode. Keep the barcode in frame or enter it manually.')
              return
            }
            controls?.stop()
            onDetected(barcode)
          },
        )
        controlsRef.current = controls
        if (active) {
          setState('ready')
          setMessage('Hold a product barcode inside the frame. The lookup will start automatically.')
        }
      } catch (error) {
        if (!active) return
        setState('error')
        const detail = error instanceof Error && /notallowed|permission/i.test(error.name + error.message)
          ? 'Camera permission was not granted. Allow camera access or enter the barcode manually.'
          : 'The camera could not start. Enter the barcode manually and try again later.'
        setMessage(detail)
      }
    }
    void start()
    return () => { active = false; stop() }
  }, [onDetected])

  return (
    <div className="camera-modal" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
      <div className="camera-modal__panel">
        <div className="camera-modal__header"><div><p className="eyebrow">Mobile barcode scan</p><h2 id="scanner-title">Aim at the barcode.</h2></div><button type="button" onClick={onClose} aria-label="Close camera scanner"><X size={20} /></button></div>
        <div className="camera-preview">
          <video ref={videoRef} autoPlay muted playsInline />
          <div className="camera-frame" aria-hidden="true"><span /><span /><span /><span /></div>
        </div>
        <p className={state === 'error' ? 'camera-message camera-message--error' : 'camera-message'}>
          {state === 'starting' ? <LoaderCircle className="spin" size={16} /> : state === 'error' ? <CameraOff size={16} /> : <ScanLine size={16} />} {message}
        </p>
        {state === 'error' ? <button type="button" className="text-button" onClick={onClose}>Use manual entry</button> : null}
      </div>
    </div>
  )
}
