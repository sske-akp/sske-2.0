"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export default function BarcodeButton() {
    return (
        <Button
            variant="outline"
            size="icon"
            className="w-[280px] h-[50px] outline-dashed"
            onClick={() => toast("Event has been created.")}
        >
            <div className="flex items-center justify-center">
                <Camera />
            </div>
        </Button>
    );
}