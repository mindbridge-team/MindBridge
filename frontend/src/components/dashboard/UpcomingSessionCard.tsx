import { Link } from 'react-router-dom';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

// Home card:
// shows the next session, or a clear empty/loading message.
type UpcomingSessionCardProps = {
  loading: boolean;
  person: string | null;
  dateTimeLabel: string | null;
  status: string | null;
  routeToAll: string;
};

export function UpcomingSessionCard({
  loading,
  person,
  dateTimeLabel,
  status,
  routeToAll,
}: UpcomingSessionCardProps) {
  return (
    <Card className="gap-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
        <CardTitle className="text-sm md:text-base">Upcoming session</CardTitle>
        <CardDescription className="text-xs">Your next appointment</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
        {loading ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg bg-muted/30">
            Loading upcoming sessions…
          </p>
        ) : person && dateTimeLabel ? (
          <div className="border border-border rounded-lg bg-muted/30 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{person}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{dateTimeLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              {status && (
                <Badge variant="secondary" className="capitalize">
                  {status}
                </Badge>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to={routeToAll}>View all</Link>
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg bg-muted/30">
            You have no upcoming sessions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
