import { MessageSquare, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';

export function Community() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl text-foreground">Community</h2>
        <p className="text-sm text-muted-foreground">
          A simple space for peer support and shared experiences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Community discussions are not enabled yet.</p>
          <p className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            For now, use sessions and resources for support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
