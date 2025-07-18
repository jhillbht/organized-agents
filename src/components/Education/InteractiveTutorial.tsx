import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface InteractiveTutorialProps {
  /**
   * Unique identifier or slug for the tutorial, used for analytics / routing
   */
  id?: string;
  /**
   * Title shown at the top of the tutorial card
   */
  title?: string;
  /**
   * Optional short description
   */
  description?: string;
  /**
   * Callback when the user wants to start / resume the tutorial
   */
  onStart?: () => void;
}

/**
 * InteractiveTutorial – placeholder implementation
 *
 * This component was added to satisfy build-time imports. A fuller
 * implementation will replace this stub later.
 */
export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  id,
  title = 'Interactive Tutorial',
  description = 'Coming soon – this interactive tutorial is not yet implemented.',
  onStart,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 text-muted-foreground">{description}</p>
        {onStart && (
          <Button onClick={onStart} className="mt-2">
            Start Tutorial
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
