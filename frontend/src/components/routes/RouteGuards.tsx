import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';

type GuardedRouteProps = {
  allowed: boolean;
  element: ReactElement;
};

export function GuardedRoute({ allowed, element }: GuardedRouteProps) {
  return allowed ? element : <Navigate to="/" replace />;
}

type HomeRouteProps = {
  isCounsellorOrAdmin: boolean;
  patientHome: ReactElement;
};

export function HomeRoute({ isCounsellorOrAdmin, patientHome }: HomeRouteProps) {
  if (isCounsellorOrAdmin) {
    return <Navigate to="/appointments/counsellor" replace />;
  }
  return patientHome;
}
