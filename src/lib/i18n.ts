export type Locale = 'en' | 'fr'

const translations = {
  en: {
    app: { name: 'Vesper', tagline: 'Rest in the Word' },
    nav: { home: 'Home', bible: 'Bible', breathe: 'Breathe', meditate: 'Meditate', sleep: 'Sleep', settings: 'Settings' },
    bible: {
      oldTestament: 'Old Testament',
      newTestament: 'New Testament',
      chapter: 'Chapter',
      search: 'Search',
      searchPlaceholder: 'Search the Bible...',
      noResults: 'No results found',
      verseOfTheDay: 'Verse of the Day',
    },
    breathe: {
      title: 'Breathe',
      start: 'Start',
      pause: 'Pause',
      inhale: 'Breathe in',
      holdIn: 'Hold',
      exhale: 'Breathe out',
      holdOut: 'Hold',
      rounds: 'rounds',
      complete: 'Complete',
      selectPattern: 'Select a pattern',
    },
    home: {
      greeting: 'Peace be with you',
      quickLinks: 'Quick Links',
    },
    meditate: {
      title: 'Meditate',
      all: 'All',
      duration: 'min',
      beginBreathing: 'Begin with breathing',
      backToList: 'Back',
    },
    sleep: {
      title: 'Sleep',
      subtitle: 'Wind down for the night',
    },
    morning: {
      title: 'Morning',
      subtitle: 'Start your day',
    },
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
      autoDesc: 'Dark after 8 PM',
      narratorVoice: 'Narrator Voice',
      backgroundMusic: 'Background Music',
      on: 'On',
      off: 'Off',
      language: 'Language',
      audioNote: 'Audio is currently available in English only.',
      about: 'About',
      ourApproach: 'Our Approach',
      ourApproachDesc: 'How we write meditations — faith meets science',
      openSource: 'Open Source',
      openSourceDesc: 'View the code on GitHub',
    },
  },
  fr: {
    app: { name: 'Vesper', tagline: 'Reposez-vous dans la Parole' },
    nav: { home: 'Accueil', bible: 'Bible', breathe: 'Respirer', meditate: 'Méditer', sleep: 'Dormir', settings: 'Réglages' },
    bible: {
      oldTestament: 'Ancien Testament',
      newTestament: 'Nouveau Testament',
      chapter: 'Chapitre',
      search: 'Rechercher',
      searchPlaceholder: 'Rechercher dans la Bible...',
      noResults: 'Aucun résultat',
      verseOfTheDay: 'Verset du jour',
    },
    breathe: {
      title: 'Respirer',
      start: 'Commencer',
      pause: 'Pause',
      inhale: 'Inspirez',
      holdIn: 'Retenez',
      exhale: 'Expirez',
      holdOut: 'Retenez',
      rounds: 'cycles',
      complete: 'Terminé',
      selectPattern: 'Choisir un exercice',
    },
    home: {
      greeting: 'La paix soit avec vous',
      quickLinks: 'Accès rapide',
    },
    meditate: {
      title: 'Méditer',
      all: 'Toutes',
      duration: 'min',
      beginBreathing: 'Commencer par la respiration',
      backToList: 'Retour',
    },
    sleep: {
      title: 'Dormir',
      subtitle: 'Se détendre pour la nuit',
    },
    morning: {
      title: 'Matin',
      subtitle: 'Commencer votre journée',
    },
    settings: {
      title: 'Réglages',
      appearance: 'Apparence',
      light: 'Clair',
      dark: 'Sombre',
      auto: 'Auto',
      autoDesc: 'Sombre après 20h',
      narratorVoice: 'Voix du narrateur',
      backgroundMusic: 'Musique de fond',
      on: 'Activé',
      off: 'Désactivé',
      language: 'Langue',
      audioNote: "L'audio est disponible en anglais uniquement pour l'instant.",
      about: 'À propos',
      ourApproach: 'Notre approche',
      ourApproachDesc: 'Comment nous écrivons les méditations — foi et science',
      openSource: 'Open Source',
      openSourceDesc: 'Voir le code sur GitHub',
    },
  },
} as const

export type TranslationKey = keyof typeof translations.en

export function t(locale: Locale, path: string): string {
  const keys = path.split('.')
  let value: unknown = translations[locale]
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof value === 'string' ? value : path
}

export function getTranslations(locale: Locale) {
  return translations[locale]
}
