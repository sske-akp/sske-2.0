import {
    SidebarHeader, SidebarContent, SidebarGroup, Sidebar, SidebarGroupContent, SidebarMenu,
    SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton
} from '@/components/ui/sidebar'
import {
    Search, Settings, LayoutDashboard,
    FileText, FilePlus, FolderOpen, Boxes, ShieldCheck, BarChart3
} from 'lucide-react'
import React from 'react'

const sidebarItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Invoice",
        url: "#",
        icon: FileText,
        subItems: [
            {
                title: "New Sale",
                url: "#",
                icon: FilePlus,
            },
            {
                title: "All Sales",
                url: "#",
                icon: FolderOpen,
            },
            {
                title: "New Purchase",
                url: "#",
                icon: FilePlus,
            },
            {
                title: "All Purchases",
                url: "#",
                icon: FolderOpen,
            }
        ]
    },
    {
        title: "Stock",
        url: "#",
        icon: Boxes,
        subItems: [
            {
                title: "Search Stock",
                url: "/stock/search",
                icon: Search,
            },
            {
                title: "Stock Audit",
                url: "#",
                icon: ShieldCheck,
            }
        ]
    },
    {
        title: "Reports",
        url: "#",
        icon: BarChart3,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
];


export default function AppSideBar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <h1 className='pl-2 pt-2'>SSKE</h1>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sidebarItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                    {item.subItems?.map((subItem) => (
                                        <SidebarMenuSub key={subItem.title}>
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild>
                                                    <a href={subItem.url}>
                                                        <subItem.icon />
                                                        <span>{subItem.title}</span>
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    ))}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
