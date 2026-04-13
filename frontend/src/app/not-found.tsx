import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Seite nicht gefunden" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-6xl font-bold text-primary">404</p>
          <h2 className="text-xl font-semibold">Seite nicht gefunden</h2>
          <p className="text-sm text-muted-foreground">
            Die angeforderte Seite existiert nicht oder wurde verschoben.
          </p>
        </CardHeader>

        <CardContent>
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
          >
            <Home className="h-4 w-4" />
            Zum Dashboard
          </Link>
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
