/**
 * Simplified daily Bible reading schedule.
 * Maps dates to appropriate scripture readings based on:
 * - Major liturgical seasons (Advent, Christmas, Lent, Easter, Pentecost)
 * - A daily reading plan for ordinary time
 *
 * Returns book slug + chapter for server-side data fetching.
 */

interface DailyReading {
  book: string    // slug
  chapter: number
  label: string   // e.g. "Advent Reading", "Easter Season"
  labelFr: string
  reason: string
  reasonFr: string
}

// Season-level reasons — applied as defaults, entries can override
const SEASON_REASONS: Record<string, { reason: string; reasonFr: string }> = {
  Advent: {
    reason: 'Advent — the Church prepares for the coming of Christ. The prophets speak of hope, longing, and the promise of Emmanuel.',
    reasonFr: "L'Avent — l'Église se prépare à la venue du Christ. Les prophètes parlent d'espérance, d'attente et de la promesse d'Emmanuel.",
  },
  Lent: {
    reason: 'Lent — forty days of preparation before Easter. A season of repentance, fasting, and returning to God.',
    reasonFr: 'Le Carême — quarante jours de préparation avant Pâques. Un temps de repentance, de jeûne et de retour vers Dieu.',
  },
  Easter: {
    reason: 'Easter Season — Christ is risen. The Church celebrates the resurrection and the birth of the early community of believers.',
    reasonFr: 'Temps pascal — le Christ est ressuscité. L\'Église célèbre la résurrection et la naissance de la première communauté de croyants.',
  },
  'Daily Reading': {
    reason: 'Ordinary Time — the Church reads through Scripture to deepen knowledge of God\'s story, from creation to the early Church.',
    reasonFr: 'Temps ordinaire — l\'Église parcourt les Écritures pour approfondir la connaissance de l\'histoire de Dieu, de la création à l\'Église primitive.',
  },
}

function withSeason(entry: Omit<DailyReading, 'reason' | 'reasonFr'>): DailyReading {
  const season = SEASON_REASONS[entry.label] ?? SEASON_REASONS['Daily Reading']
  return { ...entry, reason: season.reason, reasonFr: season.reasonFr }
}

function withReason(entry: Omit<DailyReading, 'reason' | 'reasonFr'>, reason: string, reasonFr: string): DailyReading {
  return { ...entry, reason, reasonFr }
}

// Fixed-date liturgical readings (month-day)
const FIXED_READINGS: Record<string, DailyReading> = {
  '12-24': withReason(withSeason({ book: 'luke', chapter: 2, label: 'Christmas Eve', labelFr: 'Veille de Noël' }), 'The Nativity of Christ — Luke\'s account of the birth in Bethlehem, read on the eve of Christmas as the Church has done for centuries.', 'La Nativité du Christ — le récit de Luc de la naissance à Bethléem, lu la veille de Noël comme l\'Église le fait depuis des siècles.'),
  '12-25': withReason(withSeason({ book: 'luke', chapter: 2, label: 'Christmas Day', labelFr: 'Jour de Noël' }), 'Christmas Day — "For unto you is born this day in the city of David a Saviour." The Word made flesh.', 'Jour de Noël — « Aujourd\'hui, dans la ville de David, il vous est né un Sauveur. » Le Verbe fait chair.'),
  '12-26': withReason(withSeason({ book: 'matthew', chapter: 2, label: 'Christmas Season', labelFr: 'Temps de Noël' }), 'The visit of the Magi — Matthew\'s account of the wise men following the star to find the newborn King.', 'La visite des Mages — le récit de Matthieu des sages suivant l\'étoile pour trouver le Roi nouveau-né.'),
  '12-31': withReason({ book: 'psalms', chapter: 90, label: 'Year\'s End', labelFr: 'Fin d\'année' }, '"Teach us to number our days" — Moses\' prayer at the turning of the year, grounding us in the eternal.', '« Enseigne-nous à bien compter nos jours » — la prière de Moïse au tournant de l\'année, nous ancrant dans l\'éternel.'),
  '01-01': withReason(withSeason({ book: 'psalms', chapter: 1, label: 'New Year', labelFr: 'Nouvel An' }), 'The gateway psalm — "Blessed is the one..." The tradition of beginning the year with the first psalm, a meditation on the good life rooted in God\'s word.', 'Le psaume d\'ouverture — « Heureux l\'homme... » La tradition de commencer l\'année avec le premier psaume, une méditation sur la vie bonne enracinée dans la parole de Dieu.'),
  '01-06': withReason(withSeason({ book: 'matthew', chapter: 2, label: 'Epiphany', labelFr: 'Épiphanie' }), 'Epiphany — the manifestation of Christ to the nations. The Magi represent all peoples drawn to the light.', 'L\'Épiphanie — la manifestation du Christ aux nations. Les Mages représentent tous les peuples attirés par la lumière.'),
}

