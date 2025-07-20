import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNavigationItems = (t: any) => [
  { name: t.dashboard, href: "/", icon: "dashboard" },
  { name: t.vendors, href: "/vendors", icon: "agriculture" },
  { name: t.customers, href: "/customers", icon: "people" },
  { name: t.milkReceiving, href: "/milk-receiving", icon: "move_down" },
  { name: t.milkSending, href: "/milk-sending", icon: "move_up" },
  { name: t.payments, href: "/payments", icon: "payment" },
  { name: t.pendingPayments, href: "/pending-payments", icon: "pending" },
  { name: t.dailyExpenses, href: "/expenses", icon: "trending_down" },
  { name: t.statement, href: "/bank-statement", icon: "receipt" },
  { name: t.reports, href: "/reports", icon: "assessment" },
  { name: t.databaseManagement, href: "/database", icon: "storage" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { t, isRTL } = useLanguage();
  
  const navigationItems = getNavigationItems(t);

  const sidebarClasses = cn(
    "fixed inset-y-0 z-50 w-64 bg-card border-border transform transition-transform duration-300 ease-in-out",
    "lg:translate-x-0 lg:static lg:inset-0 lg:pt-16",
    isRTL ? "right-0 border-l sidebar-rtl" : "left-0 border-r",
    isOpen ? "translate-x-0" : (isRTL ? "translate-x-full" : "-translate-x-full")
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
                <h1 className="text-lg font-semibold text-foreground">Thar Dairy</h1>
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

          {/* Language Selector at bottom - with mobile spacing */}
          <div className="px-4 pb-20 lg:pb-4 border-t border-border pt-4">
            <div className="text-xs text-muted-foreground mb-2">{t.language}</div>
            <LanguageSelector />
          </div>
        </div>
      </aside>
    </>
  );
}
