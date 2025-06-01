"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


interface ComboBoxItem {
    value: string;
    label: string;
}

type ComboBoxItems = ComboBoxItem[];

interface AppComboboxProps {
    items: ComboBoxItems,
    searchCategory: string
}

export function AppCombobox({ items, searchCategory }: AppComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const triggerRef = React.useRef<HTMLDivElement>(null)
    const [triggerWidth, setTriggerWidth] = React.useState<number>(0)

    React.useEffect(() => {
        const updateWidth = () => {
            if (triggerRef.current) {
                const width = triggerRef.current.getBoundingClientRect().width
                setTriggerWidth(width)
            }
        }

        // Initial measurement
        updateWidth()

        // Create ResizeObserver to watch for size changes
        const resizeObserver = new ResizeObserver(updateWidth)

        if (triggerRef.current) {
            resizeObserver.observe(triggerRef.current)
        }

        // Also update on window resize
        window.addEventListener("resize", updateWidth)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener("resize", updateWidth)
        }
    }, [])

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setValue("")
    }

    const handleTriggerClick = () => {
        setOpen(!open)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    ref={triggerRef}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onClick={handleTriggerClick}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="combobox-listbox"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            setOpen(!open)
                        }
                    }}
                >
                    {value
                        ? items.find((items) => items.value === value)?.label
                        : `${searchCategory}`}
                    <div className="flex items-center gap-1">
                        {value ? (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center justify-center h-4 w-4 rounded-sm hover:bg-muted"
                                aria-label="Clear selection"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        ) : <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-0"
                align="start"
                style={{ width: triggerWidth > 0 ? `${triggerWidth}px` : "auto" }}>
                <Command>
                    <CommandInput placeholder={searchCategory} />
                    <CommandList>
                        <CommandEmpty>No items found.</CommandEmpty>
                        <CommandGroup>
                            {items.map((items) => (
                                <CommandItem
                                    key={items.value}
                                    value={items.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === items.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {items.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
