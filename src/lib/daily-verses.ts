/**
 * Curated daily verses organized by liturgical season.
 * Uses getDailyReading() from the lectionary to determine the current season,
 * then picks a verse appropriate to that season using day-of-year modulo.
 */

import { getDailyReading } from '@/lib/lectionary'

export interface DailyVerse {
  textEn: string
  textFr: string
  reference: string
  referenceFr: string
}

// ─── Advent: prophecy, hope, longing ────────────────────────────────

const ADVENT_VERSES: DailyVerse[] = [
  {
    textEn: 'The people walking in darkness have seen a great light; on those living in the land of deep darkness a light has dawned.',
    textFr: 'Le peuple qui marchait dans les ténèbres a vu une grande lumière ; sur ceux qui habitaient le pays de l\'ombre de la mort, une lumière a resplendi.',
    reference: 'Isaiah 9:2',
    referenceFr: 'Ésaïe 9:1',
  },
  {
    textEn: 'For to us a child is born, to us a son is given, and the government will be on his shoulders.',
    textFr: 'Car un enfant nous est né, un fils nous est donné, et la domination reposera sur son épaule.',
    reference: 'Isaiah 9:6',
    referenceFr: 'Ésaïe 9:5',
  },
  {
    textEn: 'A shoot will come up from the stump of Jesse; from his roots a Branch will bear fruit.',
    textFr: 'Puis un rameau sortira du tronc d\'Isaï, et un rejeton naîtra de ses racines.',
    reference: 'Isaiah 11:1',
    referenceFr: 'Ésaïe 11:1',
  },
  {
    textEn: 'Therefore the Lord himself will give you a sign: The virgin will conceive and give birth to a son, and will call him Immanuel.',
    textFr: 'C\'est pourquoi le Seigneur lui-même vous donnera un signe : la vierge concevra et enfantera un fils, et on l\'appellera Emmanuel.',
    reference: 'Isaiah 7:14',
    referenceFr: 'Ésaïe 7:14',
  },
  {
    textEn: 'Comfort, comfort my people, says your God. Speak tenderly to Jerusalem.',
    textFr: 'Consolez, consolez mon peuple, dit votre Dieu. Parlez au cœur de Jérusalem.',
    reference: 'Isaiah 40:1-2',
    referenceFr: 'Ésaïe 40:1-2',
  },
  {
    textEn: 'A voice of one calling: In the wilderness prepare the way for the Lord; make straight in the desert a highway for our God.',
    textFr: 'Une voix crie dans le désert : Préparez le chemin de l\'Éternel, aplanissez dans les lieux arides une route pour notre Dieu.',
    reference: 'Isaiah 40:3',
    referenceFr: 'Ésaïe 40:3',
  },
  {
    textEn: 'But you, Bethlehem Ephrathah, though you are small among the clans of Judah, out of you will come for me one who will be ruler over Israel.',
    textFr: 'Et toi, Bethléhem Éphrata, petite entre les milliers de Juda, de toi sortira pour moi celui qui dominera sur Israël.',
    reference: 'Micah 5:2',
    referenceFr: 'Michée 5:1',
  },
  {
    textEn: 'My soul magnifies the Lord, and my spirit rejoices in God my Savior.',
    textFr: 'Mon âme exalte le Seigneur, et mon esprit se réjouit en Dieu, mon Sauveur.',
    reference: 'Luke 1:46-47',
    referenceFr: 'Luc 1:46-47',
  },
  {
    textEn: 'He has brought down rulers from their thrones but has lifted up the humble.',
    textFr: 'Il a renversé les puissants de leurs trônes, et il a élevé les humbles.',
    reference: 'Luke 1:52',
    referenceFr: 'Luc 1:52',
  },
  {
    textEn: 'The desert and the parched land will be glad; the wilderness will rejoice and blossom.',
    textFr: 'Le désert et le pays aride se réjouiront ; la solitude s\'égaiera et fleurira.',
    reference: 'Isaiah 35:1',
    referenceFr: 'Ésaïe 35:1',
  },
]

