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

// --- Global accelerator hotkeys -------------------------------------------
// Two flavours, both non-breaking additions to the Cmd/Ctrl-K palette:
//   * "g" chords (Tally/Gmail style): press `g` then a letter within 1s.
//       g v -> Vouchers,  g d -> Day Book,  g l -> Ledger,  g h -> Home
//   * Alt accelerators for quick "new" actions:
//       Alt+S -> New Sale,  Alt+R -> New Receipt voucher,
//       Alt+P -> New Payment voucher
// All handlers bail out when focus is in an input/textarea/select or an
// editable element so they never interfere with typing.
const CHORD_ROUTES: Record<string, string> = {
    v: "/accounting/vouchers",
    d: "/accounting/day-book",
    l: "/accounting/ledger",
    h: "/",
}

const ALT_ROUTES: Record<string, string> = {
    s: "/sales/new",
    r: "/accounting/vouchers?type=receipt",
    p: "/accounting/vouchers?type=payment",
}

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    const tag = target.tagName
    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
    )
}

export default function CommandPane() {

    const [open, setOpen] = React.useState(false)
    // Tracks whether `g` was the previous key, to detect chords.
    const chordPending = React.useRef(false)
    const chordTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    const navigate = React.useCallback((url: string) => {
        window.location.href = url
    }, [])

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Existing behaviour: Cmd/Ctrl-K toggles the palette.
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
                return
            }

            // Don't hijack keys while the user is typing or has the palette open.
            if (isTypingTarget(e.target) || open) return

            // Alt accelerators for "new" actions.
            if (e.altKey && !e.ctrlKey && !e.metaKey) {
                const route = ALT_ROUTES[e.key.toLowerCase()]
                if (route) {
                    e.preventDefault()
                    navigate(route)
                }
                return
            }

            // Ignore modified keys for chord handling.
            if (e.ctrlKey || e.metaKey || e.altKey) return

            const key = e.key.toLowerCase()

            if (chordPending.current) {
                const route = CHORD_ROUTES[key]
                chordPending.current = false
                if (chordTimer.current) clearTimeout(chordTimer.current)
                if (route) {
                    e.preventDefault()
                    navigate(route)
                }
                return
            }

            if (key === "g") {
                chordPending.current = true
                if (chordTimer.current) clearTimeout(chordTimer.current)
                chordTimer.current = setTimeout(() => {
                    chordPending.current = false
                }, 1000)
            }
        }
        document.addEventListener("keydown", down)
        return () => {
            document.removeEventListener("keydown", down)
            if (chordTimer.current) clearTimeout(chordTimer.current)
        }
    }, [open, navigate])

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
