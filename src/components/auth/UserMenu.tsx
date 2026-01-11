import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AuthDialog } from './AuthDialog';
import { User, LogOut, LogIn } from 'lucide-react';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const isRtl = language === 'ar';

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAuthDialogOpen(true)}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          {isRtl ? 'تسجيل الدخول' : 'Sign In'}
        </Button>
        <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRtl ? 'start' : 'end'}>
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          {isRtl ? 'تسجيل الخروج' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
