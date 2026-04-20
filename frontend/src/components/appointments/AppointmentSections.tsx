import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { type Appointment } from '../../lib/api';
import { formatUtcDateTime } from '../../lib/dateTime';
import { APPOINTMENT_STATUS_CLASS } from '../../lib/appointments';

type AppointmentUpcomingCardProps = {
  appointment: Appointment;
  title: string;
  subtitle?: string;
  controls?: ReactNode;
};

export function AppointmentUpcomingCard({
  appointment,
  title,
  subtitle,
  controls,
}: AppointmentUpcomingCardProps) {
  return (
    <Card className="gap-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-sm flex items-center justify-between gap-2">
          <span className="truncate">{title}</span>
          <Badge className={`${APPOINTMENT_STATUS_CLASS[appointment.status]} text-xs py-0.5`}>
            {appointment.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatUtcDateTime(appointment.scheduled_time)}</span>
        </div>
        {controls}
      </CardContent>
    </Card>
  );
}

type AppointmentPastCardProps = {
  appointment: Appointment;
  title: string;
  controls?: ReactNode;
};

export function AppointmentPastCard({ appointment, title, controls }: AppointmentPastCardProps) {
  return (
    <Card className="gap-0 shadow-sm">
      <CardContent className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground">{formatUtcDateTime(appointment.scheduled_time)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${APPOINTMENT_STATUS_CLASS[appointment.status]} text-xs py-0.5`}>
            {appointment.status}
          </Badge>
          {controls}
        </div>
      </CardContent>
    </Card>
  );
}
