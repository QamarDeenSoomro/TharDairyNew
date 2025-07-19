import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import SyncButton from "@/components/PWA/SyncButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  onMenuClick: () => void;
  onLogout?: () => void;
}

export default function Header({ onMenuClick, onLogout }: HeaderProps) {
  const isMobile = useIsMobile();
  const { isRTL } = useLanguage();

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 lg:hidden"
                onClick={onMenuClick}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <div className="flex items-center">
              <span className="material-icons text-primary text-2xl mr-2">local_drink</span>
              <h1 className="text-xl font-semibold text-foreground">Thar Dairy</h1>
            </div>
          </div>
          
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            <LanguageSelector />
            <SyncButton />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">A</span>
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">
                Admin User
              </span>
              {onLogout && (
                <Button variant="ghost" size="sm" onClick={onLogout} className="ml-2">
                  <span className="material-icons text-lg mr-1">logout</span>
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
