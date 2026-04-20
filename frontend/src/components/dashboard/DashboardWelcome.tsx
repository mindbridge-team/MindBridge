type DashboardWelcomeProps = {
  todayLine: string;
};

export function DashboardWelcome({ todayLine }: DashboardWelcomeProps) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">
        Welcome back to MindBridge
      </h2>
      <p className="text-xs md:text-sm text-muted-foreground">{todayLine}</p>
    </div>
  );
}