// ─── Christmas: incarnation, nativity ───────────────────────────────

const CHRISTMAS_VERSES: DailyVerse[] = [
  {
    textEn: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    textFr: 'Car Dieu a tant aimé le monde qu\'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu\'il ait la vie éternelle.',
    reference: 'John 3:16',
    referenceFr: 'Jean 3:16',
  },
  {
    textEn: 'The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son.',
    textFr: 'Et la Parole a été faite chair, et elle a habité parmi nous, pleine de grâce et de vérité.',
    reference: 'John 1:14',
    referenceFr: 'Jean 1:14',
  },
  {
    textEn: 'Today in the town of David a Savior has been born to you; he is the Messiah, the Lord.',
    textFr: 'C\'est qu\'aujourd\'hui, dans la ville de David, il vous est né un Sauveur, qui est le Christ, le Seigneur.',
    reference: 'Luke 2:11',
    referenceFr: 'Luc 2:11',
  },
  {
    textEn: 'Glory to God in the highest heaven, and on earth peace to those on whom his favor rests.',
    textFr: 'Gloire à Dieu dans les lieux très hauts, et paix sur la terre parmi les hommes qu\'il agrée.',
    reference: 'Luke 2:14',
    referenceFr: 'Luc 2:14',
  },
  {
    textEn: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    textFr: 'Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu.',
    reference: 'John 1:1',
    referenceFr: 'Jean 1:1',
  },
  {
    textEn: 'The true light that gives light to everyone was coming into the world.',
    textFr: 'Cette lumière était la véritable lumière, qui, en venant dans le monde, éclaire tout homme.',
    reference: 'John 1:9',
    referenceFr: 'Jean 1:9',
  },
]

// ─── Lent: repentance, the cross, lament ────────────────────────────

const LENT_VERSES: DailyVerse[] = [
  {
    textEn: 'Create in me a pure heart, O God, and renew a steadfast spirit within me.',
    textFr: 'O Dieu, crée en moi un cœur pur, renouvelle en moi un esprit bien disposé.',
    reference: 'Psalm 51:10',
    referenceFr: 'Psaume 51:12',
  },
  {
    textEn: 'He was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him.',
    textFr: 'Il était blessé pour nos péchés, brisé pour nos iniquités ; le châtiment qui nous donne la paix est tombé sur lui.',
    reference: 'Isaiah 53:5',
    referenceFr: 'Ésaïe 53:5',
  },
  {
    textEn: 'As far as the east is from the west, so far has he removed our transgressions from us.',
    textFr: 'Autant l\'orient est éloigné de l\'occident, autant il éloigne de nous nos transgressions.',
    reference: 'Psalm 103:12',
    referenceFr: 'Psaume 103:12',
  },
  {
    textEn: 'Rend your heart and not your garments. Return to the Lord your God, for he is gracious and compassionate.',
    textFr: 'Déchirez vos cœurs et non vos vêtements, et revenez à l\'Éternel, votre Dieu ; car il est compatissant et miséricordieux.',
    reference: 'Joel 2:13',
    referenceFr: 'Joël 2:13',
  },
  {
    textEn: 'Out of the depths I cry to you, Lord; Lord, hear my voice.',
    textFr: 'Du fond de l\'abîme je t\'invoque, ô Éternel ! Seigneur, écoute ma voix !',
    reference: 'Psalm 130:1-2',
    referenceFr: 'Psaume 130:1-2',
  },
  {
    textEn: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.',
    textFr: 'Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.',
    reference: '1 John 1:9',
    referenceFr: '1 Jean 1:9',
  },
  {
    textEn: 'Who is a God like you, who pardons sin and forgives the transgression of the remnant of his inheritance?',
    textFr: 'Quel Dieu est semblable à toi, qui pardonnes l\'iniquité, qui oublies les péchés du reste de ton héritage ?',
    reference: 'Micah 7:18',
    referenceFr: 'Michée 7:18',
  },
  {
    textEn: 'My God, my God, why have you forsaken me? Why are you so far from saving me?',
    textFr: 'Mon Dieu ! Mon Dieu ! Pourquoi m\'as-tu abandonné, et t\'éloignes-tu sans me secourir ?',
    reference: 'Psalm 22:1',
    referenceFr: 'Psaume 22:2',
  },
  {
    textEn: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
    textFr: 'L\'Éternel est près de ceux qui ont le cœur brisé, et il sauve ceux qui ont l\'esprit dans l\'abattement.',
    reference: 'Psalm 34:18',
    referenceFr: 'Psaume 34:19',
  },
  {
    textEn: 'For we do not have a high priest who is unable to empathize with our weaknesses, but we have one who has been tempted in every way, just as we are.',
    textFr: 'Car nous n\'avons pas un souverain sacrificateur qui ne puisse compatir à nos faiblesses ; au contraire, il a été tenté comme nous en toutes choses.',
    reference: 'Hebrews 4:15',
    referenceFr: 'Hébreux 4:15',
  },
]

