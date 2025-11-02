import { useCallback, useReducer } from "react";

let performanceLogs: Record<string, string> = {};

export default async function logPerformance(
  measurable: Function,
  additionalInfo: string[],
) {
  const startTime = performance.now();
  await measurable();
  const totalTime = performance.now() - startTime;
  logger.performance.debug(
    `⏳ ${additionalInfo.join(", ")} -- time: ${totalTime.toFixed(2)} ms`,
  );
  performanceLogs[additionalInfo.join(", ")] = totalTime.toFixed(2);
}

export const usePerformanceLogs = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const resetLogs = useCallback(() => {
    performanceLogs = {};

    // Force rerender this component
    forceUpdate();
  }, [forceUpdate]);

  return { resetLogs, performanceLogs };
};
