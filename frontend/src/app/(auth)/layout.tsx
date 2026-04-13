import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — ethicLine",
    default: "ethicLine",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {children}
    </div>
  );
}
