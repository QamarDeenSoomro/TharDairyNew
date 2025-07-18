import { Plus } from "lucide-react";
import { Button } from "./button";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export default function FloatingActionButton() {
  const [location, setLocation] = useLocation();

  const quickActions = [
    { label: "Add Vendor", onClick: () => setLocation("/vendors") },
    { label: "Add Customer", onClick: () => setLocation("/customers") },
    { label: "Receive Milk", onClick: () => setLocation("/milk-receiving") },
    { label: "Send Milk", onClick: () => setLocation("/milk-sending") },
    { label: "Record Payment", onClick: () => setLocation("/payments") },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="fab">
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {quickActions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            className="cursor-pointer"
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
