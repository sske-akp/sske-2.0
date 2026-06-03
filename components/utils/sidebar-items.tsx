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
    Magnet,
    Truck,
    Package,
    Tag,
    Bookmark,
    BookOpen,
    Scale,
    TrendingUp,
    Landmark,
    Clock,
    ScanSearch,
    Receipt,
    NotebookPen,
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
            },
            {
                title: "Purchase Bills",
                url: "/purchases/bills",
                icon: Landmark,
            }
        ]
    },
    {
        title: "Products",
        url: "#",
        icon: Package,
        subItems: [
            {
                title: "All Products",
                url: "/products/all",
                icon: Search,
            },
            {
                title: "New Product",
                url: "/products/new",
                icon: FilePlus,
            },
            {
                title: "Categories",
                url: "/products/categories",
                icon: Tag,
            },
            {
                title: "Brands",
                url: "/products/brands",
                icon: Bookmark,
            },
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
                title: "Stock Lookup",
                url: "/stock/lookup",
                icon: ScanSearch,
            },
            {
                title: "Stock Audit",
                url: "/stock/audit",
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
                url: "/customers/new",
                icon: ShieldCheck,
                disabled: false
            }
        ]

    },
    {
        title: "Suppliers",
        url: "#",
        icon: Truck,
        subItems: [
            {
                title: "All Suppliers",
                url: "/suppliers/all",
                icon: Search,
            },
            {
                title: "New Supplier",
                url: "/suppliers/new",
                icon: FilePlus,
            },
        ]
    },
    {
        title: "Accounting",
        url: "#",
        icon: BookOpen,
        subItems: [
            {
                title: "Vouchers",
                url: "/accounting/vouchers",
                icon: Receipt,
            },
            {
                title: "Day Book",
                url: "/accounting/day-book",
                icon: NotebookPen,
            },
            {
                title: "General Ledger",
                url: "/accounting/ledger",
                icon: BookOpen,
            },
            {
                title: "Trial Balance",
                url: "/accounting/trial-balance",
                icon: Scale,
            },
            {
                title: "Profit & Loss",
                url: "/accounting/profit-loss",
                icon: TrendingUp,
            },
            {
                title: "Balance Sheet",
                url: "/accounting/balance-sheet",
                icon: Landmark,
            },
            {
                title: "Receivables",
                url: "/accounting/receivables",
                icon: Clock,
            },
        ]
    },
    {
        title: "GST",
        url: "#",
        icon: Scale,
        subItems: [
            {
                title: "GSTR-1",
                url: "/gst/gstr1",
                icon: FileText,
            },
            {
                title: "GSTR-3B",
                url: "/gst/gstr3b",
                icon: BarChart3,
            },
        ]
    },
    {
        title: "Reports",
        url: "/reports/",
        icon: BarChart3
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
];


export default sidebarItems;