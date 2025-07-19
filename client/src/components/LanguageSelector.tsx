import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-full justify-start">
          <span className="material-icons text-lg">language</span>
          {language === 'en' ? t.english : t.sindhi}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={`gap-2 ${language === 'en' ? 'bg-accent' : ''}`}
        >
          <span className="material-icons text-lg">public</span>
          {t.english}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('sd')}
          className={`gap-2 ${language === 'sd' ? 'bg-accent' : ''}`}
        >
          <span className="material-icons text-lg">translate</span>
          {t.sindhi}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};