// ─── Easter: resurrection, new life ─────────────────────────────────

const EASTER_VERSES: DailyVerse[] = [
  {
    textEn: 'He is not here; he has risen, just as he said.',
    textFr: 'Il n\'est point ici ; il est ressuscité, comme il l\'avait dit.',
    reference: 'Matthew 28:6',
    referenceFr: 'Matthieu 28:6',
  },
  {
    textEn: 'I am the resurrection and the life. The one who believes in me will live, even though they die.',
    textFr: 'Je suis la résurrection et la vie. Celui qui croit en moi vivra, quand même il serait mort.',
    reference: 'John 11:25',
    referenceFr: 'Jean 11:25',
  },
  {
    textEn: 'Death has been swallowed up in victory. Where, O death, is your victory? Where, O death, is your sting?',
    textFr: 'La mort a été engloutie dans la victoire. O mort, où est ta victoire ? O mort, où est ton aiguillon ?',
    reference: '1 Corinthians 15:54-55',
    referenceFr: '1 Corinthiens 15:54-55',
  },
  {
    textEn: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!',
    textFr: 'Si quelqu\'un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées ; voici, toutes choses sont devenues nouvelles.',
    reference: '2 Corinthians 5:17',
    referenceFr: '2 Corinthiens 5:17',
  },
  {
    textEn: 'Praise be to the God and Father of our Lord Jesus Christ! In his great mercy he has given us new birth into a living hope through the resurrection.',
    textFr: 'Béni soit Dieu, le Père de notre Seigneur Jésus-Christ, qui, selon sa grande miséricorde, nous a régénérés, pour une espérance vivante, par la résurrection.',
    reference: '1 Peter 1:3',
    referenceFr: '1 Pierre 1:3',
  },
  {
    textEn: 'I have been crucified with Christ and I no longer live, but Christ lives in me.',
    textFr: 'J\'ai été crucifié avec Christ ; et si je vis, ce n\'est plus moi qui vis, c\'est Christ qui vit en moi.',
    reference: 'Galatians 2:20',
    referenceFr: 'Galates 2:20',
  },
  {
    textEn: 'He has risen from the dead and is going ahead of you into Galilee. There you will see him.',
    textFr: 'Il est ressuscité des morts, et il vous précède en Galilée : c\'est là que vous le verrez.',
    reference: 'Matthew 28:7',
    referenceFr: 'Matthieu 28:7',
  },
  {
    textEn: 'Peace be with you! As the Father has sent me, I am sending you.',
    textFr: 'La paix soit avec vous ! Comme le Père m\'a envoyé, moi aussi je vous envoie.',
    reference: 'John 20:21',
    referenceFr: 'Jean 20:21',
  },
  {
    textEn: 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses.',
    textFr: 'Mais vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins.',
    reference: 'Acts 1:8',
    referenceFr: 'Actes 1:8',
  },
  {
    textEn: 'God raised him from the dead, freeing him from the agony of death, because it was impossible for death to keep its hold on him.',
    textFr: 'Dieu l\'a ressuscité, en le délivrant des liens de la mort, parce qu\'il n\'était pas possible qu\'il soit retenu par elle.',
    reference: 'Acts 2:24',
    referenceFr: 'Actes 2:24',
  },
]

