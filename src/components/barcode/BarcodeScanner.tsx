"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeScannerConfig } from "html5-qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff } from "lucide-react"

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
  title?: string
  description?: string
}

export function BarcodeScanner({
  onScanSuccess,
  onScanError,
  title = "Barcode Scanner",
  description = "Point your camera at a barcode or QR code",
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanned, setLastScanned] = useState<string>("")

  useEffect(() => {
    if (!isScanning) return

    const config: Html5QrcodeScannerConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [],
    }

    const scanner = new Html5QrcodeScanner("barcode-scanner", config, false)

    scanner.render(
      (decodedText) => {
        // Prevent duplicate scans
        if (decodedText === lastScanned) return

        setLastScanned(decodedText)
        onScanSuccess(decodedText)

        // Optionally pause scanner briefly after successful scan
        scanner.pause(true)
        setTimeout(() => {
          if (scannerRef.current) {
            scanner.resume()
          }
        }, 1000)
      },
      (error) => {
        // Only log errors if callback provided
        if (onScanError && !error.includes("NotFoundException")) {
          onScanError(error)
        }
      }
    )

    scannerRef.current = scanner

    return () => {
      scanner.clear().catch(console.error)
      scannerRef.current = null
    }
  }, [isScanning, onScanSuccess, onScanError, lastScanned])

  const toggleScanner = () => {
    setIsScanning(!isScanning)
    setLastScanned("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Button onClick={toggleScanner} variant={isScanning ? "destructive" : "default"}>
            {isScanning ? (
              <>
                <CameraOff className="mr-2 h-4 w-4" />
                Stop Scanner
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Start Scanner
              </>
            )}
          </Button>
        </div>

        {isScanning && (
          <div id="barcode-scanner" className="w-full flex justify-center" />
        )}

        {!isScanning && (
          <div className="text-center text-muted-foreground py-8">
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>Click "Start Scanner" to begin scanning</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}