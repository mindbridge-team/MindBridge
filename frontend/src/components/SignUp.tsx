import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { AuthPageLayout } from './AuthPageLayout';
import { FormInputField } from './forms/FormInputField';
import { register } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { PRIMARY_BUTTON_COLORS } from '../lib/ui';

// Demo sign-up page:
// create an account and log in automatically.
const INPUT_BASE_CLASSES = 'bg-[#f8fafb] border-border h-9 text-sm';
const PRIMARY_BUTTON_CLASSES = `w-full ${PRIMARY_BUTTON_COLORS} h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed`;

interface SignUpProps {
  onSignUp: () => void;
  onBackToLogin: () => void;
}

type SignUpFormData = {
  username: string;
  email: string;
  birthday: string;
  password: string;
  confirmPassword: string;
};

function getAge(birthdayValue: string): number {
  const birthDate = new Date(birthdayValue);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  return monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
}

export function SignUp({ onSignUp, onBackToLogin }: SignUpProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState<SignUpFormData>({
    username: '',
    email: '',
    birthday: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
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
      const actualAge = getAge(formData.birthday);

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
    setErrors({});
    try {
      await register(formData.username, formData.email, formData.password);
      await login(formData.username, formData.password);
      onSignUp();
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Registration failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <AuthPageLayout
      title="Create Your Account"
      subtitle="Create your account to get started with MindBridge"
      topAction={(
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-1.5 text-sm text-[#2d7a8f] hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>
      )}
      footerAction={(
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <button type="button" onClick={onBackToLogin} className="text-[#2d7a8f] hover:underline">
            Sign in here
          </button>
        </p>
      )}
    >
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormInputField
              id="username"
              label="Username"
              type="text"
              placeholder="your_username"
              value={formData.username}
              onChange={(value) => handleInputChange('username', value)}
              required
              error={errors.username}
              inputClassName={INPUT_BASE_CLASSES}
            />

            <FormInputField
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              required
              error={errors.email}
              inputClassName={INPUT_BASE_CLASSES}
            />

            <FormInputField
              id="birthday"
              label="Birthday"
              type="date"
              value={formData.birthday}
              onChange={(value) => handleInputChange('birthday', value)}
              required
              error={errors.birthday}
              inputClassName={INPUT_BASE_CLASSES}
            />

            <FormInputField
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              required
              error={errors.password}
              inputClassName={INPUT_BASE_CLASSES}
            />

            <FormInputField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              required
              error={errors.confirmPassword}
              inputClassName={INPUT_BASE_CLASSES}
            />

            {errors.submit && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{errors.submit}</p>
            )}
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
              className={PRIMARY_BUTTON_CLASSES}
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
    </AuthPageLayout>
  );
}
