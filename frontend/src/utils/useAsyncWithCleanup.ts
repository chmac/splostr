import { useEffect } from "react";

export const useAsyncWithCleanup = (
  asyncFunction: () => Promise<() => void>,
  useEffectDependencies: any[] = []
) => {
  console.log("#UdaMNf useAsyncWithCleanup()", useEffectDependencies);
  useEffect(() => {
    console.log("#8FsbF9 useAsyncWithCleanup.useEffect");
    const asyncFunctionPromise = asyncFunction();
    const cleanup = () => {
      asyncFunctionPromise.then((cleanupFunction) => {
        cleanupFunction();
      });
    };
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, useEffectDependencies);
};
