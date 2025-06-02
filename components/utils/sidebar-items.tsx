import {
    LayoutDashboard,
    FileText,
    FilePlus,
    FolderOpen,
    Boxes,
    Search,
    ShieldCheck,
    BarChart3,
    Settings,
    Magnet
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
                url: "/sales/new",
                icon: FilePlus,
            },
            {
                title: "All Sales",
                url: "/sales/all",
                icon: FolderOpen,
            },
            {
                title: "New Purchase",
                url: "/purchases/new",
                icon: FilePlus,
            },
            {
                title: "All Purchases",
                url: "/purchases/all",
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
                url: "/stock/all",
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
        title: "Customers",
        url: "#",
        icon: Magnet,
        subItems: [
            {
                title: "Search Customers",
                url: "/customers/all",
                icon: Search,
            },
            {
                title: "New Customer",
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