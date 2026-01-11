import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Loader2 } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AuthDialog = ({ open, onClose }: AuthDialogProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();

  const isRtl = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: isRtl ? 'خطأ' : 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: isRtl ? 'تم إنشاء الحساب' : 'Account created',
            description: isRtl ? 'تم تسجيل الدخول بنجاح' : 'You are now logged in',
          });
          onClose();
          setEmail('');
          setPassword('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: isRtl ? 'خطأ' : 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: isRtl ? 'تم تسجيل الدخول' : 'Signed in',
          });
          onClose();
          setEmail('');
          setPassword('');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir={isRtl ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {isSignUp
              ? (isRtl ? 'إنشاء حساب جديد' : 'Create Account')
              : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              {isRtl ? 'البريد الإلكتروني' : 'Email'}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {isRtl ? 'كلمة المرور' : 'Password'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isSignUp
              ? (isRtl ? 'إنشاء حساب' : 'Create Account')
              : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            {isSignUp
              ? (isRtl ? 'لديك حساب؟ سجل الدخول' : 'Have an account? Sign in')
              : (isRtl ? 'ليس لديك حساب؟ أنشئ واحداً' : "Don't have an account? Create one")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
