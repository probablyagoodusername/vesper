/**
 * Rich, client-side liturgical context for the home page.
 * Computes specific day names, countdowns, and descriptions
 * so every session feels contextually fresh.
 */

import { computeEaster } from './lectionary'

export interface LiturgicalEvent {
  name: string
  nameFr: string
  description: string
  descriptionFr: string
}

export interface UpcomingEvent {
  name: string
  nameFr: string
  daysUntil: number
  brief: string
  briefFr: string
}

export interface LiturgicalContext {
  current: LiturgicalEvent
  /** Day number within the current season, if applicable (e.g. "Day 23 of Lent") */
  seasonDay?: number
  seasonTotal?: number
  upcoming?: UpcomingEvent
}

// ─── Helpers ──────────────────────────────────────────────

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function mmdd(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Fixed feast days (month-day) ─────────────────────────

interface FixedFeast {
  name: string
  nameFr: string
  description: string
  descriptionFr: string
}

const FIXED_FEASTS: Record<string, FixedFeast> = {
  '01-01': {
    name: 'Solemnity of Mary, Mother of God',
    nameFr: 'Sainte Marie, Mère de Dieu',
    description: 'The Church begins the new year honoring Mary\'s role as Theotokos — the God-bearer. A day to reflect on beginnings.',
    descriptionFr: 'L\'Église commence l\'année en honorant Marie comme Théotokos — la Mère de Dieu. Un jour pour méditer sur les commencements.',
  },
  '01-06': {
    name: 'Epiphany',
    nameFr: 'Épiphanie',
    description: 'The manifestation of Christ to the nations. The Magi followed a star and found the light of the world in a manger.',
    descriptionFr: 'La manifestation du Christ aux nations. Les Mages ont suivi une étoile et trouvé la lumière du monde dans une crèche.',
  },
  '02-02': {
    name: 'Presentation of the Lord',
    nameFr: 'Présentation du Seigneur',
    description: 'Forty days after Christmas, Mary and Joseph presented Jesus at the Temple. Simeon declared him "a light for revelation to the Gentiles."',
    descriptionFr: 'Quarante jours après Noël, Marie et Joseph présentèrent Jésus au Temple. Siméon le déclara « lumière pour éclairer les nations ».',
  },
  '03-19': {
    name: 'Feast of Saint Joseph',
    nameFr: 'Saint Joseph',
    description: 'Joseph, the quiet guardian of the Holy Family — a model of trust, obedience, and fatherhood.',
    descriptionFr: 'Joseph, le gardien silencieux de la Sainte Famille — un modèle de confiance, d\'obéissance et de paternité.',
  },
  '03-25': {
    name: 'The Annunciation',
    nameFr: 'L\'Annonciation',
    description: 'The angel Gabriel announced to Mary that she would bear God\'s Son. Her "yes" changed history — exactly nine months before Christmas.',
    descriptionFr: 'L\'ange Gabriel annonça à Marie qu\'elle porterait le Fils de Dieu. Son « oui » changea l\'histoire — exactement neuf mois avant Noël.',
  },
  '06-24': {
    name: 'Birth of John the Baptist',
    nameFr: 'Nativité de saint Jean-Baptiste',
    description: 'Six months before Christmas, the Church celebrates the birth of the forerunner — the voice crying in the wilderness.',
    descriptionFr: 'Six mois avant Noël, l\'Église célèbre la naissance du précurseur — la voix qui crie dans le désert.',
  },
  '06-29': {
    name: 'Saints Peter and Paul',
    nameFr: 'Saints Pierre et Paul',
    description: 'Two pillars of the early Church: Peter the rock, Paul the apostle to the nations. Both gave their lives in Rome.',
    descriptionFr: 'Deux piliers de l\'Église primitive : Pierre le roc, Paul l\'apôtre des nations. Tous deux donnèrent leur vie à Rome.',
  },
  '08-06': {
    name: 'The Transfiguration',
    nameFr: 'La Transfiguration',
    description: 'On a mountaintop, Jesus was transfigured in dazzling light before Peter, James, and John — a glimpse of glory before the cross.',
    descriptionFr: 'Sur une montagne, Jésus fut transfiguré dans une lumière éblouissante devant Pierre, Jacques et Jean — un aperçu de la gloire avant la croix.',
  },
  '08-15': {
    name: 'The Assumption',
    nameFr: 'L\'Assomption',
    description: 'The Church celebrates Mary\'s being taken body and soul into heaven — the first to share fully in Christ\'s resurrection.',
    descriptionFr: 'L\'Église célèbre l\'enlèvement de Marie corps et âme au ciel — la première à partager pleinement la résurrection du Christ.',
  },
  '09-14': {
    name: 'Exaltation of the Holy Cross',
    nameFr: 'Exaltation de la Sainte Croix',
    description: 'The cross, once an instrument of shame, is lifted up as the sign of God\'s love and victory over death.',
    descriptionFr: 'La croix, autrefois instrument de honte, est élevée comme signe de l\'amour de Dieu et de sa victoire sur la mort.',
  },
  '11-01': {
    name: 'All Saints\' Day',
    nameFr: 'La Toussaint',
    description: 'A celebration of all the holy ones — known and unknown — who have gone before us. We are surrounded by a great cloud of witnesses.',
    descriptionFr: 'Une célébration de tous les saints — connus et inconnus — qui nous ont précédés. Nous sommes entourés d\'une grande nuée de témoins.',
  },
  '11-02': {
    name: 'All Souls\' Day',
    nameFr: 'Commémoration des fidèles défunts',
    description: 'A day to remember and pray for all who have died. Love does not end at the grave.',
    descriptionFr: 'Un jour pour se souvenir et prier pour tous les défunts. L\'amour ne s\'arrête pas à la tombe.',
  },
  '12-08': {
    name: 'Immaculate Conception',
    nameFr: 'Immaculée Conception',
    description: 'The Church celebrates Mary being conceived without sin — prepared from the beginning to bear the Word made flesh.',
    descriptionFr: 'L\'Église célèbre Marie conçue sans péché — préparée dès le commencement pour porter le Verbe fait chair.',
  },
  '12-24': {
    name: 'Christmas Eve',
    nameFr: 'Veille de Noël',
    description: 'The waiting is almost over. Tonight, heaven touches earth — the Word becomes flesh and dwells among us.',
    descriptionFr: 'L\'attente est presque terminée. Ce soir, le ciel touche la terre — le Verbe se fait chair et demeure parmi nous.',
  },
  '12-25': {
    name: 'Christmas Day',
    nameFr: 'Noël',
    description: '"For unto you is born this day in the city of David a Saviour." God enters history as a child. Emmanuel — God with us.',
    descriptionFr: '« Aujourd\'hui, dans la ville de David, il vous est né un Sauveur. » Dieu entre dans l\'histoire comme un enfant. Emmanuel — Dieu avec nous.',
  },
  '12-26': {
    name: 'Feast of Saint Stephen',
    nameFr: 'Saint Étienne',
    description: 'The first Christian martyr, stoned to death while praying for his persecutors — following Christ to the very end, the day after Christmas.',
    descriptionFr: 'Le premier martyr chrétien, lapidé à mort en priant pour ses persécuteurs — suivant le Christ jusqu\'au bout, le lendemain de Noël.',
  },
  '12-31': {
    name: 'Year\'s End',
    nameFr: 'Fin d\'année',
    description: '"Teach us to number our days, that we may gain a heart of wisdom." A threshold moment between what was and what will be.',
    descriptionFr: '« Enseigne-nous à bien compter nos jours, afin que nous appliquions notre cœur à la sagesse. » Un seuil entre ce qui fut et ce qui sera.',
  },
}

// ─── Easter-relative events ───────────────────────────────

interface MovableEvent {
  offset: number // days from Easter Sunday
  name: string
  nameFr: string
  description: string
  descriptionFr: string
}

const MOVABLE_EVENTS: MovableEvent[] = [
  {
    offset: -46,
    name: 'Ash Wednesday',
    nameFr: 'Mercredi des Cendres',
    description: '"Remember that you are dust, and to dust you shall return." Lent begins — forty days of turning back to God.',
    descriptionFr: '« Souviens-toi que tu es poussière, et que tu retourneras en poussière. » Le Carême commence — quarante jours de retour vers Dieu.',
  },
  {
    offset: -7,
    name: 'Palm Sunday',
    nameFr: 'Dimanche des Rameaux',
    description: 'Jesus enters Jerusalem to shouts of "Hosanna!" — but by Friday, the crowd will shout "Crucify!" Holy Week begins.',
    descriptionFr: 'Jésus entre à Jérusalem aux cris de « Hosanna ! » — mais vendredi, la foule criera « Crucifie-le ! » La Semaine Sainte commence.',
  },
  {
    offset: -6,
    name: 'Holy Monday',
    nameFr: 'Lundi Saint',
    description: 'Jesus cleanses the Temple and curses the fig tree. The tension in Jerusalem builds as the authorities plot against him.',
    descriptionFr: 'Jésus purifie le Temple et maudit le figuier. La tension monte à Jérusalem alors que les autorités complotent contre lui.',
  },
  {
    offset: -5,
    name: 'Holy Tuesday',
    nameFr: 'Mardi Saint',
    description: 'Jesus teaches in the Temple — parables of judgment and mercy. His last public teaching before the Passion.',
    descriptionFr: 'Jésus enseigne au Temple — paraboles de jugement et de miséricorde. Son dernier enseignement public avant la Passion.',
  },
  {
    offset: -4,
    name: 'Holy Wednesday',
    nameFr: 'Mercredi Saint',
    description: 'Also called Spy Wednesday — Judas agrees to betray Jesus for thirty pieces of silver. A day of silence before the storm.',
    descriptionFr: 'Aussi appelé Mercredi de la trahison — Judas accepte de trahir Jésus pour trente pièces d\'argent. Un jour de silence avant la tempête.',
  },
  {
    offset: -3,
    name: 'Holy Thursday',
    nameFr: 'Jeudi Saint',
    description: 'The Last Supper. Jesus washes the disciples\' feet, institutes the Eucharist, and prays in Gethsemane. "Could you not watch one hour?"',
    descriptionFr: 'La Cène. Jésus lave les pieds des disciples, institue l\'Eucharistie et prie à Gethsémani. « Vous n\'avez pas pu veiller une heure ? »',
  },
  {
    offset: -2,
    name: 'Good Friday',
    nameFr: 'Vendredi Saint',
    description: 'The crucifixion. Jesus carries the cross, is nailed to it, and dies at three in the afternoon. "It is finished."',
    descriptionFr: 'La crucifixion. Jésus porte la croix, y est cloué et meurt à trois heures de l\'après-midi. « Tout est accompli. »',
  },
  {
    offset: -1,
    name: 'Holy Saturday',
    nameFr: 'Samedi Saint',
    description: 'The great silence. Christ lies in the tomb. The world holds its breath between death and resurrection. The only day without a liturgy.',
    descriptionFr: 'Le grand silence. Le Christ repose au tombeau. Le monde retient son souffle entre la mort et la résurrection. Le seul jour sans liturgie.',
  },
  {
    offset: 0,
    name: 'Easter Sunday',
    nameFr: 'Dimanche de Pâques',
    description: 'He is risen! The stone is rolled away, the tomb is empty. Death has been defeated — the heart of the Christian faith.',
    descriptionFr: 'Il est ressuscité ! La pierre est roulée, le tombeau est vide. La mort est vaincue — le cœur de la foi chrétienne.',
  },
  {
    offset: 1,
    name: 'Easter Monday',
    nameFr: 'Lundi de Pâques',
    description: 'The joy of the resurrection overflows. The disciples on the road to Emmaus recognize the risen Lord in the breaking of bread.',
    descriptionFr: 'La joie de la résurrection déborde. Les disciples sur la route d\'Emmaüs reconnaissent le Seigneur ressuscité dans la fraction du pain.',
  },
  {
    offset: 39,
    name: 'Ascension',
    nameFr: 'Ascension',
    description: 'Forty days after Easter, Jesus ascends to the Father. "I am with you always, to the end of the age." He goes to prepare a place.',
    descriptionFr: 'Quarante jours après Pâques, Jésus monte vers le Père. « Je suis avec vous tous les jours, jusqu\'à la fin du monde. » Il part préparer une place.',
  },
  {
    offset: 49,
    name: 'Pentecost',
    nameFr: 'Pentecôte',
    description: 'The Holy Spirit descends like tongues of fire. The Church is born — ordinary people empowered to change the world.',
    descriptionFr: 'L\'Esprit Saint descend comme des langues de feu. L\'Église est née — des gens ordinaires habilités à changer le monde.',
  },
  {
    offset: 56,
    name: 'Trinity Sunday',
    nameFr: 'Dimanche de la Trinité',
    description: 'The Sunday after Pentecost — the Church contemplates the mystery of God as Father, Son, and Holy Spirit. Three persons, one love.',
    descriptionFr: 'Le dimanche après la Pentecôte — l\'Église contemple le mystère de Dieu comme Père, Fils et Saint-Esprit. Trois personnes, un seul amour.',
  },
  {
    offset: 60,
    name: 'Corpus Christi',
    nameFr: 'Fête-Dieu',
    description: 'The Body and Blood of Christ — a feast celebrating the real presence of Christ in the Eucharist, carried in procession through the streets.',
    descriptionFr: 'Le Corps et le Sang du Christ — une fête célébrant la présence réelle du Christ dans l\'Eucharistie, porté en procession dans les rues.',
  },
]

// ─── Season detection ─────────────────────────────────────

interface SeasonInfo {
  name: string
  nameFr: string
  description: string
  descriptionFr: string
  dayInSeason: number
  totalDays: number
}

function detectSeason(today: Date, easter: Date): SeasonInfo | null {
  const diff = daysBetween(easter, today)
  const year = today.getFullYear()
  const month = today.getMonth()
  const day = today.getDate()

  // Advent: first Sunday on or after Nov 27 through Dec 23
  const dec25 = new Date(year, 11, 25)
  const adventStart = new Date(year, 10, 27) // Nov 27 earliest possible
  // Find first Sunday >= Nov 27
  while (adventStart.getDay() !== 0) adventStart.setDate(adventStart.getDate() + 1)
  const dec23 = new Date(year, 11, 23)
  if (today >= adventStart && today <= dec23) {
    const dayIn = daysBetween(adventStart, today) + 1
    const total = daysBetween(adventStart, dec23) + 1
    return {
      name: 'Advent',
      nameFr: 'Avent',
      description: `The Church waits and prepares for the coming of Christ. A season of hope, longing, and joyful anticipation — ${total - dayIn} days until Christmas.`,
      descriptionFr: `L'Église attend et se prépare à la venue du Christ. Un temps d'espérance, d'attente et de joyeuse anticipation — ${total - dayIn} jours avant Noël.`,
      dayInSeason: dayIn,
      totalDays: total,
    }
  }

  // Christmas season: Dec 25 – Jan 5 (or Jan 6 is Epiphany)
  if ((month === 11 && day >= 25) || (month === 0 && day <= 5)) {
    const christmasDay = month === 0 ? new Date(year - 1, 11, 25) : dec25
    const dayIn = daysBetween(christmasDay, today) + 1
    return {
      name: 'Christmas Season',
      nameFr: 'Temps de Noël',
      description: 'The Word became flesh and dwells among us. The Church celebrates the incarnation — God entering our world as a child.',
      descriptionFr: 'Le Verbe s\'est fait chair et demeure parmi nous. L\'Église célèbre l\'incarnation — Dieu entrant dans notre monde comme un enfant.',
      dayInSeason: dayIn,
      totalDays: 12,
    }
  }

  // Lent: Ash Wednesday (Easter - 46) to Easter - 1
  const ashWednesday = addDays(easter, -46)
  const holySaturday = addDays(easter, -1)
  if (today >= ashWednesday && today <= holySaturday) {
    const dayIn = daysBetween(ashWednesday, today) + 1
    const daysToEaster = daysBetween(today, easter)
    return {
      name: 'Lent',
      nameFr: 'Carême',
      description: `Forty days of preparation before Easter. A season of repentance, fasting, and returning to God — ${daysToEaster} days until Easter.`,
      descriptionFr: `Quarante jours de préparation avant Pâques. Un temps de repentance, de jeûne et de retour vers Dieu — ${daysToEaster} jours avant Pâques.`,
      dayInSeason: dayIn,
      totalDays: 46,
    }
  }

  // Easter season: Easter Sunday to Pentecost (Easter + 49)
  if (diff >= 0 && diff <= 49) {
    return {
      name: 'Easter Season',
      nameFr: 'Temps pascal',
      description: 'Christ is risen! The Church celebrates fifty days of resurrection joy — from the empty tomb to the gift of the Spirit at Pentecost.',
      descriptionFr: 'Le Christ est ressuscité ! L\'Église célèbre cinquante jours de joie pascale — du tombeau vide au don de l\'Esprit à la Pentecôte.',
      dayInSeason: diff + 1,
      totalDays: 50,
    }
  }

  return null // Ordinary Time
}

// ─── Upcoming event finder ────────────────────────────────

function findUpcoming(today: Date): UpcomingEvent | undefined {
  const year = today.getFullYear()
  const candidates: { date: Date; name: string; nameFr: string; brief: string; briefFr: string }[] = []

  // Check fixed feasts in current year and next year's Jan
  for (const [key, feast] of Object.entries(FIXED_FEASTS)) {
    const [m, d] = key.split('-').map(Number)
    const dateThisYear = new Date(year, m - 1, d)
    const dateNextYear = new Date(year + 1, m - 1, d)
    if (dateThisYear > today) {
      candidates.push({ date: dateThisYear, name: feast.name, nameFr: feast.nameFr, brief: feast.description, briefFr: feast.descriptionFr })
    }
    if (dateNextYear > today) {
      candidates.push({ date: dateNextYear, name: feast.name, nameFr: feast.nameFr, brief: feast.description, briefFr: feast.descriptionFr })
    }
  }

  // Check movable events for current year and next
  for (const yr of [year, year + 1]) {
    const easter = computeEaster(yr)
    for (const evt of MOVABLE_EVENTS) {
      const d = addDays(easter, evt.offset)
      if (d > today) {
        candidates.push({ date: d, name: evt.name, nameFr: evt.nameFr, brief: evt.description, briefFr: evt.descriptionFr })
      }
    }
    // Advent start
    const adventStart = new Date(yr, 10, 27)
    while (adventStart.getDay() !== 0) adventStart.setDate(adventStart.getDate() + 1)
    if (adventStart > today) {
      candidates.push({
        date: adventStart,
        name: 'First Sunday of Advent',
        nameFr: 'Premier dimanche de l\'Avent',
        brief: 'The liturgical year begins again. The Church enters a season of waiting and hope, preparing for the coming of Christ.',
        briefFr: 'L\'année liturgique recommence. L\'Église entre dans un temps d\'attente et d\'espérance, se préparant à la venue du Christ.',
      })
    }
  }

  // Sort by date, pick closest
  candidates.sort((a, b) => a.date.getTime() - b.date.getTime())

  // Return the first upcoming that is at least notable (skip if > 90 days away and not a major feast)
  const MAJOR_FEASTS = new Set([
    'Easter Sunday', 'Christmas Day', 'Pentecost', 'Ash Wednesday',
    'Good Friday', 'Ascension', 'First Sunday of Advent', 'All Saints\' Day',
    'Epiphany', 'Palm Sunday',
  ])

  for (const c of candidates) {
    const daysUntil = daysBetween(today, c.date)
    if (daysUntil <= 0) continue
    // Show any event within 30 days, or major events within 90 days
    if (daysUntil <= 30 || (daysUntil <= 90 && MAJOR_FEASTS.has(c.name))) {
      return {
        name: c.name,
        nameFr: c.nameFr,
        daysUntil,
        brief: c.brief,
        briefFr: c.briefFr,
      }
    }
  }

  return undefined
}

// ─── Main export ──────────────────────────────────────────

export function getLiturgicalContext(date: Date = new Date()): LiturgicalContext {
  const today = startOfDay(date)
  const year = today.getFullYear()
  const easter = computeEaster(year)
  const key = mmdd(today)

  // 1. Check if today is a specific movable event (exact day match)
  const diff = daysBetween(easter, today)
  const movableToday = MOVABLE_EVENTS.find((e) => e.offset === diff)
  if (movableToday) {
    return {
      current: {
        name: movableToday.name,
        nameFr: movableToday.nameFr,
        description: movableToday.description,
        descriptionFr: movableToday.descriptionFr,
      },
      upcoming: findUpcoming(today),
    }
  }

  // 2. Check fixed feast days
  const fixedToday = FIXED_FEASTS[key]
  if (fixedToday) {
    return {
      current: {
        name: fixedToday.name,
        nameFr: fixedToday.nameFr,
        description: fixedToday.description,
        descriptionFr: fixedToday.descriptionFr,
      },
      upcoming: findUpcoming(today),
    }
  }

  // 3. Check liturgical season
  const season = detectSeason(today, easter)
  if (season) {
    return {
      current: {
        name: season.name,
        nameFr: season.nameFr,
        description: season.description,
        descriptionFr: season.descriptionFr,
      },
      seasonDay: season.dayInSeason,
      seasonTotal: season.totalDays,
      upcoming: findUpcoming(today),
    }
  }

  // 4. Ordinary Time
  return {
    current: {
      name: 'Ordinary Time',
      nameFr: 'Temps ordinaire',
      description: 'The Church reads through Scripture day by day, deepening our knowledge of God\'s story from creation to the early Church.',
      descriptionFr: 'L\'Église parcourt les Écritures jour après jour, approfondissant notre connaissance de l\'histoire de Dieu, de la création à l\'Église primitive.',
    },
    upcoming: findUpcoming(today),
  }
}
