import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: "Dashboard", href: "/", icon: "dashboard" },
  { name: "Vendors", href: "/vendors", icon: "agriculture" },
  { name: "Customers", href: "/customers", icon: "people" },
  { name: "Milk Receiving", href: "/milk-receiving", icon: "move_down" },
  { name: "Milk Sending", href: "/milk-sending", icon: "move_up" },
  { name: "Payments", href: "/payments", icon: "payment" },
  { name: "Reports", href: "/reports", icon: "assessment" },
  { name: "Database", href: "/database", icon: "storage" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out",
    "lg:translate-x-0 lg:static lg:inset-0 lg:pt-16",
    isOpen ? "translate-x-0" : "-translate-x-full"
  );

  return (
    <>
      {/* Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center">
                <span className="material-icons text-primary text-2xl mr-2">local_drink</span>
                <h1 className="text-lg font-semibold text-foreground">Milk Supply Chain</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={isMobile ? onClose : undefined}
                >
                  <span className="material-icons mr-3 text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
