"use client";

import { CunninghamProvider } from "@gouvfr-lasuite/ui-components";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CunninghamProvider>{children}</CunninghamProvider>;
}
