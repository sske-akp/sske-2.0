"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  parseMotorBarcode,
  ParsedBarcodeResult,
  getItemTypeLabel,
} from "@/lib/barcodeParser";
import { playSuccessBeep, playErrorBeep } from "@/lib/scannerSound";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Package,
} from "lucide-react";

export interface TargetModelOption {
  hp: string;
  modelId: string;
  modelName: string;
}

interface CameraBarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Available models to choose as destination */
  availableModels: TargetModelOption[];
  /** Pre-selected model ID (if launched directly from a model row) */
  initialModelId?: string;
  /** Callback when user confirms adding scanned serials */
  onAddSerials: (targetModelId: string, serials: string[]) => void;
  /** Advanced callback with full parsed results (model, serial, type) */
  onAddParsedBatch?: (items: ParsedBarcodeResult[], fallbackModelId: string) => void;
}

export function CameraBarcodeScanner({
  open,
  onOpenChange,
  availableModels,
  initialModelId,
  onAddSerials,
  onAddParsedBatch,
}: CameraBarcodeScannerProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>(
    initialModelId || (availableModels[0]?.modelId ?? "")
  );

  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true);

  // Scanned results in this session
  const [scannedItems, setScannedItems] = useState<ParsedBarcodeResult[]>([]);
  const [lastScanned, setLastScanned] = useState<ParsedBarcodeResult | null>(
    null
  );

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "motor-qr-reader";
  const lastScannedTimeRef = useRef<{ code: string; time: number }>({
    code: "",
    time: 0,
  });

  // Track whether the user explicitly picked a model or opened from a specific row
  const isLockedToInitialModel = Boolean(initialModelId);

  // Sync initial model selection
  useEffect(() => {
    if (initialModelId) {
      setSelectedModelId(initialModelId);
    } else if (availableModels.length > 0 && !selectedModelId) {
      setSelectedModelId(availableModels[0].modelId);
    }
  }, [initialModelId, availableModels, selectedModelId]);

  // Reset session on modal open
  useEffect(() => {
    if (open) {
      setScannedItems([]);
      setLastScanned(null);
      setTorchOn(false);
    }
  }, [open]);

  // Helper to find matching model in inventory
  const findMatchingModel = useCallback(
    (barcodeModelName?: string) => {
      if (!barcodeModelName) return null;
      const cleanScanned = barcodeModelName.replace(/\s*\+\s*/g, "+").toLowerCase();
      return (
        availableModels.find((m) => {
          const cleanModel = m.modelName.replace(/\s*\+\s*/g, "+").toLowerCase();
          return cleanModel === cleanScanned;
        }) || null
      );
    },
    [availableModels]
  );

  // Handle scanned decoded text
  const handleBarcodeDecoded = useCallback(
    (decodedText: string) => {
      const trimmed = decodedText.trim();
      const now = Date.now();

      // Debounce identical scans within 1.8 seconds to prevent rapid duplicate beeps
      if (
        lastScannedTimeRef.current.code === trimmed &&
        now - lastScannedTimeRef.current.time < 1800
      ) {
        return;
      }
      lastScannedTimeRef.current = { code: trimmed, time: now };

      const parsed = parseMotorBarcode(trimmed);

      if (!parsed.isValid) {
        playErrorBeep();
        toast.error(`Invalid barcode format: ${parsed.error || "Unknown error"}`);
        setLastScanned(parsed);
        return;
      }

      // If barcode contains a model name, check if it matches an existing inventory model
      if (parsed.model && !isLockedToInitialModel) {
        const matched = findMatchingModel(parsed.model);
        if (matched) {
          setSelectedModelId(matched.modelId);
        }
      }

      // Check if already in scanned session list
      setScannedItems((prev) => {
        const alreadyExists = prev.some(
          (item) => item.serial.toLowerCase() === parsed.serial.toLowerCase()
        );

        if (alreadyExists) {
          playErrorBeep();
          toast.warning(`Serial ${parsed.serial} was already scanned in this batch`);
          return prev;
        }

        playSuccessBeep();
        const typeLabel = getItemTypeLabel(parsed.itemType);
        const toastMsg = parsed.model
          ? `Scanned: ${parsed.serial} (${parsed.model}${typeLabel ? ` • ${typeLabel}` : ""})`
          : `Scanned: ${parsed.serial}`;

        toast.success(toastMsg);
        setLastScanned(parsed);

        // If continuous mode is disabled, auto commit single scan
        if (!continuousMode && selectedModelId) {
          if (onAddParsedBatch) {
            onAddParsedBatch([parsed], selectedModelId);
          } else {
            onAddSerials(selectedModelId, [parsed.serial]);
          }
          onOpenChange(false);
        }

        return [...prev, parsed];
      });
    },
    [
      continuousMode,
      selectedModelId,
      isLockedToInitialModel,
      findMatchingModel,
      onAddSerials,
      onAddParsedBatch,
      onOpenChange,
    ]
  );

  // Stop the camera scanner cleanly
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {
        // Suppress benign stop errors
      }
      scannerRef.current = null;
      setIsScanning(false);
      setTorchOn(false);
      setHasTorch(false);
    }
  }, []);

  // Start scanning using html5-qrcode
  const startScanner = useCallback(
    async (cameraId?: string) => {
      await stopScanner();

      // Verify DOM container exists
      const element = document.getElementById(containerId);
      if (!element) return;

      try {
        const scanner = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
          ],
          verbose: false,
        });

        scannerRef.current = scanner;

        // Camera config
        const cameraConfig = cameraId
          ? { deviceId: { exact: cameraId } }
          : { facingMode: "environment" };

        await scanner.start(
          cameraConfig,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minDim = Math.min(viewfinderWidth, viewfinderHeight);
              return {
                width: Math.floor(Math.min(viewfinderWidth * 0.85, 340)),
                height: Math.floor(Math.min(minDim * 0.55, 220)),
              };
            },
            aspectRatio: 1.333333,
          },
          (decodedText) => handleBarcodeDecoded(decodedText),
          () => {
            // Frame scan failure ignored
          }
        );

        setIsScanning(true);

        // Check torch capability
        try {
          const capabilities = scanner.getRunningTrackCapabilities();
          if (capabilities && "torch" in capabilities) {
            setHasTorch(true);
          }
        } catch {
          setHasTorch(false);
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to access camera";
        toast.error(`Camera error: ${errorMsg}`);
        setIsScanning(false);
      }
    },
    [stopScanner, handleBarcodeDecoded]
  );

  // Initialize camera list and start scanner when dialog opens
  useEffect(() => {
    if (!open) {
      stopScanner();
      return;
    }

    let isMounted = true;

    async function initCameras() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length > 0) {
          const formatted = devices.map((d) => ({
            id: d.id,
            label: d.label || `Camera ${d.id.slice(0, 5)}`,
          }));
          setCameras(formatted);

          // Prefer back/rear camera on smartphones
          const backCam = formatted.find(
            (c) =>
              c.label.toLowerCase().includes("back") ||
              c.label.toLowerCase().includes("rear") ||
              c.label.toLowerCase().includes("environment")
          );

          const defaultCamId = backCam ? backCam.id : formatted[0].id;
          setSelectedCameraId(defaultCamId);
          await startScanner(defaultCamId);
        } else {
          await startScanner();
        }
      } catch {
        if (isMounted) {
          await startScanner();
        }
      }
    }

    const timer = setTimeout(() => {
      initCameras();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [open, startScanner, stopScanner]);

  // Toggle flashlight / torch
  const handleToggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        // @ts-expect-error torch is valid in constraint spec
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch {
      toast.error("Flashlight not supported on this camera");
    }
  };

  // Switch camera
  const handleCameraChange = async (newCamId: string) => {
    setSelectedCameraId(newCamId);
    await startScanner(newCamId);
  };

  // Remove a scanned item from current batch
  const handleRemoveScanned = (serialToRemove: string) => {
    setScannedItems((prev) =>
      prev.filter((item) => item.serial !== serialToRemove)
    );
  };

  // Confirm and submit all scanned serials
  const handleConfirmBatch = () => {
    if (scannedItems.length === 0) {
      toast.error("No serial numbers scanned yet");
      return;
    }

    if (!selectedModelId && !scannedItems.some((item) => Boolean(item.model))) {
      toast.error("Please select a target motor model");
      return;
    }

    if (onAddParsedBatch) {
      onAddParsedBatch(scannedItems, selectedModelId);
      onOpenChange(false);
      return;
    }

    const uniqueSerials = Array.from(
      new Set(scannedItems.map((item) => item.serial))
    );

    if (selectedModelId) {
      onAddSerials(selectedModelId, uniqueSerials);
      toast.success(`Added ${uniqueSerials.length} serials to model`);
    }
    onOpenChange(false);
  };

  const selectedModel = availableModels.find(
    (m) => m.modelId === selectedModelId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden max-h-[92vh] flex flex-col">
        <DialogHeader className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Scan Motor Barcodes
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Supports 4-part &amp; 2-part motor/pump barcode formats
                </DialogDescription>
              </div>
            </div>

            {/* Continuous scan toggle */}
            <div className="flex items-center gap-1.5 mr-6">
              <Button
                type="button"
                size="sm"
                variant={continuousMode ? "default" : "outline"}
                className="h-7 text-xs px-2.5 rounded-full"
                onClick={() => setContinuousMode(!continuousMode)}
              >
                <Zap className="h-3 w-3 mr-1" />
                {continuousMode ? "Continuous: ON" : "Single Scan"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Destination Model Selection */}
        <div className="px-4 py-2.5 bg-muted/10 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-medium text-muted-foreground shrink-0">
            Target Motor Model:
          </div>
          <Select
            value={selectedModelId}
            onValueChange={setSelectedModelId}
          >
            <SelectTrigger className="h-8 text-xs max-w-sm font-medium">
              <SelectValue
                placeholder={
                  availableModels.length === 0
                    ? "Auto-detect model from barcode"
                    : "Select target model..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableModels.length === 0 && (
                <SelectItem value="auto" disabled>
                  Auto-detect model from barcode
                </SelectItem>
              )}
              {availableModels.map((m) => (
                <SelectItem key={m.modelId} value={m.modelId}>
                  <span className="font-semibold text-amber-600 mr-1.5">
                    [{m.hp}]
                  </span>
                  {m.modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative bg-black flex-1 min-h-[260px] max-h-[350px] flex items-center justify-center overflow-hidden">
          {/* HTML5 QR Container */}
          <div id={containerId} className="w-full h-full" />

          {/* Controls Overlay (Camera Switch & Flashlight) */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {hasTorch && (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs border border-white/20"
                onClick={handleToggleTorch}
                title={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
              >
                {torchOn ? (
                  <Flashlight className="h-4 w-4 text-amber-400" />
                ) : (
                  <FlashlightOff className="h-4 w-4" />
                )}
              </Button>
            )}

            {cameras.length > 1 && (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs border border-white/20"
                onClick={() => {
                  const currentIndex = cameras.findIndex(
                    (c) => c.id === selectedCameraId
                  );
                  const nextIndex = (currentIndex + 1) % cameras.length;
                  handleCameraChange(cameras[nextIndex].id);
                }}
                title="Switch Camera"
              >
                <SwitchCamera className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Live Scan Status Pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            {isScanning ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-black/70 text-emerald-400 border border-emerald-500/40 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Point camera at barcode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-black/70 text-amber-400 border border-amber-500/40 backdrop-blur-xs">
                Starting camera...
              </span>
            )}
          </div>
        </div>

        {/* Last Scanned Feedback Bar */}
        {lastScanned && (
          <div
            className={`px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b ${
              lastScanned.isValid
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {lastScanned.isValid ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              )}

              <span className="font-mono font-bold">
                Serial: {lastScanned.serial}
              </span>

              {lastScanned.model && (
                <Badge
                  variant="secondary"
                  className="text-[11px] font-medium gap-1 bg-background/80"
                >
                  <Package className="h-3 w-3 text-amber-500" />
                  Model: {lastScanned.model}
                </Badge>
              )}

              {lastScanned.itemType && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-medium border-emerald-600/30 text-emerald-700 bg-emerald-500/10"
                >
                  {getItemTypeLabel(lastScanned.itemType)} ({lastScanned.itemType})
                </Badge>
              )}
            </div>

            {lastScanned.error ? (
              <span className="text-[11px] text-destructive">
                {lastScanned.error}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">
                {lastScanned.formatDetected}
              </span>
            )}
          </div>
        )}

        {/* Batch Scanned Serials List */}
        <div className="p-4 bg-background space-y-2 flex-1 overflow-y-auto max-h-52 border-b">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              Scanned in this session:
              <Badge variant="secondary" className="font-mono text-xs">
                {scannedItems.length}
              </Badge>
            </span>

            {scannedItems.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 text-[11px] text-muted-foreground hover:text-destructive gap-1 px-1.5"
                onClick={() => setScannedItems([])}
              >
                <RotateCcw className="h-3 w-3" /> Clear list
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px] max-h-32 overflow-y-auto p-2 rounded-md bg-muted/30 border border-dashed">
            {scannedItems.length === 0 ? (
              <div className="w-full text-center py-2 text-xs text-muted-foreground italic">
                No items scanned yet. Point the camera at any motor barcode.
              </div>
            ) : (
              scannedItems.map((item) => (
                <div
                  key={item.serial}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border shadow-2xs text-xs font-mono"
                >
                  <span className="font-bold">{item.serial}</span>

                  {item.model && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-sans">
                      {item.model}
                    </span>
                  )}

                  {item.itemType && (
                    <span className="text-[10px] font-semibold text-emerald-600 font-sans">
                      [{item.itemType}]
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveScanned(item.serial)}
                    className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive focus:outline-hidden"
                    title={`Remove ${item.serial}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-3 bg-muted/20 flex flex-row items-center justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirmBatch}
            disabled={
              scannedItems.length === 0 ||
              (!selectedModelId && !scannedItems.some((i) => Boolean(i.model)))
            }
            className="gap-1.5 font-medium"
          >
            <CheckCircle2 className="h-4 w-4" />
            Add {scannedItems.length}{" "}
            {scannedItems.length === 1 ? "Serial" : "Serials"}
            {selectedModel ? ` to ${selectedModel.modelName}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
