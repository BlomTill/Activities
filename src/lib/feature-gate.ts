import { notFound } from "next/navigation";
import { isFeatureEnabled, type FeatureFlagName } from "./constants";

/**
 * Call at the top of a flagged route's layout/page. When the feature flag is
 * off the route renders a 404 instead of the (unfinished) page. Nothing is
 * deleted — flip NEXT_PUBLIC_FEATURE_<NAME>=on to restore.
 */
export function gateFeature(flag: FeatureFlagName): void {
  if (!isFeatureEnabled(flag)) {
    notFound();
  }
}
