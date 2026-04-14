import { Heart } from 'lucide-react';
import type { ReactNode } from 'react';

type AuthPageLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  topAction?: ReactNode;
  footerAction: ReactNode;
};

export function AuthPageLayout({
  title,
  subtitle,
  children,
  topAction,
  footerAction,
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f7] via-[#f8fafb] to-[#d4e9f0] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-sm md:max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 md:rounded-2xl md:shadow-xl">
          {topAction}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#4db8a8] to-[#2d7a8f] flex items-center justify-center text-white mb-3 md:mb-4">
              <Heart className="h-6 w-6 md:h-7 md:w-7" fill="currentColor" />
            </div>
            <h1 className="text-xl md:text-2xl text-[#2d7a8f] font-semibold">{title}</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 text-center">{subtitle}</p>
          </div>
          {children}
        </div>
        <div className="mt-5 md:mt-6 text-center text-xs md:text-sm text-muted-foreground">
          <p>
            In crisis? Call the National Suicide Prevention Lifeline:{' '}
            <a href="tel:988" className="text-[#2d7a8f] hover:underline">
              988
            </a>
          </p>
          <div className="mt-3">{footerAction}</div>
        </div>
      </div>
    </div>
  );
}
