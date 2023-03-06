import { useEffect } from "react";

import Tracker from "@src/tracking/client";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getFramework,
  getRepoName,
  getShortId,
  getIntercomHash,
} from "@src/modules/environment";
import { getLibraries } from "@src/modules/slices";
import { useRouter } from "next/router";

const useSMTracker = () => {
  const { libraries, repoName, shortId, intercomHash, framework } = useSelector(
    (state: SliceMachineStoreType) => ({
      framework: getFramework(state),
      shortId: getShortId(state),
      intercomHash: getIntercomHash(state),
      repoName: getRepoName(state),
      libraries: getLibraries(state),
    })
  );

  const router = useRouter();

  useEffect(() => {
    void Tracker.get().groupLibraries(libraries, repoName);

    // For initial loading
    void Tracker.get().trackPageView(framework);
  }, []);

  // Handles if the user login/logout outside of the app.
  useEffect(() => {
    if (shortId && intercomHash) void Tracker.get().identifyUser();
  }, [shortId, intercomHash]);

  // For handling page change
  useEffect(() => {
    const handleRouteChange = () => {
      void Tracker.get().trackPageView(framework);
    };
    // When the component is mounted, subscribe to router changes
    // and log those page views
    router.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]); // could be the bug with multiple page view being sent

  return;
};

export default useSMTracker;
