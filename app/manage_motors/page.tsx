"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useMotors,
  useCreateMotor,
  useUpdateMotor,
  useDeleteMotor,
  useRenameHpCategory,
  useDeleteHpCategory,
} from "@/hooks/motorsHooks";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  Search,
  Trash2,
  Pencil,
  Copy,
  Check,
  RotateCcw,
  Download,
  Boxes,
  Layers,
  Cpu,
  Package,
  Database,
  Camera,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  CameraBarcodeScanner,
  TargetModelOption,
} from "@/components/motors/CameraBarcodeScanner";
import { ParsedBarcodeResult } from "@/lib/barcodeParser";
import { MotorAPI } from "@/types/motors";
import {
  parseSerialEntry,
  getSerialStatus,
  reconcileSerials,
  getSavedDualSetMap,
  saveModelDualSet,
  isModelDualSet,
} from "@/lib/motorSerialsHelper";

// Common HP presets for quick selection
const HP_PRESETS = [
  "0.5 HP",
  "0.75 HP",
  "1.0 HP",
  "1.5 HP",
  "2.0 HP",
  "3.0 HP",
  "5.0 HP",
  "7.5 HP",
  "10.0 HP",
];

export interface MotorModelView {
  id: string;
  name: string;
  serials: string[];
  isDualSet: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface HpCategoryView {
  id: string;
  hp: string;
  models: MotorModelView[];
}

interface PendingNewModelAssignment {
  modelName: string;
  items: ParsedBarcodeResult[];
  selectedHp: string;
  isCustomHp: boolean;
  customHp: string;
  isDualSet: boolean;
}

export default function ManageMotorsPage() {
  // --------------------------------------------------------------------------
  // Live Backend Data & Mutations
  // --------------------------------------------------------------------------
  const {
    data: apiMotors = [],
    isLoading,
    isError,
    error: apiError,
    refetch,
  } = useMotors();

  const createMotorMutation = useCreateMotor();
  const updateMotorMutation = useUpdateMotor();
  const deleteMotorMutation = useDeleteMotor();
  const renameHpMutation = useRenameHpCategory();
  const deleteHpMutation = useDeleteHpCategory();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHpFilter, setSelectedHpFilter] = useState<string>("ALL");

