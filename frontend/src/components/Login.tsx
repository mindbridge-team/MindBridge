import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AuthPageLayout } from './AuthPageLayout';
import { PRIMARY_BUTTON_COLORS } from '../lib/ui';

// Demo login page:
// sign in, then continue to role-based pages.
const INPUT_CLASSES = 'bg-[#f8fafb] border-border h-9 md:h-11 text-sm md:text-base';
const PRIMARY_BUTTON_CLASSES = `w-full ${PRIMARY_BUTTON_COLORS} h-9 md:h-11 text-sm md:text-base`;

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

type LoginFormEvent = React.FormEvent<HTMLFormElement>;

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: LoginFormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout
      title="MindBridge"
      subtitle="Sign in to continue your wellness journey"
      footerAction={(
        <p className="text-xs md:text-sm text-muted-foreground">
          Need an account?{' '}
          <Link to="/signup" className="text-[#2d7a8f] hover:underline font-medium">
            Sign up here
          </Link>
        </p>
      )}
    >
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm md:text-base">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={INPUT_CLASSES}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm md:text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={INPUT_CLASSES}
              />
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border w-4 h-4 md:w-[18px] md:h-[18px]" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-[#2d7a8f] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className={PRIMARY_BUTTON_CLASSES}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
    </AuthPageLayout>
  );
}
