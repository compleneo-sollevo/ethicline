"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, RotateCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-20">
      <Card className="max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Ein Fehler ist aufgetreten</h2>
          <p className="text-sm text-muted-foreground">
            Beim Laden dieser Seite ist ein unerwarteter Fehler aufgetreten.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => unstable_retry()} variant="default">
              <RotateCcw className="mr-2 h-4 w-4" />
              Erneut versuchen
            </Button>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
              <Home className="mr-2 h-4 w-4" />
              Zum Dashboard
            </Link>
          </div>

          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Fehler-ID: <code className="rounded bg-muted px-1 py-0.5">{error.digest}</code>
            </p>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            Bei Problemen bitte an den Administrator wenden.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
