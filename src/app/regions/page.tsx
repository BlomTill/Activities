import { redirect } from "next/navigation";
import { gateFeature } from "@/lib/feature-gate";

/**
 * /regions is an SEO-friendly alias for /destinations.
 * Rationale: "regions" is the verb we use in the master plan IA, while
 * /destinations is the established URL. Redirect rather than duplicate.
 */
export default function RegionsPage() {
  gateFeature("REGIONS");
  redirect("/destinations");
}
