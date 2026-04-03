export type Locale = "en" | "de" | "fr" | "it";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

type TranslationKey =
  | "nav.home"
  | "nav.activities"
  | "nav.budget"
  | "nav.map"
  | "nav.deals"
  | "nav.blog"
  | "nav.compare"
  | "hero.search"
  | "hero.budgetExplorer"
  | "hero.surpriseMe"
  | "categories.outdoor"
  | "categories.culture"
  | "categories.adventure"
  | "categories.family"
  | "categories.wellness"
  | "ageGroups.child"
  | "ageGroups.student"
  | "ageGroups.adult"
  | "ageGroups.senior"
  | "common.free"
  | "common.viewAll"
  | "common.book"
  | "common.details"
  | "common.search"
  | "common.filters"
  | "seasons.spring"
  | "seasons.summer"
  | "seasons.autumn"
  | "seasons.winter";

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "nav.home": "Home",
    "nav.activities": "Activities",
    "nav.budget": "Budget Explorer",
    "nav.map": "Map",
    "nav.deals": "Deals",
    "nav.blog": "Blog",
    "nav.compare": "Compare",
    "hero.search": "What do you want to do in Switzerland?",
    "hero.budgetExplorer": "Budget Explorer",
    "hero.surpriseMe": "Surprise Me",
    "categories.outdoor": "Outdoor",
    "categories.culture": "Culture",
    "categories.adventure": "Adventure",
    "categories.family": "Family",
    "categories.wellness": "Wellness",
    "ageGroups.child": "Child",
    "ageGroups.student": "Student",
    "ageGroups.adult": "Adult",
    "ageGroups.senior": "Senior",
    "common.free": "Free",
    "common.viewAll": "View all",
    "common.book": "Book Now",
    "common.details": "Details",
    "common.search": "Search",
    "common.filters": "Filters",
    "seasons.spring": "Spring",
    "seasons.summer": "Summer",
    "seasons.autumn": "Autumn",
    "seasons.winter": "Winter",
  },
  de: {
    "nav.home": "Startseite",
    "nav.activities": "Aktivitäten",
    "nav.budget": "Budget-Planer",
    "nav.map": "Karte",
    "nav.deals": "Angebote",
    "nav.blog": "Blog",
    "nav.compare": "Vergleichen",
    "hero.search": "Was möchten Sie in der Schweiz unternehmen?",
    "hero.budgetExplorer": "Budget-Planer",
    "hero.surpriseMe": "Überrasch mich",
    "categories.outdoor": "Outdoor",
    "categories.culture": "Kultur",
    "categories.adventure": "Abenteuer",
    "categories.family": "Familie",
    "categories.wellness": "Wellness",
    "ageGroups.child": "Kind",
    "ageGroups.student": "Student",
    "ageGroups.adult": "Erwachsener",
    "ageGroups.senior": "Senior",
    "common.free": "Gratis",
    "common.viewAll": "Alle anzeigen",
    "common.book": "Jetzt buchen",
    "common.details": "Details",
    "common.search": "Suchen",
    "common.filters": "Filter",
    "seasons.spring": "Frühling",
    "seasons.summer": "Sommer",
    "seasons.autumn": "Herbst",
    "seasons.winter": "Winter",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.activities": "Activités",
    "nav.budget": "Explorateur Budget",
    "nav.map": "Carte",
    "nav.deals": "Offres",
    "nav.blog": "Blog",
    "nav.compare": "Comparer",
    "hero.search": "Que voulez-vous faire en Suisse?",
    "hero.budgetExplorer": "Explorateur Budget",
    "hero.surpriseMe": "Surprends-moi",
    "categories.outdoor": "Plein air",
    "categories.culture": "Culture",
    "categories.adventure": "Aventure",
    "categories.family": "Famille",
    "categories.wellness": "Bien-être",
    "ageGroups.child": "Enfant",
    "ageGroups.student": "Étudiant",
    "ageGroups.adult": "Adulte",
    "ageGroups.senior": "Senior",
    "common.free": "Gratuit",
    "common.viewAll": "Voir tout",
    "common.book": "Réserver",
    "common.details": "Détails",
    "common.search": "Rechercher",
    "common.filters": "Filtres",
    "seasons.spring": "Printemps",
    "seasons.summer": "Été",
    "seasons.autumn": "Automne",
    "seasons.winter": "Hiver",
  },
  it: {
    "nav.home": "Home",
    "nav.activities": "Attività",
    "nav.budget": "Esploratore Budget",
    "nav.map": "Mappa",
    "nav.deals": "Offerte",
    "nav.blog": "Blog",
    "nav.compare": "Confronta",
    "hero.search": "Cosa vuoi fare in Svizzera?",
    "hero.budgetExplorer": "Esploratore Budget",
    "hero.surpriseMe": "Sorprendimi",
    "categories.outdoor": "All'aperto",
    "categories.culture": "Cultura",
    "categories.adventure": "Avventura",
    "categories.family": "Famiglia",
    "categories.wellness": "Benessere",
    "ageGroups.child": "Bambino",
    "ageGroups.student": "Studente",
    "ageGroups.adult": "Adulto",
    "ageGroups.senior": "Senior",
    "common.free": "Gratuito",
    "common.viewAll": "Vedi tutto",
    "common.book": "Prenota",
    "common.details": "Dettagli",
    "common.search": "Cerca",
    "common.filters": "Filtri",
    "seasons.spring": "Primavera",
    "seasons.summer": "Estate",
    "seasons.autumn": "Autunno",
    "seasons.winter": "Inverno",
  },
};

export function t(key: TranslationKey, locale: Locale = "en"): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}