// ─── Ordinary Time: greatest hits across Scripture ──────────────────

const ORDINARY_VERSES: DailyVerse[] = [
  {
    textEn: 'The Lord is my shepherd, I lack nothing.',
    textFr: 'L\'Éternel est mon berger : je ne manquerai de rien.',
    reference: 'Psalm 23:1',
    referenceFr: 'Psaume 23:1',
  },
  {
    textEn: 'Trust in the Lord with all your heart and lean not on your own understanding.',
    textFr: 'Confie-toi en l\'Éternel de tout ton cœur, et ne t\'appuie pas sur ta sagesse.',
    reference: 'Proverbs 3:5',
    referenceFr: 'Proverbes 3:5',
  },
  {
    textEn: 'Be still, and know that I am God.',
    textFr: 'Arrêtez, et sachez que je suis Dieu.',
    reference: 'Psalm 46:10',
    referenceFr: 'Psaume 46:11',
  },
  {
    textEn: 'The Lord is my light and my salvation — whom shall I fear?',
    textFr: 'L\'Éternel est ma lumière et mon salut : de qui aurais-je crainte ?',
    reference: 'Psalm 27:1',
    referenceFr: 'Psaume 27:1',
  },
  {
    textEn: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    textFr: 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.',
    reference: 'Matthew 11:28',
    referenceFr: 'Matthieu 11:28',
  },
  {
    textEn: 'I can do all this through him who gives me strength.',
    textFr: 'Je puis tout par celui qui me fortifie.',
    reference: 'Philippians 4:13',
    referenceFr: 'Philippiens 4:13',
  },
  {
    textEn: 'And we know that in all things God works for the good of those who love him.',
    textFr: 'Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu.',
    reference: 'Romans 8:28',
    referenceFr: 'Romains 8:28',
  },
  {
    textEn: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles.',
    textFr: 'Ceux qui se confient en l\'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.',
    reference: 'Isaiah 40:31',
    referenceFr: 'Ésaïe 40:31',
  },
  {
    textEn: 'The heavens declare the glory of God; the skies proclaim the work of his hands.',
    textFr: 'Les cieux racontent la gloire de Dieu, et l\'étendue manifeste l\'œuvre de ses mains.',
    reference: 'Psalm 19:1',
    referenceFr: 'Psaume 19:2',
  },
  {
    textEn: 'Fear not, for I am with you; be not dismayed, for I am your God.',
    textFr: 'Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu.',
    reference: 'Isaiah 41:10',
    referenceFr: 'Ésaïe 41:10',
  },
  {
    textEn: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.',
    textFr: 'On t\'a fait connaître, ô homme, ce qui est bien ; et ce que l\'Éternel demande de toi, c\'est que tu pratiques la justice, que tu aimes la miséricorde, et que tu marches humblement avec ton Dieu.',
    reference: 'Micah 6:8',
    referenceFr: 'Michée 6:8',
  },
  {
    textEn: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    textFr: 'Car je connais les projets que j\'ai formés sur vous, dit l\'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l\'espérance.',
    reference: 'Jeremiah 29:11',
    referenceFr: 'Jérémie 29:11',
  },
  {
    textEn: 'I lift up my eyes to the mountains — where does my help come from? My help comes from the Lord, the Maker of heaven and earth.',
    textFr: 'Je lève mes yeux vers les montagnes... D\'où me viendra le secours ? Mon secours vient de l\'Éternel, qui a fait les cieux et la terre.',
    reference: 'Psalm 121:1-2',
    referenceFr: 'Psaume 121:1-2',
  },
  {
    textEn: 'Blessed is the one who does not walk in step with the wicked, but whose delight is in the law of the Lord.',
    textFr: 'Heureux l\'homme qui ne marche pas selon le conseil des méchants, mais qui trouve son plaisir dans la loi de l\'Éternel.',
    reference: 'Psalm 1:1-2',
    referenceFr: 'Psaume 1:1-2',
  },
  {
    textEn: 'The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
    textFr: 'Le fruit de l\'Esprit, c\'est l\'amour, la joie, la paix, la patience, la bonté, la bienveillance, la fidélité, la douceur, la maîtrise de soi.',
    reference: 'Galatians 5:22-23',
    referenceFr: 'Galates 5:22-23',
  },
  {
    textEn: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    textFr: 'Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.',
    reference: 'Philippians 4:6',
    referenceFr: 'Philippiens 4:6',
  },
  {
    textEn: 'Your word is a lamp for my feet, a light on my path.',
    textFr: 'Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.',
    reference: 'Psalm 119:105',
    referenceFr: 'Psaume 119:105',
  },
  {
    textEn: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.',
    textFr: 'La charité est patiente, elle est pleine de bonté ; la charité n\'est point envieuse ; la charité ne se vante point, elle ne s\'enfle point d\'orgueil.',
    reference: '1 Corinthians 13:4',
    referenceFr: '1 Corinthiens 13:4',
  },
  {
    textEn: 'He who began a good work in you will carry it on to completion until the day of Christ Jesus.',
    textFr: 'Celui qui a commencé en vous cette bonne œuvre la rendra parfaite pour le jour de Jésus-Christ.',
    reference: 'Philippians 1:6',
    referenceFr: 'Philippiens 1:6',
  },
  {
    textEn: 'How good and pleasant it is when God\'s people live together in unity!',
    textFr: 'Voici, oh ! qu\'il est agréable, qu\'il est doux pour des frères de demeurer ensemble !',
    reference: 'Psalm 133:1',
    referenceFr: 'Psaume 133:1',
  },
  {
    textEn: 'In all your ways submit to him, and he will make your paths straight.',
    textFr: 'Reconnais-le dans toutes tes voies, et il aplanira tes sentiers.',
    reference: 'Proverbs 3:6',
    referenceFr: 'Proverbes 3:6',
  },
  {
    textEn: 'For where two or three gather in my name, there am I with them.',
    textFr: 'Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d\'eux.',
    reference: 'Matthew 18:20',
    referenceFr: 'Matthieu 18:20',
  },
  {
    textEn: 'You will seek me and find me when you seek me with all your heart.',
    textFr: 'Vous me chercherez, et vous me trouverez, si vous me cherchez de tout votre cœur.',
    reference: 'Jeremiah 29:13',
    referenceFr: 'Jérémie 29:13',
  },
  {
    textEn: 'The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.',
    textFr: 'Que l\'Éternel te bénisse, et qu\'il te garde ! Que l\'Éternel fasse luire sa face sur toi, et qu\'il t\'accorde sa grâce !',
    reference: 'Numbers 6:24-25',
    referenceFr: 'Nombres 6:24-25',
  },
]

type LiturgicalSeason = 'advent' | 'christmas' | 'lent' | 'easter' | 'ordinary'

function detectSeason(label: string): LiturgicalSeason {
  const l = label.toLowerCase()
  if (l.includes('advent')) return 'advent'
  if (l.includes('christmas') || l.includes('noël') || l.includes('epiphany')) return 'christmas'
  if (l.includes('lent') || l.includes('ash') || l.includes('palm') || l.includes('holy')) return 'lent'
  if (l.includes('easter') || l.includes('pâques')) return 'easter'
  return 'ordinary'
}

const SEASON_POOLS: Record<LiturgicalSeason, DailyVerse[]> = {
  advent: ADVENT_VERSES,
  christmas: CHRISTMAS_VERSES,
  lent: LENT_VERSES,
  easter: EASTER_VERSES,
  ordinary: ORDINARY_VERSES,
}

function getDayOfYear(): number {
  const today = new Date()
  return Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
}

export function getDailyVerse(): DailyVerse {
  const reading = getDailyReading(new Date())
  const season = detectSeason(reading.label)
  const pool = SEASON_POOLS[season]
  const dayOfYear = getDayOfYear()
  return pool[dayOfYear % pool.length]
}
