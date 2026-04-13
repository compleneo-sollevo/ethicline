"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { Activity, CheckCircle2, Sparkles } from "lucide-react";

const placeholderCards = [
  {
    title: "Kennzahl 1",
    description: "Platzhalter",
    icon: Sparkles,
  },
  {
    title: "Kennzahl 2",
    description: "Platzhalter",
    icon: Activity,
  },
  {
    title: "Kennzahl 3",
    description: "Platzhalter",
    icon: CheckCircle2,
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Willkommen bei ethicLine</h1>
        <p className="text-sm text-muted-foreground">
          Die App-Shell steht. Fachliche Funktionen folgen in weiteren Sessions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Angemeldet</CardTitle>
          <CardDescription>Aktueller Benutzer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Name: </span>
            <span className="font-medium">{user?.full_name ?? "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">E-Mail: </span>
            <span className="font-medium">{user?.email ?? "—"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