// Advent readings (4 Sundays before Christmas → Dec 24)
const ADVENT_READINGS: DailyReading[] = [
  withSeason({ book: 'isaiah', chapter: 9, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 11, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 40, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 7, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'luke', chapter: 1, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 35, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 42, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 49, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 52, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 55, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 60, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 61, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'malachi', chapter: 3, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'malachi', chapter: 4, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'psalms', chapter: 25, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'psalms', chapter: 80, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'psalms', chapter: 85, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'psalms', chapter: 130, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'micah', chapter: 5, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'zechariah', chapter: 9, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'matthew', chapter: 1, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'luke', chapter: 1, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 2, label: 'Advent', labelFr: 'Avent' }),
  withSeason({ book: 'isaiah', chapter: 25, label: 'Advent', labelFr: 'Avent' }),
]

// Lent readings (Ash Wednesday → Easter, ~46 days)
const LENT_READINGS: DailyReading[] = [
  withSeason({ book: 'psalms', chapter: 51, label: 'Ash Wednesday', labelFr: 'Mercredi des Cendres' }),
  withSeason({ book: 'isaiah', chapter: 58, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'matthew', chapter: 6, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 32, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 103, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'genesis', chapter: 3, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'matthew', chapter: 4, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 91, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'romans', chapter: 5, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 130, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'john', chapter: 3, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 23, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'john', chapter: 4, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'ephesians', chapter: 2, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 139, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'john', chapter: 9, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 27, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'ezekiel', chapter: 37, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'john', chapter: 11, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 143, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'isaiah', chapter: 53, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'philippians', chapter: 2, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'hebrews', chapter: 4, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'hebrews', chapter: 12, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 42, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'james', chapter: 1, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'lamentations', chapter: 3, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: '2-corinthians', chapter: 4, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 22, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'matthew', chapter: 5, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'matthew', chapter: 18, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'colossians', chapter: 3, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 119, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'isaiah', chapter: 43, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'romans', chapter: 8, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 46, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'john', chapter: 15, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'psalms', chapter: 34, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: '1-john', chapter: 4, label: 'Lent', labelFr: 'Carême' }),
  withSeason({ book: 'matthew', chapter: 25, label: 'Lent', labelFr: 'Carême' }),
  // Holy Week
  withSeason({ book: 'matthew', chapter: 21, label: 'Palm Sunday', labelFr: 'Dimanche des Rameaux' }),
  withSeason({ book: 'john', chapter: 12, label: 'Holy Week', labelFr: 'Semaine Sainte' }),
  withSeason({ book: 'john', chapter: 13, label: 'Holy Week', labelFr: 'Semaine Sainte' }),
  withSeason({ book: 'matthew', chapter: 26, label: 'Holy Thursday', labelFr: 'Jeudi Saint' }),
  withSeason({ book: 'john', chapter: 18, label: 'Good Friday', labelFr: 'Vendredi Saint' }),
  withSeason({ book: 'matthew', chapter: 27, label: 'Holy Saturday', labelFr: 'Samedi Saint' }),
]

// Easter season readings (Easter → Pentecost, 50 days)
const EASTER_READINGS: DailyReading[] = [
  withSeason({ book: 'john', chapter: 20, label: 'Easter Sunday', labelFr: 'Dimanche de Pâques' }),
  withSeason({ book: 'matthew', chapter: 28, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'luke', chapter: 24, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'mark', chapter: 16, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'john', chapter: 21, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 1, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 2, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 3, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 4, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 5, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: '1-corinthians', chapter: 15, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'romans', chapter: 6, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'john', chapter: 14, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'john', chapter: 15, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'john', chapter: 16, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'john', chapter: 17, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'revelation', chapter: 21, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'revelation', chapter: 22, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: '1-peter', chapter: 1, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: '1-peter', chapter: 2, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 8, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 9, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 10, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 13, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 16, label: 'Easter', labelFr: 'Pâques' }),
  withSeason({ book: 'acts', chapter: 17, label: 'Easter', labelFr: 'Pâques' }),
  // Repeat/fill remaining days
  ...Array.from({ length: 24 }, (_, i) => withSeason({
    book: 'psalms',
    chapter: [8, 16, 30, 33, 47, 66, 67, 96, 97, 98, 100, 113, 114, 117, 118, 136, 145, 146, 147, 148, 149, 150, 111, 112][i % 24],
    label: 'Easter',
    labelFr: 'Pâques',
  })),
]

