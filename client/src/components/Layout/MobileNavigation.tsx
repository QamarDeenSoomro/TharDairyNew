import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: "dashboard" },
  { name: "Vendors", href: "/vendors", icon: "agriculture" },
  { name: "Customers", href: "/customers", icon: "people" },
  { name: "Reports", href: "/reports", icon: "assessment" },
];

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="grid grid-cols-4 gap-1">
        {navigationItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span className="material-icons text-sm">{item.icon}</span>
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
