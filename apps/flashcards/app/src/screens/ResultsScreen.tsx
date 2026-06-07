import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { useTranslation } from '@/i18n/I18nContext';

export function ResultsScreen(): React.ReactElement {
  const navigate = useNavigate();
  const { results, resetSession } = useSession();
  const { t } = useTranslation();

  const knownCount = results.filter((r) => r.known).length;
  const totalCount = results.length;

  const handleReplay = () => {
    resetSession();
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-4xl">{t.results.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-center text-2xl text-muted-foreground">
            {t.results.youKnew}{' '}
            <span className="text-foreground font-semibold">{knownCount}</span>
            {' / '}
            <span className="text-foreground font-semibold">{totalCount}</span>
          </p>
          <div className="flex flex-col gap-4">
            <Button onClick={handleReplay}>{t.results.replay}</Button>
            <Button variant="outline">
              <Link to="/">{t.results.backToHome}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResultsScreen;
