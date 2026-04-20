import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const { me } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Your basic account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Username:</span>{' '}
            {me?.username ?? 'Not available'}
          </p>
          <p>
            <span className="font-medium">Email:</span>{' '}
            {me?.email ?? 'Not available'}
          </p>
          <p>
            <span className="font-medium">Role:</span>{' '}
            {me?.role ?? 'Not available'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
