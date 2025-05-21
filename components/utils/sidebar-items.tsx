import {
    LayoutDashboard,
    FileText,
    FilePlus,
    FolderOpen,
    Boxes,
    Search,
    ShieldCheck,
    BarChart3,
    Settings
} from "lucide-react";


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
                disabled: false
            }
        ]
    },
    {
        title: "Reports",
        url: "#",
        icon: BarChart3
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
];


export default sidebarItems;