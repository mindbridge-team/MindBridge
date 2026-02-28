import { useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SignUpProps {
  onSignUp: () => void;
  onBackToLogin: () => void;
}

export function SignUp({ onSignUp, onBackToLogin }: SignUpProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    birthday: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.birthday) {
      newErrors.birthday = 'Birthday is required';
    } else {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (actualAge < 13) {
        newErrors.birthday = 'You must be at least 13 years old';
      } else if (birthDate > today) {
        newErrors.birthday = 'Birthday cannot be in the future';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignUp();
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f7] via-[#f8fafb] to-[#d4e9f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-1.5 text-sm text-[#2d7a8f] hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4db8a8] to-[#2d7a8f] flex items-center justify-center text-white mb-3">
              <Heart className="h-6 w-6" fill="currentColor" />
            </div>
            <h1 className="text-xl text-[#2d7a8f]">Create Your Account</h1>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Join MindBridge and start your wellness journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                className={`bg-[#f8fafb] border-border h-9 text-sm ${errors.fullName ? 'border-red-500' : ''}`}
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className={`bg-[#f8fafb] border-border h-9 text-sm ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="birthday" className="text-sm">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
                required
                className={`bg-[#f8fafb] border-border h-9 text-sm ${errors.birthday ? 'border-red-500' : ''}`}
              />
              {errors.birthday && <p className="text-xs text-red-500">{errors.birthday}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className={`bg-[#f8fafb] border-border h-9 text-sm ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className={`bg-[#f8fafb] border-border h-9 text-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="text-xs text-muted-foreground">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" required className="rounded border-border mt-0.5" />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-[#2d7a8f] hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-[#2d7a8f] hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2d7a8f] hover:bg-[#236272] h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <button type="button" onClick={onBackToLogin} className="text-[#2d7a8f] hover:underline">
                Sign in here
              </button>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>
            In crisis? Call the National Suicide Prevention Lifeline:{' '}
            <a href="tel:988" className="text-[#2d7a8f] hover:underline">988</a>
          </p>
        </div>
      </div>
    </div>
  );
}