// Ordinary time: a curated daily reading cycle (covers key passages across the year)
const ORDINARY_READINGS: DailyReading[] = [
  // Genesis–Exodus narrative
  withSeason({ book: 'genesis', chapter: 1, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'genesis', chapter: 2, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'genesis', chapter: 12, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'genesis', chapter: 15, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'genesis', chapter: 22, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'genesis', chapter: 28, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'genesis', chapter: 32, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'genesis', chapter: 37, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'genesis', chapter: 45, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'genesis', chapter: 50, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'exodus', chapter: 3, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'exodus', chapter: 14, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'exodus', chapter: 20, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'exodus', chapter: 33, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  // Psalms
  withSeason({ book: 'psalms', chapter: 1, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 8, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 19, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 23, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 27, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 34, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 37, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 46, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 51, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 63, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 84, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 90, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 91, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 103, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 121, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'psalms', chapter: 139, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  // Proverbs / Wisdom
  withSeason({ book: 'proverbs', chapter: 3, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'proverbs', chapter: 4, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'proverbs', chapter: 8, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'proverbs', chapter: 31, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'ecclesiastes', chapter: 3, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'song-of-solomon', chapter: 2, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  // Prophets
  withSeason({ book: 'isaiah', chapter: 6, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'isaiah', chapter: 40, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'isaiah', chapter: 43, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'isaiah', chapter: 55, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'jeremiah', chapter: 29, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'jeremiah', chapter: 31, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'ezekiel', chapter: 37, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'daniel', chapter: 3, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'hosea', chapter: 11, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'micah', chapter: 6, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'habakkuk', chapter: 3, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  // Gospels
  withSeason({ book: 'matthew', chapter: 5, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'matthew', chapter: 6, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'matthew', chapter: 7, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'matthew', chapter: 11, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'matthew', chapter: 13, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'matthew', chapter: 25, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'mark', chapter: 4, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'mark', chapter: 10, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'luke', chapter: 4, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'luke', chapter: 6, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'luke', chapter: 10, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'luke', chapter: 15, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'john', chapter: 1, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'john', chapter: 6, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'john', chapter: 10, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'john', chapter: 14, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  // Epistles
  withSeason({ book: 'romans', chapter: 5, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'romans', chapter: 8, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'romans', chapter: 12, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: '1-corinthians', chapter: 13, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: '2-corinthians', chapter: 4, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'galatians', chapter: 5, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'ephesians', chapter: 2, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'ephesians', chapter: 3, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'ephesians', chapter: 6, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'philippians', chapter: 2, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'philippians', chapter: 4, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'colossians', chapter: 1, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'colossians', chapter: 3, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: '1-thessalonians', chapter: 5, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'hebrews', chapter: 11, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'hebrews', chapter: 12, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'james', chapter: 1, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'james', chapter: 2, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: '1-peter', chapter: 1, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: '1-john', chapter: 3, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: '1-john', chapter: 4, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'revelation', chapter: 1, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
  withSeason({ book: 'revelation', chapter: 21, label: 'Daily Reading', labelFr: 'Lecture du jour' }),
]

/**
 * Compute Easter date for a given year (Anonymous Gregorian algorithm).
 */
export function computeEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000
  return Math.round((b.getTime() - a.getTime()) / msPerDay)
}

export function getDailyReading(date: Date = new Date()): DailyReading {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const mmdd = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // 1. Check fixed dates
  if (FIXED_READINGS[mmdd]) return FIXED_READINGS[mmdd]

  const easter = computeEaster(year)
  const today = new Date(year, month, day)
  const daysFromEaster = daysBetween(easter, today)

  // 2. Easter season (Easter Sunday → +49 days = Pentecost)
  if (daysFromEaster >= 0 && daysFromEaster < 50) {
    return EASTER_READINGS[daysFromEaster % EASTER_READINGS.length]
  }

  // 3. Lent (Ash Wednesday = Easter - 46 days → Easter - 1)
  const ashWednesday = new Date(easter)
  ashWednesday.setDate(ashWednesday.getDate() - 46)
  const daysFromAsh = daysBetween(ashWednesday, today)
  if (daysFromAsh >= 0 && daysFromAsh < 46) {
    return LENT_READINGS[daysFromAsh % LENT_READINGS.length]
  }

  // 4. Advent (Dec 1 → Dec 23)
  if (month === 11 && day >= 1 && day <= 23) {
    return ADVENT_READINGS[(day - 1) % ADVENT_READINGS.length]
  }

  // 5. Ordinary time — cycle through readings based on day of year
  const startOfYear = new Date(year, 0, 1)
  const dayOfYear = daysBetween(startOfYear, today)
  return ORDINARY_READINGS[dayOfYear % ORDINARY_READINGS.length]
}
