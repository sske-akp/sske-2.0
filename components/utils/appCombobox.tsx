"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
    searchCategory: string,
    size: string,
}

export function AppCombobox({ items, searchCategory, size }: AppComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={`justify-between ${size}`}
                >
                    {value
                        ? items.find((items) => items.value === value)?.label
                        : `${searchCategory}`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={`${size} p-0`}>
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
