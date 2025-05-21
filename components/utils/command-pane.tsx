"use client";

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import React from 'react'
import sidebarItems from "@/components/utils/sidebar-items";


export default function CommandPane() {

    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command className="rounded-lg border shadow-md md:min-w-[450px]">
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {sidebarItems.map((item) => (
                            <div key={item.title}>
                                {item.subItems?.length === 0 && <CommandItem>
                                    {item.icon && <item.icon className="mr-2" />}
                                    <span>{item.title}</span></CommandItem>}
                                <CommandGroup heading={item.title}>
                                    {item.subItems?.map((subItem) => (
                                        <CommandItem
                                            key={subItem.title}
                                            disabled={subItem.disabled}
                                            onSelect={() => {
                                                if (subItem.url) {
                                                    window.location.href = subItem.url
                                                    setOpen(false)
                                                }
                                            }}
                                        >
                                            {subItem.icon && <subItem.icon className="mr-2" />}
                                            <span>{subItem.title}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                <CommandSeparator />
                            </div>
                        ))}
                    </CommandList>
                </Command>
            </CommandDialog>

        </div>
    )
}
