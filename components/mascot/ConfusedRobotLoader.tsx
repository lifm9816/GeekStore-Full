"use client";

import dynamic from "next/dynamic";

const ConfusedRobot = dynamic(
  () =>
    import("@/components/mascot/ConfusedRobot").then((mod) => mod.ConfusedRobot),
  { ssr: false },
);

type ConfusedRobotLoaderProps = {
  className?: string;
};

export function ConfusedRobotLoader({ className }: ConfusedRobotLoaderProps) {
  return <ConfusedRobot className={className} />;
}
