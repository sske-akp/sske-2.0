"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { MotorAPI, HpCategoryView, MotorModelView } from "@/types/motors";
import {
  useMotors,
  useCreateMotor,
  useUpdateMotor,
  useDeleteMotor,
  useAddSerialsToMotor,
  useRemoveSerialFromMotor,
  useRenameHpCategory,
  useDeleteHpCategory,
} from "@/hooks/motorsHooks";
import {
  loadMotorData,
  saveMotorData,
  DEFAULT_MOTOR_DATA,
} from "@/app/manage_motors/storage";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Plus,
  X,
  Search,
  Trash2,
  Pencil,
  Copy,
  Check,
  RotateCcw,
  Download,
  Upload,
  MoreVertical,
  Boxes,
  Layers,
  Cpu,
  Package,
  Database,
  CloudOff,
} from "lucide-react";

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
  "12.5 HP",
  "15.0 HP",
];

export default function ManageMotorsPage() {
  // Backend React Query hooks
  const {
    data: apiMotors,
    isLoading: isApiLoading,
    isError: isApiError,
  } = useMotors();

  const createMotorMutation = useCreateMotor();
  const updateMotorMutation = useUpdateMotor();
  const deleteMotorMutation = useDeleteMotor();
  const addSerialsMutation = useAddSerialsToMotor();
  const removeSerialMutation = useRemoveSerialFromMotor();
  const renameHpMutation = useRenameHpCategory();
  const deleteHpMutation = useDeleteHpCategory();

  // Local storage fallback state (used if backend is offline or before DB connection)
  const [localData, setLocalData] = useState<HpCategoryView[]>([]);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHpFilter, setSelectedHpFilter] = useState<string>("ALL");

  // Inline serial input state: mapping of modelId -> string
  const [serialInputs, setSerialInputs] = useState<Record<string, string>>({});

  // Dialog states
  const [isAddHpOpen, setIsAddHpOpen] = useState(false);
  const [newHpName, setNewHpName] = useState("");

  const [editHpTarget, setEditHpTarget] = useState<HpCategoryView | null>(null);
  const [editHpName, setEditHpName] = useState("");

  const [deleteHpTarget, setDeleteHpTarget] = useState<HpCategoryView | null>(
    null
  );

  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [targetHpForModel, setTargetHpForModel] = useState<string>("");
  const [newModelName, setNewModelName] = useState("");
  const [newModelSerials, setNewModelSerials] = useState("");

  const [editModelTarget, setEditModelTarget] = useState<{
    hp: string;
    model: MotorModelView;
  } | null>(null);
  const [editModelName, setEditModelName] = useState("");

  const [deleteModelTarget, setDeleteModelTarget] = useState<{
    hp: string;
    model: MotorModelView;
  } | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Copied serials state for quick visual feedback
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load local data once
  useEffect(() => {
    const loaded = loadMotorData();
    setLocalData(loaded);
    setIsLocalLoaded(true);
  }, []);

  // Determine if using backend data or local fallback
  const isUsingBackend = !isApiError && Array.isArray(apiMotors);

  // --------------------------------------------------------------------------
  // Group Backend Data into HP Categories View
  // --------------------------------------------------------------------------
  const groupedData: HpCategoryView[] = useMemo(() => {
    if (isUsingBackend && apiMotors) {
      const map = new Map<string, MotorModelView[]>();

      apiMotors.forEach((item: MotorAPI) => {
        if (!map.has(item.hp)) {
          map.set(item.hp, []);
        }
        // If the row has a model name, add it as a model
        if (item.model && item.model.trim()) {
          map.get(item.hp)!.push({
            id: item.id,
            name: item.model,
            serials: Array.isArray(item.serials) ? item.serials : [],
            createdAt: item.created_at || undefined,
          });
        }
      });

      return Array.from(map.entries()).map(([hp, models]) => ({
        id: hp,
        hp,
        models,
      }));
    }

    return localData;
  }, [isUsingBackend, apiMotors, localData]);

  // Helper to sync local state if running locally
  const updateLocalData = (newData: HpCategoryView[]) => {
    setLocalData(newData);
    saveMotorData(newData);
  };

  // --------------------------------------------------------------------------
  // Summary Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(() => {
    const totalHp = groupedData.length;
    let totalModels = 0;
    let totalSerials = 0;

    groupedData.forEach((hp) => {
      totalModels += hp.models.length;
      hp.models.forEach((m) => {
        totalSerials += m.serials.length;
      });
    });

    return { totalHp, totalModels, totalSerials };
  }, [groupedData]);

  // --------------------------------------------------------------------------
  // Filtered & Searched Data
  // --------------------------------------------------------------------------
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return groupedData
      .filter((hp) => {
        if (selectedHpFilter !== "ALL" && hp.hp !== selectedHpFilter) {
          return false;
        }
        return true;
      })
      .map((hp) => {
        if (!query) return hp;

        const hpMatches = hp.hp.toLowerCase().includes(query);

        // Filter models that match query OR have serials that match
        const matchingModels = hp.models.filter((model) => {
          if (hpMatches) return true;
          const nameMatches = model.name.toLowerCase().includes(query);
          const serialMatches = model.serials.some((s) =>
            s.toLowerCase().includes(query)
          );
          return nameMatches || serialMatches;
        });

        return {
          ...hp,
          models: matchingModels,
        };
      })
      .filter((hp) => {
        if (!query) return true;
        const hpMatches = hp.hp.toLowerCase().includes(query);
        return hpMatches || hp.models.length > 0;
      });
  }, [groupedData, searchQuery, selectedHpFilter]);

  // --------------------------------------------------------------------------
  // Serial Operations
  // --------------------------------------------------------------------------
  const handleAddSerial = (hpCategory: string, modelId: string) => {
    const rawInput = serialInputs[modelId] || "";
    if (!rawInput.trim()) return;

    // Support comma, space, newline separated serials
    const tokens = rawInput
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (tokens.length === 0) return;

    if (isUsingBackend) {
      addSerialsMutation.mutate(
        { id: modelId, serials: tokens },
        {
          onSuccess: () => {
            toast.success(
              tokens.length === 1
                ? `Added serial: ${tokens[0]}`
                : `Added ${tokens.length} serial numbers`
            );
            setSerialInputs((prev) => ({ ...prev, [modelId]: "" }));
          },
          onError: (err) => {
            toast.error("Failed to add serials: " + err.message);
          },
        }
      );
      return;
    }

    // Local fallback
    let addedCount = 0;
    const duplicates: string[] = [];

    const updated = localData.map((hp) => {
      if (hp.hp !== hpCategory) return hp;
      return {
        ...hp,
        models: hp.models.map((model) => {
          if (model.id !== modelId) return model;

          const existingSet = new Set(
            model.serials.map((s) => s.toLowerCase())
          );
          const newSerialsToAdd: string[] = [];

          tokens.forEach((token) => {
            if (existingSet.has(token.toLowerCase())) {
              duplicates.push(token);
            } else {
              existingSet.add(token.toLowerCase());
              newSerialsToAdd.push(token);
            }
          });

          addedCount = newSerialsToAdd.length;
          return {
            ...model,
            serials: [...model.serials, ...newSerialsToAdd],
          };
        }),
      };
    });

    if (addedCount > 0) {
      updateLocalData(updated);
      toast.success(
        addedCount === 1
          ? `Added serial: ${tokens[0]}`
          : `Added ${addedCount} serial numbers`
      );
    }

    if (duplicates.length > 0) {
      toast.warning(
        `Already exists in model: ${duplicates.slice(0, 3).join(", ")}`
      );
    }

    setSerialInputs((prev) => ({ ...prev, [modelId]: "" }));
  };

  const handleRemoveSerial = (
    hpCategory: string,
    modelId: string,
    serialToRemove: string
  ) => {
    if (isUsingBackend) {
      removeSerialMutation.mutate(
        { id: modelId, serial: serialToRemove },
        {
          onSuccess: () => {
            toast.info(`Removed serial: ${serialToRemove}`);
          },
          onError: (err) => {
            toast.error("Failed to remove serial: " + err.message);
          },
        }
      );
      return;
    }

    // Local fallback
    const updated = localData.map((hp) => {
      if (hp.hp !== hpCategory) return hp;
      return {
        ...hp,
        models: hp.models.map((model) => {
          if (model.id !== modelId) return model;
          return {
            ...model,
            serials: model.serials.filter((s) => s !== serialToRemove),
          };
        }),
      };
    });

    updateLocalData(updated);
    toast.info(`Removed serial: ${serialToRemove}`);
  };

  const handleCopySerials = (model: MotorModelView) => {
    if (model.serials.length === 0) {
      toast.info("No serials to copy");
      return;
    }
    const text = model.serials.join(", ");
    navigator.clipboard.writeText(text);
    setCopiedModelId(model.id);
    toast.success(`Copied ${model.serials.length} serials to clipboard`);
    setTimeout(() => {
      setCopiedModelId(null);
    }, 2000);
  };

  // --------------------------------------------------------------------------
  // HP Range Operations
  // --------------------------------------------------------------------------
  const handleOpenAddHp = () => {
    setNewHpName("");
    setIsAddHpOpen(true);
  };

  const handleConfirmAddHp = (hpNameToAdd?: string) => {
    const name = (hpNameToAdd || newHpName).trim();
    if (!name) {
      toast.error("Please enter a valid HP rating");
      return;
    }

    const exists = groupedData.some(
      (item) => item.hp.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      toast.error(`"${name}" already exists`);
      return;
    }

    if (isUsingBackend) {
      createMotorMutation.mutate(
        { hp: name, model: null, serials: [] },
        {
          onSuccess: () => {
            toast.success(`Added HP Category: ${name}`);
            setIsAddHpOpen(false);
            setNewHpName("");
          },
          onError: (err) => {
            toast.error("Failed to add HP category: " + err.message);
          },
        }
      );
      return;
    }

    // Local fallback
    const newCategory: HpCategoryView = {
      id: `hp-${Date.now()}`,
      hp: name,
      models: [],
    };

    updateLocalData([...localData, newCategory]);
    setIsAddHpOpen(false);
    setNewHpName("");
    toast.success(`Added HP Category: ${name}`);
  };

  const handleOpenEditHp = (hp: HpCategoryView) => {
    setEditHpTarget(hp);
    setEditHpName(hp.hp);
  };

  const handleSaveEditHp = () => {
    if (!editHpTarget) return;
    const trimmed = editHpName.trim();
    if (!trimmed) {
      toast.error("HP rating cannot be empty");
      return;
    }

    const exists = groupedData.some(
      (item) =>
        item.hp !== editHpTarget.hp &&
        item.hp.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      toast.error(`"${trimmed}" already exists`);
      return;
    }

    if (isUsingBackend) {
      renameHpMutation.mutate(
        { oldHp: editHpTarget.hp, newHp: trimmed },
        {
          onSuccess: () => {
            toast.success(`Renamed HP category to ${trimmed}`);
            setEditHpTarget(null);
          },
          onError: (err) => {
            toast.error("Failed to rename HP: " + err.message);
          },
        }
      );
      return;
    }

    // Local fallback
    const updated = localData.map((item) =>
      item.hp === editHpTarget.hp ? { ...item, hp: trimmed } : item
    );

    updateLocalData(updated);
    setEditHpTarget(null);
    toast.success("HP rating updated");
  };

  const handleDeleteHp = () => {
    if (!deleteHpTarget) return;
    const hpToDelete = deleteHpTarget.hp;

    if (isUsingBackend) {
      deleteHpMutation.mutate(hpToDelete, {
        onSuccess: () => {
          toast.success(`Deleted ${hpToDelete} category`);
          if (selectedHpFilter === hpToDelete) {
            setSelectedHpFilter("ALL");
          }
          setDeleteHpTarget(null);
        },
        onError: (err) => {
          toast.error("Failed to delete HP: " + err.message);
        },
      });
      return;
    }

    // Local fallback
    const updated = localData.filter((item) => item.hp !== hpToDelete);
    updateLocalData(updated);
    if (selectedHpFilter === hpToDelete) {
      setSelectedHpFilter("ALL");
    }
    toast.success(`Deleted ${hpToDelete}`);
    setDeleteHpTarget(null);
  };

  // --------------------------------------------------------------------------
  // Model Operations
  // --------------------------------------------------------------------------
  const handleOpenAddModel = (hpName?: string) => {
    setTargetHpForModel(
      hpName || (groupedData.length > 0 ? groupedData[0].hp : "")
    );
    setNewModelName("");
    setNewModelSerials("");
    setIsAddModelOpen(true);
  };

  const handleConfirmAddModel = () => {
    const modelName = newModelName.trim();
    if (!modelName) {
      toast.error("Model name is required");
      return;
    }
    if (!targetHpForModel) {
      toast.error("Please select an HP rating");
      return;
    }

    // Parse initial serials if provided
    const initialSerials = newModelSerials
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const uniqueSerials = Array.from(new Set(initialSerials));

    if (isUsingBackend) {
      createMotorMutation.mutate(
        {
          hp: targetHpForModel,
          model: modelName,
          serials: uniqueSerials,
        },
        {
          onSuccess: () => {
            toast.success(`Added model: ${modelName}`);
            setIsAddModelOpen(false);
          },
          onError: (err) => {
            toast.error("Failed to add model: " + err.message);
          },
        }
      );
      return;
    }

    // Local fallback
    const newModel: MotorModelView = {
      id: `mod-${Date.now()}`,
      name: modelName,
      serials: uniqueSerials,
      createdAt: new Date().toISOString(),
    };

    const updated = localData.map((hp) => {
      if (hp.hp !== targetHpForModel) return hp;
      return {
        ...hp,
        models: [...hp.models, newModel],
      };
    });

    updateLocalData(updated);
    setIsAddModelOpen(false);
    toast.success(`Added model: ${modelName}`);
  };

  const handleOpenEditModel = (hp: string, model: MotorModelView) => {
    setEditModelTarget({ hp, model });
    setEditModelName(model.name);
  };

  const handleSaveEditModel = () => {
    if (!editModelTarget) return;
    const trimmed = editModelName.trim();
    if (!trimmed) {
      toast.error("Model name cannot be empty");
      return;
    }

    if (isUsingBackend) {
      updateMotorMutation.mutate(
        {
          id: editModelTarget.model.id,
          data: {
            model: trimmed,
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
      return;
    }

    // Local fallback
    const updated = localData.map((hp) => {
      if (hp.hp !== editModelTarget.hp) return hp;
      return {
        ...hp,
        models: hp.models.map((m) =>
          m.id === editModelTarget.model.id
            ? {
                ...m,
                name: trimmed,
              }
            : m
        ),
      };
    });

    updateLocalData(updated);
    setEditModelTarget(null);
    toast.success("Model updated");
  };

  const handleDeleteModel = () => {
    if (!deleteModelTarget) return;
    const { hp, model } = deleteModelTarget;

    if (isUsingBackend) {
      deleteMotorMutation.mutate(model.id, {
        onSuccess: () => {
          toast.success(`Deleted model: ${model.name}`);
          setDeleteModelTarget(null);
        },
        onError: (err) => {
          toast.error("Failed to delete model: " + err.message);
        },
      });
      return;
    }

    // Local fallback
    const updated = localData.map((item) => {
      if (item.hp !== hp) return item;
      return {
        ...item,
        models: item.models.filter((m) => m.id !== model.id),
      };
    });

    updateLocalData(updated);
    toast.success(`Deleted model: ${model.name}`);
    setDeleteModelTarget(null);
  };

  // --------------------------------------------------------------------------
  // Data Reset, Export & Import
  // --------------------------------------------------------------------------
  const handleResetSampleData = () => {
    updateLocalData(DEFAULT_MOTOR_DATA);
    setIsResetConfirmOpen(false);
    setSelectedHpFilter("ALL");
    setSearchQuery("");
    toast.success("Reset to sample motor inventory data");
  };

  const handleClearAll = () => {
    updateLocalData([]);
    setIsClearConfirmOpen(false);
    setSelectedHpFilter("ALL");
    setSearchQuery("");
    toast.info("Cleared all motor inventory data");
  };

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

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          updateLocalData(parsed);
          toast.success("Motor inventory imported successfully");
        } else {
          toast.error("Invalid file format: expected an array of HP categories");
        }
      } catch (err) {
        toast.error("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!isLocalLoaded && isApiLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Zap className="h-8 w-8 animate-pulse text-primary" />
        <p>Loading motor inventory...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* ------------------------------------------------------------------ */}
      {/* Header & Main Actions */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Manage Motors & Serials
                </h1>
                {isUsingBackend ? (
                  <Badge
                    variant="outline"
                    className="text-[11px] gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                  >
                    <Database className="h-3 w-3" /> Backend Live
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[11px] gap-1 border-amber-500/30 text-amber-600 bg-amber-500/10"
                    title="Database is offline/unreachable; using local storage"
                  >
                    <CloudOff className="h-3 w-3" /> Local / Offline Mode
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Track motor models and serial numbers organized by Horsepower (HP)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleExportJson}>
                <Download className="mr-2 h-4 w-4" /> Export JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTriggerImport}>
                <Upload className="mr-2 h-4 w-4" /> Import JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsResetConfirmOpen(true)}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Sample Data
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsClearConfirmOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Motors
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
      {/* Empty State: No Data at all */}
      {/* ------------------------------------------------------------------ */}
      {groupedData.length === 0 && (
        <Card className="py-12 border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No HP categories found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Get started by adding your first HP range (e.g. 0.5 HP, 1.0 HP) or
                load sample data.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOpenAddHp} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add HP Range
              </Button>
              <Button onClick={handleResetSampleData} variant="outline">
                <RotateCcw className="h-4 w-4 mr-1.5" /> Load Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty State: Search yielded no matches */}
      {/* ------------------------------------------------------------------ */}
      {groupedData.length > 0 && filteredData.length === 0 && (
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
                      className="text-xs font-mono font-medium"
                    >
                      {totalHpSerials}{" "}
                      {totalHpSerials === 1 ? "Unit" : "Units"}
                    </Badge>
                  </div>
                </div>

                {/* HP Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => handleOpenAddModel(hp.hp)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Model
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Edit HP Rating"
                    onClick={() => handleOpenEditHp(hp)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Delete HP Category"
                    onClick={() => setDeleteHpTarget(hp)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Models Content */}
              <CardContent className="p-5 space-y-4">
                {hp.models.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg flex flex-col items-center justify-center gap-2">
                    <Package className="h-6 w-6 text-muted-foreground/60" />
                    <p className="text-sm">
                      No models added under {hp.hp} yet.
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs gap-1 mt-1"
                      onClick={() => handleOpenAddModel(hp.hp)}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add First Model
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {hp.models.map((model) => {
                      const isModelCopied = copiedModelId === model.id;
                      const currentSerialInput = serialInputs[model.id] || "";

                      return (
                        <div
                          key={model.id}
                          className="border rounded-lg p-4 bg-background/50 hover:bg-background/80 transition-colors space-y-3"
                        >
                          {/* Model Title & Controls */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-base text-foreground">
                                {model.name}
                              </span>

                              <Badge
                                variant={
                                  model.serials.length > 0
                                    ? "outline"
                                    : "destructive"
                                }
                                className="text-xs font-mono font-normal"
                              >
                                {model.serials.length} available
                              </Badge>
                            </div>

                            <div className="flex items-center gap-1 self-end sm:self-auto">
                              {model.serials.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                                  onClick={() => handleCopySerials(model)}
                                  title="Copy all serials as comma-separated text"
                                >
                                  {isModelCopied ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-500" />
                                      <span className="text-emerald-500">
                                        Copied
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy Serials</span>
                                    </>
                                  )}
                                </Button>
                              )}

                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  handleOpenEditModel(hp.hp, model)
                                }
                                title="Edit model"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  setDeleteModelTarget({ hp: hp.hp, model })
                                }
                                title="Delete model"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Serial Numbers Badge Display */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                              <span>Serial Numbers:</span>
                              <span className="text-[11px] text-muted-foreground/80">
                                Click &apos;×&apos; on any badge to delete
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
                              {model.serials.length === 0 ? (
                                <span className="text-xs text-muted-foreground italic">
                                  No serials tracked. Enter one below to add.
                                </span>
                              ) : (
                                model.serials.map((serial) => {
                                  const isQueryMatch =
                                    searchQuery.trim() &&
                                    serial
                                      .toLowerCase()
                                      .includes(
                                        searchQuery.trim().toLowerCase()
                                      );

                                  return (
                                    <Badge
                                      key={serial}
                                      variant={
                                        isQueryMatch ? "default" : "outline"
                                      }
                                      className={`font-mono text-xs px-2.5 py-1 gap-1.5 transition-all select-all flex items-center ${
                                        isQueryMatch
                                          ? "bg-amber-500 text-black font-semibold border-amber-600 shadow-xs"
                                          : "bg-muted/40 hover:bg-muted text-foreground border-border/80"
                                      }`}
                                    >
                                      <span>{serial}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveSerial(
                                            hp.hp,
                                            model.id,
                                            serial
                                          );
                                        }}
                                        className={`rounded-full p-0.5 transition-colors focus:outline-hidden ${
                                          isQueryMatch
                                            ? "hover:bg-black/20 text-black"
                                            : "text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                                        }`}
                                        title={`Delete serial ${serial}`}
                                        aria-label={`Delete serial ${serial}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Quick Add Serial Input */}
                          <div className="pt-1">
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleAddSerial(hp.hp, model.id);
                              }}
                              className="flex items-center gap-2 max-w-md"
                            >
                              <div className="relative flex-1">
                                <Input
                                  value={currentSerialInput}
                                  onChange={(e) =>
                                    setSerialInputs((prev) => ({
                                      ...prev,
                                      [model.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Type serial # & press Enter (e.g. SN-1024)..."
                                  className="h-8 text-xs font-mono"
                                />
                              </div>
                              <Button
                                type="submit"
                                size="sm"
                                variant="secondary"
                                className="h-8 px-3 text-xs gap-1 shrink-0"
                                disabled={!currentSerialInput.trim()}
                              >
                                <Plus className="h-3.5 w-3.5" /> Add Serial
                              </Button>
                            </form>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Tip: You can paste multiple serials separated by
                              commas or spaces.
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Dialog: Add HP Range */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={isAddHpOpen} onOpenChange={setIsAddHpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add HP Range / Rating</DialogTitle>
            <DialogDescription>
              Enter the motor horsepower category (e.g., 0.75 HP, 2.0 HP, 3-5 HP).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="hp-name">HP Rating / Name</Label>
              <Input
                id="hp-name"
                value={newHpName}
                onChange={(e) => setNewHpName(e.target.value)}
                placeholder="e.g. 0.75 HP or 15 HP"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmAddHp();
                  }
                }}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Or pick a common preset:
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {HP_PRESETS.map((preset) => {
                  const alreadyExists = groupedData.some(
                    (d) => d.hp.toLowerCase() === preset.toLowerCase()
                  );
                  return (
                    <Button
                      key={preset}
                      type="button"
                      size="sm"
                      variant={newHpName === preset ? "default" : "outline"}
                      disabled={alreadyExists}
                      className="h-7 text-xs px-2.5"
                      onClick={() => setNewHpName(preset)}
                    >
                      {preset}
                      {alreadyExists && (
                        <span className="text-[9px] ml-1 opacity-60">
                          (added)
                        </span>
                      )}
                    </Button>
                  );
                })}
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
            <Button
              type="button"
              onClick={() => handleConfirmAddHp()}
              disabled={!newHpName.trim()}
            >
              Add HP Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Dialog: Edit HP Category */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={Boolean(editHpTarget)}
        onOpenChange={(open) => !open && setEditHpTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit HP Rating</DialogTitle>
            <DialogDescription>
              Rename this horsepower category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="edit-hp-name">HP Rating</Label>
            <Input
              id="edit-hp-name"
              value={editHpName}
              onChange={(e) => setEditHpName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveEditHp();
                }
              }}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditHpTarget(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveEditHp}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Dialog: Add Model */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Motor Model</DialogTitle>
            <DialogDescription>
              Add a new motor model and optionally seed its serial numbers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="target-hp">Select HP Rating</Label>
              <Select
                value={targetHpForModel}
                onValueChange={setTargetHpForModel}
              >
                <SelectTrigger id="target-hp">
                  <SelectValue placeholder="Select HP..." />
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

            <div className="space-y-2">
              <Label htmlFor="model-name">Model Name *</Label>
              <Input
                id="model-name"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="e.g. Mini Sapphire II or KDS-112++"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial-serials">
                Initial Serial Numbers (Optional)
              </Label>
              <Input
                id="initial-serials"
                value={newModelSerials}
                onChange={(e) => setNewModelSerials(e.target.value)}
                placeholder="Comma or space separated (e.g. SN-101, SN-102)"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                You can also add serial badges one-by-one anytime after creating
                the model.
              </p>
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
              type="button"
              onClick={handleConfirmAddModel}
              disabled={!newModelName.trim() || !targetHpForModel}
            >
              Add Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Dialog: Edit Model */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={Boolean(editModelTarget)}
        onOpenChange={(open) => !open && setEditModelTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
            <DialogDescription>
              Update model name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-model-name">Model Name</Label>
              <Input
                id="edit-model-name"
                value={editModelName}
                onChange={(e) => setEditModelName(e.target.value)}
                autoFocus
              />
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
            <Button type="button" onClick={handleSaveEditModel}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Alert Dialog: Delete HP Category */}
      {/* ------------------------------------------------------------------ */}
      <AlertDialog
        open={Boolean(deleteHpTarget)}
        onOpenChange={(open) => !open && setDeleteHpTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteHpTarget?.hp} category?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the <strong>{deleteHpTarget?.hp}</strong>{" "}
              category along with all its{" "}
              <strong>{deleteHpTarget?.models.length} model(s)</strong> and
              associated serial numbers. This action cannot be undone.
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
      {/* Alert Dialog: Delete Model */}
      {/* ------------------------------------------------------------------ */}
      <AlertDialog
        open={Boolean(deleteModelTarget)}
        onOpenChange={(open) => !open && setDeleteModelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete model &quot;{deleteModelTarget?.model.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this model and all{" "}
              <strong>
                {deleteModelTarget?.model.serials.length} serial numbers
              </strong>{" "}
              tracked under it.
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
      {/* Alert Dialog: Confirm Reset Sample Data */}
      {/* ------------------------------------------------------------------ */}
      <AlertDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to default sample data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite your current motor list with the default sample
              motors and serial numbers. Any unsaved custom entries will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSampleData}>
              Reset Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ------------------------------------------------------------------ */}
      {/* Alert Dialog: Confirm Clear All */}
      {/* ------------------------------------------------------------------ */}
      <AlertDialog
        open={isClearConfirmOpen}
        onOpenChange={setIsClearConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all motor inventory?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove all HP categories, models, and serial
              numbers? You will start with a blank list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
