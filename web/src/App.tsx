import type { UnpublishedDto } from "@shared/types";
import { Shell } from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { useMeta } from "@/state/meta";
import { useStore } from "@/state/store";
import { Creatives } from "@/views/Creatives";
import { Integrations } from "@/views/Integrations";
import { Overview } from "@/views/Overview";
import { Performance } from "@/views/Performance";
import { Publishing } from "@/views/Publishing";
import { TopCreatives } from "@/views/TopCreatives";
import { Unpublished } from "@/views/Unpublished";

const VIEWS = {
  overview: Overview,
  creatives: Creatives,
  performance: Performance,
  top: TopCreatives,
  unpub: Unpublished,
  publish: Publishing,
  settings: Integrations,
} as const;

export function App() {
  const { view, app } = useStore();
  const { nonce } = useMeta();

  // The rail badge needs the unpublished count on every view, not just its own,
  // so it is fetched here rather than inside the unpublished view.
  const counts = useApi<UnpublishedDto>("/unpublished", { app, _r: nonce });

  const View = VIEWS[view] ?? Overview;

  return (
    <Shell unpublishedCount={counts.data?.counts.nowhere ?? null}>
      <View />
    </Shell>
  );
}
