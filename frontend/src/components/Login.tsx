import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onSignUpClick: () => void;
}

export function Login({ onLogin, onSignUpClick }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f7] via-[#f8fafb] to-[#d4e9f0] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-sm md:max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 md:rounded-2xl md:shadow-xl">
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#4db8a8] to-[#2d7a8f] flex items-center justify-center text-white mb-3 md:mb-4">
              <Heart className="h-6 w-6 md:h-7 md:w-7" fill="currentColor" />
            </div>
            <h1 className="text-xl md:text-2xl text-[#2d7a8f] font-semibold">MindBridge</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Your mental wellness companion
            </p>
          </div>

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
                className="bg-[#f8fafb] border-border h-9 md:h-11 text-sm md:text-base"
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
                className="bg-[#f8fafb] border-border h-9 md:h-11 text-sm md:text-base"
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
              className="w-full bg-[#2d7a8f] hover:bg-[#236272] h-9 md:h-11 text-sm md:text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-5 md:mt-6 text-center">
            <p className="text-xs md:text-sm text-muted-foreground">
              Need an account?{' '}
              <button
                type="button"
                onClick={onSignUpClick}
                className="text-[#2d7a8f] hover:underline font-medium"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>

        <div className="mt-5 md:mt-6 text-center text-xs md:text-sm text-muted-foreground">
          <p>
            In crisis? Call the National Suicide Prevention Lifeline:{' '}
            <a href="tel:988" className="text-[#2d7a8f] hover:underline">
              988
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
