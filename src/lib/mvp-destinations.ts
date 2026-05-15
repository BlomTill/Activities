import { mvpActivities } from "@/lib/content/selectors";
import { blogPosts } from "@/lib/content/selectors";
import { getAverageRating } from "@/lib/types";
import type { Activity, BlogPost } from "@/lib/types";

/**
 * The 5 Phase-1 MVP destination pages. Slugs are the URL
 * (/destinations/<slug>); `name` matches activity.mvpDestination as stamped
 * by scripts/select-mvp-activities.mjs.
 *
 * heroImage: CC0 Unsplash placeholders — flagged for replacement with
 * licensed/owned photography (see docs/PHASE_2_BACKLOG.md). matchTerms is
 * used to surface a related story.
 */
export interface MvpDestination {
  slug: string;
  name: string;
  tagline: string;
  /** ~200-word SEO intro, hand-written (no auto "Discover X"). */
  intro: string;
  heroImage: string;
  matchTerms: string[];
}

export const MVP_DESTINATIONS: MvpDestination[] = [
  {
    slug: "zurich",
    name: "Zurich",
    tagline: "Lakeside city breaks, day trips & alpine gateways",
    heroImage:
      "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600&h=900&fit=crop",
    matchTerms: ["zurich", "zürich"],
    intro:
      "Zurich is Switzerland's largest city and the easiest place to start a Swiss trip — the airport is 10 minutes from the old town and the lake is a tram ride from the station. It pairs a walkable medieval core with a working financial-district energy: Lake Zurich cruises and river swimming in summer, the Lindt Home of Chocolate and Kunsthaus year-round, and Uetliberg's panorama trail when you want a quick mountain fix without leaving the city. Zurich also works as a launchpad — the Rhine Falls, Lucerne, and even Jungfrau day trips are all comfortable returns by train. On this page we compare the activities, tours and tickets worth booking in and around Zurich across every marketplace we track, so you can see the real starting price for each before you commit. Prices are pulled from the operators and booking partners themselves; we never add a markup, and the commission that keeps this guide running is paid by the partner, not you. Use the filters to sort by price or rating, and check the comparison table on each activity for the cheapest verified option.",
  },
  {
    slug: "lucerne",
    name: "Lucerne",
    tagline: "Lake Lucerne, Pilatus, Rigi & the Titlis glacier",
    heroImage:
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1600&h=900&fit=crop",
    matchTerms: ["lucerne", "luzern", "pilatus", "rigi", "titlis"],
    intro:
      "Lucerne is central Switzerland's postcard — the Chapel Bridge, a horseshoe lake ringed by mountains, and a compact old town you can cross in fifteen minutes. It is the single best base for the classic Swiss peak excursions: the cogwheel railway up Mount Pilatus, the 'Queen of the Mountains' Rigi by rack train and paddle steamer, the Stanserhorn open-top CabriO, and the glacier at Titlis above Engelberg. Most of these combine a lake boat with a mountain railway, so the journey is half the experience. Lucerne is roughly an hour from Zurich by direct train, which makes it an easy day trip or a calmer overnight base. On this page we line up the tickets and guided options for each excursion across the marketplaces we track, so you can compare the real 'from' price and rating before booking — no markup, commission paid by the partner. Sort by price or rating, and open any activity to see the full side-by-side comparison and the cheapest verified link.",
  },
  {
    slug: "interlaken",
    name: "Interlaken",
    tagline: "Jungfrau region adventure capital — peaks, gorges & flights",
    heroImage:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&h=900&fit=crop",
    matchTerms: ["interlaken", "jungfrau", "grindelwald", "lauterbrunnen", "schilthorn"],
    intro:
      "Interlaken sits between two lakes at the foot of the Eiger, Mönch and Jungfrau, and it is Switzerland's adventure capital. From here you reach Jungfraujoch — the 'Top of Europe' and its glacier — plus the Grindelwald-First cliff walk, the Schilthorn's Piz Gloria, the Lauterbrunnen waterfall valley, and the Trümmelbach Falls inside the mountain. It is also the country's hub for tandem paragliding, canyoning, and skydiving, with the take-off and landing often within sight of town. Trains from Zurich or Bern make it a long day trip, but the Jungfrau region rewards an overnight stay. On this page we compare the railway tickets, mountain excursions and adventure operators serving Interlaken and the surrounding Bernese Oberland across every marketplace we track. Every price is the operator's own — no markup; the commission that funds this guide is paid by the booking partner, never added to your fare. Filter by price or rating, and use each activity's comparison table to find the cheapest verified booking.",
  },
  {
    slug: "zermatt",
    name: "Zermatt",
    tagline: "The Matterhorn, Gornergrat & a car-free alpine village",
    heroImage:
      "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=1600&h=900&fit=crop",
    matchTerms: ["zermatt", "matterhorn", "gornergrat"],
    intro:
      "Zermatt is the car-free village at the foot of the Matterhorn, the most photographed mountain in the Alps. The headline experiences are the Gornergrat cogwheel railway with its glacier panorama, the Matterhorn Glacier Paradise — the highest cable-car station in Europe — and the Five Lakes hike that mirrors the peak in still water. Winter turns the same terrain into one of Europe's premier ski areas; summer opens high-altitude trails and year-round glacier skiing. Zermatt is reached by a scenic train transfer from Täsch (private cars stop there), so it is more of a stay than a day trip, and it anchors one end of the Glacier Express. On this page we compare the railway and cable-car tickets, guided excursions and seasonal passes for Zermatt across the marketplaces we track, showing the real starting price and rating for each. No markup is ever added — partner-paid commission keeps the guide free. Sort and filter, then open any activity for the full price comparison.",
  },
  {
    slug: "geneva",
    name: "Geneva",
    tagline: "Lake Geneva, Chillon, Lavaux & the French-Swiss Riviera",
    heroImage:
      "https://images.unsplash.com/photo-1592609931095-54a2168ae893?w=1600&h=900&fit=crop",
    matchTerms: ["geneva", "genève", "geneve", "lausanne", "montreux", "chillon", "cern"],
    intro:
      "Geneva sits at the western tip of its namesake lake, a compact international city with the Jet d'Eau fountain, the Old Town, and CERN on its doorstep. It is the gateway to the French-speaking Swiss Riviera: lake cruises to Lausanne and Montreux, the medieval Château de Chillon on the water, and the UNESCO-listed Lavaux vineyard terraces stepping down to the shore. Mont Blanc day trips across the French border start here too. Geneva's airport and direct trains make it an efficient base for the Vaud and Lake Geneva region, and the lake boats double as scenic transport between the sights. On this page we compare the tours, cruises, museum and attraction tickets serving Geneva and the wider Lake Geneva region across every marketplace we track, so the real 'from' price and rating are visible before you book. We never add a markup; the commission that funds the guide is paid by the partner. Use the filters and each activity's comparison table to find the cheapest verified option.",
  },
];

const BY_SLUG = new Map(MVP_DESTINATIONS.map((d) => [d.slug, d]));

export function getMvpDestinationData(slug: string): {
  destination: MvpDestination;
  activities: Activity[];
  stories: BlogPost[];
} | null {
  const destination = BY_SLUG.get(slug);
  if (!destination) return null;

  const activities = mvpActivities
    .filter((a) => a.mvpDestination === destination.name)
    .sort((a, b) => (getAverageRating(b) ?? 0) - (getAverageRating(a) ?? 0));

  const terms = destination.matchTerms;
  const stories = blogPosts
    .filter((p) => {
      const hay = (p.title + " " + p.tags.join(" ")).toLowerCase();
      return terms.some((t) => hay.includes(t));
    })
    .slice(0, 2);

  return { destination, activities, stories };
}
