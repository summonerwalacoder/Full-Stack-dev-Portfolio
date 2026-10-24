import type { ReactElement, ReactNode } from "react";
import { Site } from "@/components/Site";
import { Bobo } from "@/components/Bobo";
import { PeakMotivation } from "@/components/PeakMotivation";

const SiteWithChildren = Site as unknown as (props: {
  children?: ReactNode;
}) => ReactElement;

export default function HomePage() {
  return (
    <SiteWithChildren>
      <Bobo />
      <PeakMotivation />
    </SiteWithChildren>
  );
}