  // Dual-Set tracking settings map for models
  const [dualSetMap, setDualSetMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDualSetMap(getSavedDualSetMap());
  }, []);

  const handleToggleDualSet = (
    modelId: string,
    modelName: string,
    newIsDual: boolean
  ) => {
    updateMotorMutation.mutate(
      { id: modelId, data: { is_dual_set: newIsDual } },
      {
        onSuccess: () => {
          saveModelDualSet(modelId, newIsDual);
          saveModelDualSet(modelName, newIsDual);
          setDualSetMap((prev) => ({
            ...prev,
            [modelId]: newIsDual,
            [modelName]: newIsDual,
          }));
          toast.success(
            newIsDual
              ? `Enabled Pump + Motor pair tracking for "${modelName}"`
              : `Set "${modelName}" as Single Unit (no P/M pair tracking)`
          );
        },
        onError: (err) => {
          toast.error("Failed to update unit tracking: " + err.message);
        },
      }
    );
  };

  // Inline serial addition input state map: { [modelId: string]: string }
  const [serialInputs, setSerialInputs] = useState<Record<string, string>>({});

  // Modals state: HP Category
  const [isAddHpOpen, setIsAddHpOpen] = useState(false);
  const [newHpName, setNewHpName] = useState("");

  const [editHpTarget, setEditHpTarget] = useState<HpCategoryView | null>(null);
  const [editHpName, setEditHpName] = useState("");

  const [deleteHpTarget, setDeleteHpTarget] = useState<HpCategoryView | null>(
    null
  );

  // Modals state: Motor Model
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [targetHpForModel, setTargetHpForModel] = useState<string>("");
  const [newModelName, setNewModelName] = useState("");
  const [newModelSerialsInput, setNewModelSerialsInput] = useState("");
  const [newModelIsDualSet, setNewModelIsDualSet] = useState(true);

  const [editModelTarget, setEditModelTarget] = useState<{
    hp: string;
    model: MotorModelView;
  } | null>(null);
  const [editModelName, setEditModelName] = useState("");
  const [editModelHp, setEditModelHp] = useState("");
  const [editModelIsDualSet, setEditModelIsDualSet] = useState(true);

  const [deleteModelTarget, setDeleteModelTarget] = useState<{
    hp: string;
    model: MotorModelView;
  } | null>(null);

  // Camera Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTargetModelId, setScannerTargetModelId] = useState<
    string | undefined
  >(undefined);

  // Enhancement 1: Modal for assigning HP to newly scanned models
  const [pendingNewModels, setPendingNewModels] = useState<
    PendingNewModelAssignment[]
  >([]);
  const [isAssignHpModalOpen, setIsAssignHpModalOpen] = useState(false);

  // Copied serials state for quick visual feedback
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Group Live Backend Data into HP Categories
  // --------------------------------------------------------------------------
  const groupedData: HpCategoryView[] = useMemo(() => {
    if (!apiMotors || !Array.isArray(apiMotors)) return [];

    const map = new Map<string, MotorModelView[]>();

    apiMotors.forEach((item: MotorAPI) => {
      if (!map.has(item.hp)) {
        map.set(item.hp, []);
      }
      if (item.model) {
        const serialsList = Array.isArray(item.serials) ? item.serials : [];
        const isDual =
          item.is_dual_set !== undefined
            ? item.is_dual_set
            : item.id in dualSetMap
            ? dualSetMap[item.id]
            : isModelDualSet(item.id, item.model, serialsList);

        map.get(item.hp)!.push({
          id: item.id,
          name: item.model,
          serials: serialsList,
          isDualSet: isDual,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        });
      }
    });

    return Array.from(map.entries()).map(([hp, models]) => ({
      id: `hp-${hp}`,
      hp,
      models,
    }));
  }, [apiMotors, dualSetMap]);

  // Flat list of all models for target selection in camera scanner
  const availableModelsForScanner: TargetModelOption[] = useMemo(() => {
    const list: TargetModelOption[] = [];
    groupedData.forEach((hp) => {
      hp.models.forEach((m) => {
        list.push({
          hp: hp.hp,
          modelId: m.id,
          modelName: m.name,
        });
      });
    });
    return list;
  }, [groupedData]);

  // --------------------------------------------------------------------------
  // Camera Scanner Handlers (Direct Live Backend Integration)
  // --------------------------------------------------------------------------
  const handleOpenScanner = (modelId?: string) => {
    setScannerTargetModelId(modelId);
    setIsScannerOpen(true);
  };

  const handleScannerAddSerials = (
    targetModelId: string,
    serials: string[]
  ) => {
    if (serials.length === 0) return;

    // Find the model
    let targetModel: MotorModelView | undefined = undefined;
    for (const hp of groupedData) {
      const found = hp.models.find((m) => m.id === targetModelId);
      if (found) {
        targetModel = found;
        break;
      }
    }

    if (!targetModel) return;

    const incoming = serials.map((s) => {
      const parsed = parseSerialEntry(s);
      return { serial: parsed.baseSerial, itemType: parsed.itemType };
    });

    const { updatedSerials, newlyCompletedCount, addedCount } =
      reconcileSerials(targetModel.serials, incoming, targetModel.isDualSet);

    updateMotorMutation.mutate(
      { id: targetModelId, data: { serials: updatedSerials } },
      {
        onSuccess: () => {
          if (newlyCompletedCount > 0) {
            toast.success(
              `Completed ${newlyCompletedCount} Pump + Motor set(s)!`
            );
          } else {
            toast.success(
              `Added ${addedCount} serials to ${targetModel?.name}`
            );
          }
        },
        onError: (err) => {
          toast.error("Failed to add serials: " + err.message);
        },
      }
    );
  };

  /**
   * Enhancement 1: When batch scan finishes:
   * - If all models exist, reconcile and save immediately.
   * - If new models were detected during scan, DO NOT block user while scanning!
   *   Instead, present a dialog asking what HP each new model maps to before saving.
   */
  const handleScannerAddParsedBatch = (
    items: ParsedBarcodeResult[],
    fallbackModelId: string
  ) => {
    if (items.length === 0) return;

    const fallbackOption = availableModelsForScanner.find(
      (m) => m.modelId === fallbackModelId
    );
    const defaultFallbackHp =
      fallbackOption?.hp ||
      (groupedData.length > 0 ? groupedData[0].hp : "1.0 HP");
    const fallbackModelName =
      fallbackOption?.modelName || "Standard Model";

    // Group scanned items by detected model name
    const groups = new Map<
      string,
      { modelName: string; items: ParsedBarcodeResult[] }
    >();

    items.forEach((item) => {
      const modelKey = item.model
        ? item.model.replace(/\s*\+\s*/g, "+").trim()
        : fallbackModelName;

      if (!groups.has(modelKey)) {
        groups.set(modelKey, { modelName: modelKey, items: [] });
      }
      groups.get(modelKey)!.items.push(item);
    });

    const existingAssignments: Array<{
      existingModel: MotorModelView;
      items: ParsedBarcodeResult[];
    }> = [];

    const newModelsToAssign: PendingNewModelAssignment[] = [];

    groups.forEach(({ modelName, items: groupItems }) => {
      const existingOption = availableModelsForScanner.find(
        (m) =>
          m.modelName.replace(/\s*\+\s*/g, "+").toLowerCase() ===
          modelName.toLowerCase()
      );

      if (existingOption) {
        const hpCat = groupedData.find((h) => h.hp === existingOption.hp);
        const m = hpCat?.models.find((mod) => mod.id === existingOption.modelId);
        if (m) {
          existingAssignments.push({ existingModel: m, items: groupItems });
        }
      } else {
        // New model detected during scanning!
        const hasPmTags = groupItems.some((i) => Boolean(i.itemType));
        newModelsToAssign.push({
          modelName,
          items: groupItems,
          selectedHp: defaultFallbackHp,
          isCustomHp: false,
          customHp: "",
          isDualSet: hasPmTags,
        });
      }
    });

    // 1. Reconcile and save all existing models immediately
    existingAssignments.forEach(({ existingModel, items: groupItems }) => {
      const isDual = existingModel.isDualSet;
      const incoming = groupItems.map((i) => ({
        serial: i.serial,
        itemType: i.itemType,
      }));

      const { updatedSerials, newlyCompletedCount, addedCount } =
        reconcileSerials(existingModel.serials, incoming, isDual);

      updateMotorMutation.mutate(
        { id: existingModel.id, data: { serials: updatedSerials } },
        {
          onSuccess: () => {
            if (newlyCompletedCount > 0) {
              toast.success(
                `Completed ${newlyCompletedCount} Pump + Motor set(s) for ${existingModel.name}!`
              );
            } else {
              toast.success(
                `Added ${addedCount} serials to ${existingModel.name}`
              );
            }
          },
          onError: (err) => {
            toast.error(
              `Failed to update ${existingModel.name}: ${err.message}`
            );
          },
        }
      );
    });

    // 2. If new models exist, open the HP mapping modal now (after scanning is done)
    if (newModelsToAssign.length > 0) {
      setPendingNewModels(newModelsToAssign);
      setIsAssignHpModalOpen(true);
    }
  };

  /**
   * Enhancement 1: Confirm saving new models after user assigns HP
   */
  const handleSavePendingNewModels = () => {
    let hasError = false;

    pendingNewModels.forEach((assignment) => {
      const finalHp = assignment.isCustomHp
        ? assignment.customHp.trim()
        : assignment.selectedHp.trim();

      if (!finalHp) {
        toast.error(`Please select an HP rating for "${assignment.modelName}"`);
        hasError = true;
        return;
      }

      // Persist dual set preference
      saveModelDualSet(assignment.modelName, assignment.isDualSet);
      setDualSetMap((prev) => ({
        ...prev,
        [assignment.modelName]: assignment.isDualSet,
      }));

      // Reconcile serials
      const incoming = assignment.items.map((i) => ({
        serial: i.serial,
        itemType: i.itemType,
      }));

      const { updatedSerials, newlyCompletedCount } = reconcileSerials(
        [],
        incoming,
        assignment.isDualSet
      );

      createMotorMutation.mutate(
        {
          hp: finalHp,
          model: assignment.modelName,
          serials: updatedSerials,
          is_dual_set: assignment.isDualSet,
        },
        {
          onSuccess: () => {
            toast.success(
              `Created model "${assignment.modelName}" under ${finalHp} with ${updatedSerials.length} serials${
                newlyCompletedCount > 0
                  ? ` (${newlyCompletedCount} complete sets)`
                  : ""
              }`
            );
          },
          onError: (err) => {
            toast.error(
              `Failed to create model "${assignment.modelName}": ${err.message}`
            );
          },
        }
      );
    });

    if (!hasError) {
      setIsAssignHpModalOpen(false);
      setPendingNewModels([]);
    }
  };

  // --------------------------------------------------------------------------
  // Computed Filtered & Searched Data
  // --------------------------------------------------------------------------
  const filteredData = useMemo(() => {
    let list = groupedData;

    if (selectedHpFilter !== "ALL") {
      list = list.filter((hp) => hp.hp === selectedHpFilter);
    }

    if (!searchQuery.trim()) {
      return list;
    }

    const q = searchQuery.toLowerCase().trim();

    return list
      .map((hp) => {
        const hpMatches = hp.hp.toLowerCase().includes(q);

        const matchingModels = hp.models.filter((model) => {
          const modelMatches = model.name.toLowerCase().includes(q);
          const serialMatches = model.serials.some((s) =>
            s.toLowerCase().includes(q)
          );
          return modelMatches || serialMatches || hpMatches;
        });

        if (matchingModels.length > 0) {
          return {
            ...hp,
            models: matchingModels,
          };
        }
        return null;
      })
      .filter((item): item is HpCategoryView => item !== null);
  }, [groupedData, selectedHpFilter, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalHp = groupedData.length;
    let totalModels = 0;
    let totalSerials = 0;
    let completeSets = 0;
    let partialSets = 0;

    groupedData.forEach((hp) => {
      totalModels += hp.models.length;
      hp.models.forEach((m) => {
        totalSerials += m.serials.length;
        if (m.isDualSet) {
          m.serials.forEach((s) => {
            const status = getSerialStatus(s, true);
            if (status.status === "COMPLETE_SET") completeSets++;
            else partialSets++;
          });
        }
      });
    });

    return { totalHp, totalModels, totalSerials, completeSets, partialSets };
  }, [groupedData]);

  // --------------------------------------------------------------------------
  // Handlers: Inline Serials
  // --------------------------------------------------------------------------
  const handleSerialInputChange = (modelId: string, val: string) => {
    setSerialInputs((prev) => ({ ...prev, [modelId]: val }));
  };

  const handleAddSerial = (
    e: React.FormEvent,
    hpCategory: string,
    model: MotorModelView
  ) => {
    e.preventDefault();
    const rawVal = serialInputs[model.id] || "";
    if (!rawVal.trim()) return;

    const tokens = rawVal
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (tokens.length === 0) return;

    const incoming = tokens.map((token) => {
      const parsed = parseSerialEntry(token);
      return { serial: parsed.baseSerial, itemType: parsed.itemType };
    });

    const { updatedSerials, newlyCompletedCount, addedCount } =
      reconcileSerials(model.serials, incoming, model.isDualSet);

    updateMotorMutation.mutate(
      { id: model.id, data: { serials: updatedSerials } },
      {
        onSuccess: () => {
          if (newlyCompletedCount > 0) {
            toast.success(
              `Completed ${newlyCompletedCount} Pump + Motor set(s)!`
            );
          } else {
            toast.success(
              tokens.length === 1
                ? `Added serial: ${tokens[0]}`
                : `Added ${addedCount} serials to model`
            );
          }
          setSerialInputs((prev) => ({ ...prev, [model.id]: "" }));
        },
        onError: (err) => {
          toast.error("Failed to add serials: " + err.message);
        },
      }
    );
  };

  const handleRemoveSerial = (
    hpCategory: string,
    modelId: string,
    currentSerials: string[],
    serialToRemove: string
  ) => {
    const updated = currentSerials.filter((s) => s !== serialToRemove);
    updateMotorMutation.mutate(
      { id: modelId, data: { serials: updated } },
      {
        onSuccess: () => {
          toast.info(`Removed serial: ${serialToRemove}`);
        },
        onError: (err) => {
          toast.error("Failed to remove serial: " + err.message);
        },
      }
    );
  };

  const handleCopySerials = (model: MotorModelView) => {
    if (model.serials.length === 0) {
      toast.info("No serial numbers to copy");
      return;
    }
    const text = model.serials.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedModelId(model.id);
    toast.success(
      `Copied ${model.serials.length} serial numbers to clipboard`
    );
    setTimeout(() => {
      setCopiedModelId(null);
    }, 2000);
  };

  // --------------------------------------------------------------------------
  // Handlers: HP Category Management
  // --------------------------------------------------------------------------
  const handleOpenAddHp = () => {
    setNewHpName("");
    setIsAddHpOpen(true);
  };

  const handleAddHp = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newHpName.trim();
    if (!name) {
      toast.error("HP rating / category cannot be empty");
      return;
    }

    const exists = groupedData.some(
      (h) => h.hp.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      toast.error(`Category "${name}" already exists`);
      return;
    }

    createMotorMutation.mutate(
      { hp: name, model: null, serials: [] },
      {
        onSuccess: () => {
          toast.success(`Added HP Category: ${name}`);
          setIsAddHpOpen(false);
          setNewHpName("");
        },
        onError: (err) => {
          toast.error("Failed to create HP category: " + err.message);
        },
      }
    );
  };

  const handleOpenEditHp = (category: HpCategoryView) => {
    setEditHpTarget(category);
    setEditHpName(category.hp);
  };

  const handleEditHp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHpTarget) return;

    const trimmed = editHpName.trim();
    if (!trimmed) {
      toast.error("HP value cannot be empty");
      return;
    }

    if (trimmed.toLowerCase() === editHpTarget.hp.toLowerCase()) {
      setEditHpTarget(null);
      return;
    }

    const exists = groupedData.some(
      (h) =>
        h.hp.toLowerCase() === trimmed.toLowerCase() &&
        h.hp.toLowerCase() !== editHpTarget.hp.toLowerCase()
    );
    if (exists) {
      toast.error(`Category "${trimmed}" already exists`);
      return;
    }

    renameHpMutation.mutate(
      { oldHp: editHpTarget.hp, newHp: trimmed },
      {
        onSuccess: () => {
          toast.success("HP rating updated");
          setEditHpTarget(null);
        },
        onError: (err) => {
          toast.error("Failed to rename HP: " + err.message);
        },
      }
    );
  };

  const handleDeleteHp = () => {
    if (!deleteHpTarget) return;
    const hpToDelete = deleteHpTarget.hp;

    deleteHpMutation.mutate(hpToDelete, {
      onSuccess: () => {
        toast.success(`Deleted ${hpToDelete} category`);
        setDeleteHpTarget(null);
        if (selectedHpFilter === hpToDelete) {
          setSelectedHpFilter("ALL");
        }
      },
      onError: (err) => {
        toast.error("Failed to delete HP: " + err.message);
      },
    });
  };

  // --------------------------------------------------------------------------
  // Handlers: Model Management
  // --------------------------------------------------------------------------
  const handleOpenAddModel = (hp?: string) => {
    const defaultHp = hp || groupedData[0]?.hp || "";
    setTargetHpForModel(defaultHp);
    setNewModelName("");
    setNewModelSerialsInput("");
    setNewModelIsDualSet(true);
    setIsAddModelOpen(true);
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    const modelName = newModelName.trim();

    if (!targetHpForModel) {
      toast.error("Please select an HP Category");
      return;
    }

    if (!modelName) {
      toast.error("Model name cannot be empty");
      return;
    }

    const targetCategory = groupedData.find(
      (h) => h.hp === targetHpForModel
    );
    if (
      targetCategory &&
      targetCategory.models.some(
        (m) => m.name.toLowerCase() === modelName.toLowerCase()
      )
    ) {
      toast.error(
        `Model "${modelName}" already exists under ${targetHpForModel}`
      );
      return;
    }

    // Persist dual set choice
    saveModelDualSet(modelName, newModelIsDualSet);
    setDualSetMap((prev) => ({
      ...prev,
      [modelName]: newModelIsDualSet,
    }));

    const rawTokens = newModelSerialsInput
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const incoming = rawTokens.map((t) => {
      const parsed = parseSerialEntry(t);
      return { serial: parsed.baseSerial, itemType: parsed.itemType };
    });

    const { updatedSerials } = reconcileSerials(
      [],
      incoming,
      newModelIsDualSet
    );

    createMotorMutation.mutate(
      {
        hp: targetHpForModel,
        model: modelName,
        serials: updatedSerials,
        is_dual_set: newModelIsDualSet,
      },
      {
        onSuccess: (created) => {
          saveModelDualSet(created.id, newModelIsDualSet);
          setDualSetMap((prev) => ({
            ...prev,
            [created.id]: newModelIsDualSet,
          }));
          toast.success(`Added model: ${modelName}`);
          setIsAddModelOpen(false);
          setNewModelName("");
          setNewModelSerialsInput("");
        },
        onError: (err) => {
          toast.error("Failed to add model: " + err.message);
        },
      }
    );
  };

  const handleOpenEditModel = (hp: string, model: MotorModelView) => {
    setEditModelTarget({ hp, model });
    setEditModelName(model.name);
    setEditModelHp(hp);
    setEditModelIsDualSet(model.isDualSet);
  };

  const handleEditModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModelTarget) return;

    const trimmedName = editModelName.trim();
    if (!trimmedName) {
      toast.error("Model name cannot be empty");
      return;
    }

    saveModelDualSet(editModelTarget.model.id, editModelIsDualSet);
    saveModelDualSet(trimmedName, editModelIsDualSet);
    setDualSetMap((prev) => ({
      ...prev,
      [editModelTarget.model.id]: editModelIsDualSet,
      [trimmedName]: editModelIsDualSet,
    }));

    updateMotorMutation.mutate(
      {
        id: editModelTarget.model.id,
        data: {
          model: trimmedName,
          hp: editModelHp,
          is_dual_set: editModelIsDualSet,
        },
      },
      {
        onSuccess: () => {
          toast.success("Model updated");
          setEditModelTarget(null);
        },
        onError: (err) => {
          toast.error("Failed to update model: " + err.message);
        },
      }
    );
  };

  const handleDeleteModel = () => {
    if (!deleteModelTarget) return;
    const { model } = deleteModelTarget;

    deleteMotorMutation.mutate(model.id, {
      onSuccess: () => {
        toast.success(`Deleted model: ${model.name}`);
        setDeleteModelTarget(null);
      },
      onError: (err) => {
        toast.error("Failed to delete model: " + err.message);
      },
    });
  };

  // --------------------------------------------------------------------------
  // Data Export
  // --------------------------------------------------------------------------
  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(groupedData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `sske-motor-inventory-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Exported motor inventory JSON");
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* ------------------------------------------------------------------ */}
      {/* Header & Main Actions */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Manage Motors & Serials
                </h1>
                <Badge
                  variant="outline"
                  className="text-[11px] gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                >
                  <Database className="h-3 w-3" /> Live Backend
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Track motor models, serials, and Pump + Motor completeness
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => handleOpenScanner()}
            variant="outline"
            className="gap-1.5 border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-600 font-medium"
            title="Scan barcodes with device camera"
          >
            <Camera className="h-4 w-4 text-amber-500" />
            Scan Barcodes
          </Button>

          <Button
            onClick={handleOpenAddHp}
            variant="outline"
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add HP Range
          </Button>

          <Button
            onClick={() => handleOpenAddModel()}
            disabled={groupedData.length === 0}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Model
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportJson}
            title="Export JSON"
            disabled={groupedData.length === 0}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Visual Status Legend */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-muted-foreground">
            Badge Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              Both Motor &amp; Pump Available (Complete Set)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium text-amber-700 dark:text-amber-400">
              Only (P) or (M) Available (Partial Set)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-muted-foreground">
              Single Unit / Standalone Model
            </span>
          </div>
        </div>

        {stats.completeSets > 0 || stats.partialSets > 0 ? (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[11px] border-emerald-500/40 text-emerald-700 bg-emerald-500/10"
            >
              {stats.completeSets} Complete Sets
            </Badge>
            {stats.partialSets > 0 && (
              <Badge
                variant="outline"
                className="text-[11px] border-amber-500/40 text-amber-700 bg-amber-500/10"
              >
                {stats.partialSets} Partial
              </Badge>
            )}
          </div>
        ) : null}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Backend Error Banner (if any) */}
      {/* ------------------------------------------------------------------ */}
      {isError && (
        <Card className="border-destructive/40 bg-destructive/5 shadow-none">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Error connecting to motor inventory backend
                </p>
                <p className="text-xs text-muted-foreground">
                  {apiError instanceof Error
                    ? apiError.message
                    : "Please ensure billing-backend is running on port 8000 and database migrations are applied."}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="gap-1.5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Quick Stats Bar */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="py-3 shadow-none border-border/80 bg-card/60">
          <CardContent className="flex items-center gap-3.5 px-4 py-1">
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalHp}</div>
              <div className="text-xs text-muted-foreground font-medium">
                HP Categories / Ratings
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-3 shadow-none border-border/80 bg-card/60">
          <CardContent className="flex items-center gap-3.5 px-4 py-1">
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalModels}</div>
              <div className="text-xs text-muted-foreground font-medium">
                Total Motor Models
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-3 shadow-none border-border/80 bg-card/60">
          <CardContent className="flex items-center gap-3.5 px-4 py-1">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalSerials}</div>
              <div className="text-xs text-muted-foreground font-medium">
                Total Serial Numbers / In Stock
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search & HP Filter Bar */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by serial #, model name, or HP..."
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* HP Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <Button
            size="sm"
            variant={selectedHpFilter === "ALL" ? "default" : "outline"}
            className="h-8 text-xs shrink-0 rounded-full"
            onClick={() => setSelectedHpFilter("ALL")}
          >
            All HP ({groupedData.length})
          </Button>

          {groupedData.map((hp) => {
            const count = hp.models.reduce(
              (acc, m) => acc + m.serials.length,
              0
            );
            return (
              <Button
                key={hp.hp}
                size="sm"
                variant={selectedHpFilter === hp.hp ? "default" : "outline"}
                className="h-8 text-xs shrink-0 rounded-full"
                onClick={() => setSelectedHpFilter(hp.hp)}
              >
                {hp.hp}{" "}
                <span className="ml-1 opacity-70 text-[10px]">({count})</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Loading Spinner */}
      {/* ------------------------------------------------------------------ */}
      {isLoading && (
        <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Fetching motor inventory from backend...</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty State: No data in live database */}
      {/* ------------------------------------------------------------------ */}
      {!isLoading && groupedData.length === 0 && (
        <Card className="py-16 border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Boxes className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No motors in database</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your live motor inventory is currently empty. Add your first HP
                category, register a model, or scan barcodes to begin.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleOpenAddHp}>
                <Plus className="h-4 w-4 mr-1.5" /> Add HP Range
              </Button>
              <Button
                onClick={() => handleOpenScanner()}
                variant="outline"
                className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
              >
                <Camera className="h-4 w-4 mr-1.5 text-amber-500" /> Scan Barcodes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty State: Search yielded no matches */}
      {/* ------------------------------------------------------------------ */}
      {!isLoading && groupedData.length > 0 && filteredData.length === 0 && (
        <Card className="py-12 border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base">No motors found</h3>
              <p className="text-sm text-muted-foreground">
                No models or serials match &quot;{searchQuery}&quot;
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedHpFilter("ALL");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* HP Sections List */}
      {/* ------------------------------------------------------------------ */}
      {!isLoading && (
        <div className="space-y-6">
          {filteredData.map((hp) => {
            const totalHpSerials = hp.models.reduce(
              (acc, m) => acc + m.serials.length,
              0
            );

            return (
              <Card
                key={hp.hp}
                className="border shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* HP Category Header */}
                <CardHeader className="bg-muted/30 border-b py-3 px-5 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold text-lg">⚡</span>
                      <CardTitle className="text-lg font-bold tracking-tight">
                        {hp.hp}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {hp.models.length}{" "}
                        {hp.models.length === 1 ? "Model" : "Models"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs font-medium border-amber-500/30 text-amber-600 bg-amber-500/10"
                      >
                        {totalHpSerials}{" "}
                        {totalHpSerials === 1 ? "Serial" : "Serials"}
                      </Badge>
                    </div>
                  </div>

                  {/* HP Category Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenAddModel(hp.hp)}
                      title={`Add model under ${hp.hp}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Add Model</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEditHp(hp)}
                      title="Edit HP Rating"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteHpTarget(hp)}
                      title="Delete HP Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Models List */}
                <CardContent className="p-0 divide-y">
                  {hp.models.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                      <p>No motor models added under {hp.hp} yet.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAddModel(hp.hp)}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Model
                      </Button>
                    </div>
                  ) : (
                    hp.models.map((model) => {
                      const currentSerialInput = serialInputs[model.id] || "";
                      const isCopied = copiedModelId === model.id;

                      // Count complete vs partial for this specific model
                      let modelCompleteCount = 0;
                      let modelPartialCount = 0;
                      if (model.isDualSet) {
                        model.serials.forEach((s) => {
                          const status = getSerialStatus(s, true);
                          if (status.status === "COMPLETE_SET") {
                            modelCompleteCount++;
                          } else {
                            modelPartialCount++;
                          }
                        });
                      }

                      return (
                        <div
                          key={model.id}
                          className="p-5 hover:bg-muted/10 transition-colors space-y-3.5"
                        >
                          {/* Model Title Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <div className="font-semibold text-base text-foreground tracking-tight flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                {model.name}
                              </div>

                              <Badge
                                variant="secondary"
                                className="font-mono text-xs font-normal"
                              >
                                {model.serials.length}{" "}
                                {model.serials.length === 1 ? "unit" : "units"}
                              </Badge>

                              {/* Dual Set Toggle Button */}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className={`h-6 text-[11px] px-2.5 py-0 rounded-full gap-1 transition-all ${
                                  model.isDualSet
                                    ? "border-emerald-500/40 text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20"
                                    : "border-muted-foreground/30 text-muted-foreground hover:bg-muted"
                                }`}
                                onClick={() =>
                                  handleToggleDualSet(
                                    model.id,
                                    model.name,
                                    !model.isDualSet
                                  )
                                }
                                title={
                                  model.isDualSet
                                    ? "Pump + Motor pair tracking is enabled. Click to switch to Single Unit."
                                    : "Single Unit model (no P/M pair tracking). Click to enable Pump + Motor tracking."
                                }
                              >
                                {model.isDualSet ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Dual Set (P+M)</span>
                                  </>
                                ) : (
                                  <span>Single Unit</span>
                                )}
                              </Button>

                              {/* Completeness preview badge if dual set */}
                              {model.isDualSet && model.serials.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px]">
                                  {modelCompleteCount > 0 && (
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                      ✓ {modelCompleteCount} complete
                                    </span>
                                  )}
                                  {modelPartialCount > 0 && (
                                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                                      • {modelPartialCount} partial
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Model Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                onClick={() => handleCopySerials(model)}
                                title="Copy all serials to clipboard"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    <span className="text-emerald-600 text-[11px]">
                                      Copied
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span className="text-[11px] hidden sm:inline">
                                      Copy Serials
                                    </span>
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEditModel(hp.hp, model)}
                                title="Edit Model"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  setDeleteModelTarget({ hp: hp.hp, model })
                                }
                                title="Delete Model"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Serials Badges Flow */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                              <span>Serial Numbers:</span>
                              {model.serials.length > 0 && (
                                <span className="text-[11px] font-mono text-muted-foreground/80">
                                  Click &times; on any badge to delete
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 min-h-[36px] p-2.5 rounded-lg bg-muted/25 border border-dashed">
                              {model.serials.length === 0 ? (
                                <span className="text-xs text-muted-foreground/70 italic">
                                  No serials recorded yet. Type below or scan barcodes to add.
                                </span>
                              ) : (
                                model.serials.map((serial) => {
                                  const statusInfo = getSerialStatus(
                                    serial,
                                    model.isDualSet
                                  );

                                  // Check if matches active search query
                                  const isMatched =
                                    searchQuery.trim() &&
                                    serial
                                      .toLowerCase()
                                      .includes(
                                        searchQuery.toLowerCase().trim()
                                      );

                                  // 1. Both Available: GREEN
                                  if (statusInfo.status === "COMPLETE_SET") {
                                    return (
                                      <div
                                        key={serial}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 transition-all ${
                                          isMatched
                                            ? "ring-2 ring-emerald-500 ring-offset-1"
                                            : ""
                                        }`}
                                        title={statusInfo.badgeTooltip}
                                      >
                                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <span>{statusInfo.baseSerial}</span>
                                        <span className="text-[10px] font-sans font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-1 py-0.2 rounded">
                                          P+M Set
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveSerial(
                                              hp.hp,
                                              model.id,
                                              model.serials,
                                              serial
                                            )
                                          }
                                          className="rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 -mr-0.5 transition-colors focus:outline-hidden"
                                          title={`Delete serial ${serial}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    );
                                  }

                                  // 2. Only One Available: AMBER / ORANGE
                                  if (
                                    statusInfo.status === "PUMP_ONLY" ||
                                    statusInfo.status === "MOTOR_ONLY"
                                  ) {
                                    const isPump =
                                      statusInfo.status === "PUMP_ONLY";
                                    return (
                                      <div
                                        key={serial}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 transition-all ${
                                          isMatched
                                            ? "ring-2 ring-amber-500 ring-offset-1"
                                            : ""
                                        }`}
                                        title={statusInfo.badgeTooltip}
                                      >
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                        <span>{statusInfo.baseSerial}</span>
                                        <span className="text-[10px] font-sans font-semibold text-amber-900 dark:text-amber-100 bg-amber-500/30 px-1 py-0.2 rounded">
                                          {isPump ? "Pump (P)" : "Motor (M)"}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveSerial(
                                              hp.hp,
                                              model.id,
                                              model.serials,
                                              serial
                                            )
                                          }
                                          className="rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 -mr-0.5 transition-colors focus:outline-hidden"
                                          title={`Delete serial ${serial}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    );
                                  }

                                  // 3. Single Unit / Standalone Model: NEUTRAL badge (does not raise color)
                                  return (
                                    <div
                                      key={serial}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-background border border-border/80 text-foreground transition-all ${
                                        isMatched
                                          ? "ring-2 ring-primary ring-offset-1"
                                          : ""
                                      }`}
                                      title={statusInfo.badgeTooltip}
                                    >
                                      <span>{statusInfo.baseSerial}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveSerial(
                                            hp.hp,
                                            model.id,
                                            model.serials,
                                            serial
                                          )
                                        }
                                        className="rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 -mr-0.5 transition-colors focus:outline-hidden"
                                        title={`Delete serial ${serial}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Inline Serial Number Input Form */}
                            <form
                              onSubmit={(e) =>
                                handleAddSerial(e, hp.hp, model)
                              }
                              className="flex items-center gap-2 pt-1 max-w-lg"
                            >
                              <Input
                                value={currentSerialInput}
                                onChange={(e) =>
                                  handleSerialInputChange(model.id, e.target.value)
                                }
                                placeholder={
                                  model.isDualSet
                                    ? "Add serial (e.g. 25330976, 25330976 P, or 25330976 M)..."
                                    : "Add serial (e.g. 25330976, 33108408)..."
                                }
                                className="h-8 text-xs font-mono"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="secondary"
                                className="h-8 px-3 text-xs gap-1 shrink-0"
                                disabled={!currentSerialInput.trim()}
                              >
                                <Plus className="h-3.5 w-3.5" /> Add Serial
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 text-xs gap-1 shrink-0 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600"
                                onClick={() => handleOpenScanner(model.id)}
                                title="Scan serials with device camera"
                              >
                                <Camera className="h-3.5 w-3.5 text-amber-500" />
                                <span className="hidden sm:inline">Scan</span>
                              </Button>
                            </form>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Add HP Category */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={isAddHpOpen} onOpenChange={setIsAddHpOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddHp}>
            <DialogHeader>
              <DialogTitle>Add Horsepower (HP) Range</DialogTitle>
              <DialogDescription>
                Create a new motor power rating category (e.g. 1.5 HP, 2.0 HP,
                5.0 HP).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">HP Rating / Name</label>
                <Input
                  value={newHpName}
                  onChange={(e) => setNewHpName(e.target.value)}
                  placeholder="e.g. 3.0 HP"
                  autoFocus
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground font-medium">
                  Quick suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {HP_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] px-2 py-0"
                      onClick={() => setNewHpName(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddHpOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newHpName.trim()}>
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Edit HP Category */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={Boolean(editHpTarget)}
        onOpenChange={(open) => !open && setEditHpTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditHp}>
            <DialogHeader>
              <DialogTitle>Edit HP Category</DialogTitle>
              <DialogDescription>
                Rename &quot;{editHpTarget?.hp}&quot;. All models under this
                category will be updated.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">HP Rating</label>
                <Input
                  value={editHpName}
                  onChange={(e) => setEditHpName(e.target.value)}
                  placeholder="e.g. 2.0 HP"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditHpTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!editHpName.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Alert Dialog: Confirm Delete HP Category */}
      {/* ------------------------------------------------------------------ */}
      <AlertDialog
        open={Boolean(deleteHpTarget)}
        onOpenChange={(open) => !open && setDeleteHpTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteHpTarget?.hp} category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this HP category, all of its models (
              {deleteHpTarget?.models.length || 0}), and all associated serial
              numbers from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHp}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Add Motor Model */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleAddModel}>
            <DialogHeader>
              <DialogTitle>Add Motor Model</DialogTitle>
              <DialogDescription>
                Register a new motor model and choose if it tracks separate
                Pump + Motor pairs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* HP Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">HP Category</label>
                <Select
                  value={targetHpForModel}
                  onValueChange={setTargetHpForModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HP range..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groupedData.map((hp) => (
                      <SelectItem key={hp.hp} value={hp.hp}>
                        {hp.hp} ({hp.models.length} models)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Model Name</label>
                <Input
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="e.g. AFS007S+B10 or ASMSP1570B"
                  autoFocus
                />
              </div>

              {/* Dual Set Toggle */}
              <div className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    Pump + Motor Pair Tracking
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tracks completeness: Green when both (P) and (M) available,
                    Amber when only one is available.
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={newModelIsDualSet ? "default" : "outline"}
                  className="shrink-0 text-xs h-8"
                  onClick={() => setNewModelIsDualSet(!newModelIsDualSet)}
                >
                  {newModelIsDualSet ? "Dual Set (P+M)" : "Single Unit"}
                </Button>
              </div>

              {/* Optional Initial Serials */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>Initial Serial Numbers</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>
                <Input
                  value={newModelSerialsInput}
                  onChange={(e) => setNewModelSerialsInput(e.target.value)}
                  placeholder="Enter serials (e.g. 25330976 P, 25330976 M)..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModelOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newModelName.trim() || !targetHpForModel}
              >
                Add Model
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Edit Motor Model */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={Boolean(editModelTarget)}
        onOpenChange={(open) => !open && setEditModelTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditModel}>
            <DialogHeader>
              <DialogTitle>Edit Motor Model</DialogTitle>
              <DialogDescription>
                Update the model name, HP category, or unit tracking type.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">HP Category</label>
                <Select value={editModelHp} onValueChange={setEditModelHp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select HP..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groupedData.map((hp) => (
                      <SelectItem key={hp.hp} value={hp.hp}>
                        {hp.hp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Model Name</label>
                <Input
                  value={editModelName}
                  onChange={(e) => setEditModelName(e.target.value)}
                  placeholder="e.g. AFS007S+B10"
                  autoFocus
                />
              </div>

              <div className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    Pump + Motor Pair Tracking
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Enable to track (P) and (M) completeness.
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={editModelIsDualSet ? "default" : "outline"}
                  className="shrink-0 text-xs h-8"
                  onClick={() => setEditModelIsDualSet(!editModelIsDualSet)}
                >
                  {editModelIsDualSet ? "Dual Set (P+M)" : "Single Unit"}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModelTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!editModelName.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Alert Dialog: Confirm Delete Model */}
      {/* ------------------------------------------------------------------ */}
      <AlertDialog
        open={Boolean(deleteModelTarget)}
        onOpenChange={(open) => !open && setDeleteModelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteModelTarget?.model.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this model and all of its{" "}
              {deleteModelTarget?.model.serials.length || 0} serial numbers from
              the database? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Model
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ------------------------------------------------------------------ */}
      {/* Enhancement 1: Modal: Assign HP for Newly Scanned Models */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={isAssignHpModalOpen}
        onOpenChange={setIsAssignHpModalOpen}
      >
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <DialogTitle>Assign Horsepower (HP) for Scanned Models</DialogTitle>
            </div>
            <DialogDescription>
              {pendingNewModels.length === 1
                ? "A new motor model was detected during your scan. Choose which HP category it maps to before saving."
                : `${pendingNewModels.length} new motor models were detected during your scan. Choose which HP category each model maps to before saving.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 flex-1 overflow-y-auto">
            {pendingNewModels.map((assignment, idx) => (
              <div
                key={assignment.modelName}
                className="p-4 rounded-lg border bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-base">
                      {assignment.modelName}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {assignment.items.length}{" "}
                    {assignment.items.length === 1 ? "serial" : "serials"} scanned
                  </Badge>
                </div>

                {/* Scanned Serials preview */}
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 rounded bg-background border border-dashed">
                  {assignment.items.map((item, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted"
                    >
                      {item.serial}
                      {item.itemType ? ` (${item.itemType})` : ""}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* HP Category Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Target Horsepower (HP):
                    </label>

                    {!assignment.isCustomHp ? (
                      <div className="space-y-1.5">
                        <Select
                          value={assignment.selectedHp}
                          onValueChange={(val) => {
                            if (val === "CUSTOM") {
                              setPendingNewModels((prev) =>
                                prev.map((p, pIdx) =>
                                  pIdx === idx
                                    ? { ...p, isCustomHp: true, customHp: "" }
                                    : p
                                )
                              );
                            } else {
                              setPendingNewModels((prev) =>
                                prev.map((p, pIdx) =>
                                  pIdx === idx ? { ...p, selectedHp: val } : p
                                )
                              );
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs font-medium">
                            <SelectValue placeholder="Select HP..." />
                          </SelectTrigger>
                          <SelectContent>
                            {groupedData.map((h) => (
                              <SelectItem key={h.hp} value={h.hp}>
                                {h.hp} ({h.models.length} existing models)
                              </SelectItem>
                            ))}
                            {HP_PRESETS.filter(
                              (p) => !groupedData.some((g) => g.hp === p)
                            ).map((preset) => (
                              <SelectItem key={preset} value={preset}>
                                {preset} (New HP category)
                              </SelectItem>
                            ))}
                            <SelectItem value="CUSTOM" className="text-primary font-semibold">
                              + Type Custom HP Rating...
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Input
                          value={assignment.customHp}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPendingNewModels((prev) =>
                              prev.map((p, pIdx) =>
                                pIdx === idx ? { ...p, customHp: val } : p
                              )
                            );
                          }}
                          placeholder="e.g. 1.5 HP, 12.5 HP..."
                          className="h-8 text-xs font-medium"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-muted-foreground px-2"
                          onClick={() => {
                            setPendingNewModels((prev) =>
                              prev.map((p, pIdx) =>
                                pIdx === idx ? { ...p, isCustomHp: false } : p
                              )
                            );
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Dual Set Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Unit Tracking Type:
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      variant={assignment.isDualSet ? "default" : "outline"}
                      className="w-full h-8 text-xs justify-start font-medium gap-1.5"
                      onClick={() =>
                        setPendingNewModels((prev) =>
                          prev.map((p, pIdx) =>
                            pIdx === idx
                              ? { ...p, isDualSet: !p.isDualSet }
                              : p
                          )
                        )
                      }
                    >
                      {assignment.isDualSet ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Dual Set (Pump + Motor)</span>
                        </>
                      ) : (
                        <span>Single Unit (No P/M pairing)</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="border-t pt-3 flex flex-row items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAssignHpModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSavePendingNewModels}
              className="gap-1.5"
            >
              <Check className="h-4 w-4" /> Save &amp; Add to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Camera Barcode Scanner Modal */}
      {/* ------------------------------------------------------------------ */}
      <CameraBarcodeScanner
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        availableModels={availableModelsForScanner}
        initialModelId={scannerTargetModelId}
        onAddSerials={handleScannerAddSerials}
        onAddParsedBatch={handleScannerAddParsedBatch}
      />
    </div>
  );
}
