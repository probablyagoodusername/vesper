/**
 * Rich liturgical lore for each event and season.
 * Keyed by the English event name from liturgical-context.ts.
 * Each entry provides deep cultural, theological, and practical content
 * with special attention to French traditions.
 */

export interface LoreSection {
  en: string
  fr: string
}

export interface ScriptureRef {
  ref: string
  refFr: string
}

export interface LiturgicalLore {
  origin: LoreSection
  theology: LoreSection
  france: LoreSection
  practice: LoreSection
  scripture: ScriptureRef[]
}

const LORE: Record<string, LiturgicalLore> = {

  // ─── MOVABLE EVENTS (Easter-relative) ────────────────────

  'Ash Wednesday': {
    origin: {
      en: 'Ash Wednesday marks the beginning of Lent, the 40-day season of repentance before Easter. The practice of marking foreheads with ashes dates to the early medieval Church, drawing on the ancient Jewish custom of wearing sackcloth and ashes as signs of mourning and penance. By the 10th century, the rite was universal in the Western Church. The ashes are made by burning the blessed palm branches from the previous year\'s Palm Sunday — a powerful symbol of how triumph fades and all things return to dust.',
      fr: 'Le Mercredi des Cendres marque le début du Carême, période de 40 jours de pénitence avant Pâques. La pratique de marquer le front avec des cendres remonte au haut Moyen Âge, s\'inspirant de la coutume juive ancienne de porter le sac et la cendre en signe de deuil et de pénitence. Au Xe siècle, le rite était universel dans l\'Église d\'Occident. Les cendres proviennent des rameaux bénits de l\'année précédente, brûlés pour l\'occasion — un symbole puissant de la manière dont le triomphe s\'efface et toute chose retourne à la poussière.',
    },
    theology: {
      en: 'The words spoken during the imposition of ashes — "Remember that you are dust, and to dust you shall return" (Genesis 3:19) — are among the most stark in Christian liturgy. They strip away every pretension and remind us of our mortality. But this is not despair: it is an invitation to authenticity. Lent asks: if your days are numbered, what matters most? The 40 days echo Jesus\' 40 days in the desert, Moses\' 40 days on Sinai, and Israel\'s 40 years of wandering. It is a threshold time — uncomfortable, clarifying, ultimately liberating.',
      fr: 'Les paroles prononcées lors de l\'imposition des cendres — « Souviens-toi que tu es poussière, et que tu retourneras en poussière » (Genèse 3, 19) — comptent parmi les plus directes de la liturgie chrétienne. Elles dépouillent toute prétention et nous rappellent notre mortalité. Mais ce n\'est pas du désespoir : c\'est une invitation à l\'authenticité. Le Carême demande : si tes jours sont comptés, qu\'est-ce qui compte vraiment ? Les 40 jours font écho aux 40 jours de Jésus au désert, aux 40 jours de Moïse au Sinaï, et aux 40 ans d\'errance d\'Israël. C\'est un temps de seuil — inconfortable, clarifiant, ultimement libérateur.',
    },
    france: {
      en: 'In France, Ash Wednesday (Mercredi des Cendres) falls the day after Mardi Gras — literally "Fat Tuesday" — when the last rich foods are eaten before the Lenten fast. The contrast is deliberately dramatic: yesterday\'s carnival revelry gives way to today\'s sobriety. Traditionally, French Catholics observe strict fasting (one full meal, two light collations) and abstinence from meat. In many parishes, the burned rameaux (boxwood branches) from the previous Palm Sunday are used to make the ashes. The ceremony is one of the most attended of the year, even among non-practicing Catholics. In Provence, the tradition of the "aïoli monstre" — a grand communal meal of cod and vegetables with aïoli — often takes place on the Friday following, as a festive way to begin meatless Fridays.',
      fr: 'En France, le Mercredi des Cendres tombe le lendemain du Mardi Gras — quand les derniers aliments riches sont consommés avant le jeûne du Carême. Le contraste est volontairement dramatique : les réjouissances du carnaval laissent place à la sobriété. Traditionnellement, les catholiques français observent un jeûne strict (un repas complet, deux collations légères) et l\'abstinence de viande. Dans de nombreuses paroisses, les rameaux de buis bénits de l\'année précédente sont brûlés pour fabriquer les cendres. La cérémonie est l\'une des plus fréquentées de l\'année, même par les catholiques non-pratiquants. En Provence, la tradition de l\'« aïoli monstre » — un grand repas communautaire de morue et légumes avec aïoli — a souvent lieu le vendredi suivant, manière festive de commencer les vendredis sans viande.',
    },
    practice: {
      en: 'Receive the ashes if you can attend Mass today. If not, take a moment of honest self-examination: what weighs you down? What do you need to let go of? Choose one concrete practice for Lent — not as punishment, but as clearing space for God. Traditional options: fasting (simplifying meals), almsgiving (generosity to others), prayer (a daily practice you don\'t yet have). The best Lenten discipline is one that costs you something real.',
      fr: 'Recevez les cendres si vous pouvez assister à la messe aujourd\'hui. Sinon, prenez un moment d\'examen de conscience honnête : qu\'est-ce qui vous pèse ? De quoi avez-vous besoin de vous défaire ? Choisissez une pratique concrète pour le Carême — non comme punition, mais pour faire de la place à Dieu. Options traditionnelles : le jeûne (simplifier les repas), l\'aumône (générosité envers les autres), la prière (une pratique quotidienne que vous n\'avez pas encore). La meilleure discipline de Carême est celle qui vous coûte quelque chose de réel.',
    },
    scripture: [
      { ref: 'Joel 2:12-13', refFr: 'Joël 2, 12-13' },
      { ref: 'Matthew 6:1-6, 16-18', refFr: 'Matthieu 6, 1-6.16-18' },
      { ref: '2 Corinthians 5:20 – 6:2', refFr: '2 Corinthiens 5, 20 – 6, 2' },
    ],
  },

  'Palm Sunday': {
    origin: {
      en: 'Palm Sunday commemorates Jesus\' triumphal entry into Jerusalem, five days before his crucifixion. All four Gospels record the event: Jesus rode a young donkey into the city while crowds laid palm branches and cloaks on the road, shouting "Hosanna to the Son of David!" The palm branches were symbols of victory and kingship in the ancient Near East — the same branches used to celebrate the Maccabean liberation of the Temple centuries earlier. But Jesus chose a donkey, not a war horse. The crowd expected a political liberator; they received a suffering servant. By Friday, many of the same voices would cry "Crucify him."',
      fr: 'Le Dimanche des Rameaux commémore l\'entrée triomphale de Jésus à Jérusalem, cinq jours avant sa crucifixion. Les quatre Évangiles rapportent l\'événement : Jésus entra dans la ville monté sur un ânon tandis que la foule étendait des branches de palmier et des manteaux sur le chemin, criant « Hosanna au Fils de David ! » Les palmes étaient des symboles de victoire et de royauté dans l\'ancien Proche-Orient — les mêmes branches utilisées pour célébrer la libération maccabéenne du Temple des siècles plus tôt. Mais Jésus choisit un âne, non un cheval de guerre. La foule attendait un libérateur politique ; elle reçut un serviteur souffrant. Le vendredi, beaucoup de ces mêmes voix crieraient « Crucifie-le ! »',
    },
    theology: {
      en: 'Palm Sunday holds the central paradox of Christianity in a single day. The liturgy begins with a joyful procession — palms raised, hosannas sung — and ends with the reading of the Passion narrative, the longest Gospel reading of the year. Joy and sorrow woven together. This is not accidental: the Church wants us to feel the whiplash the original crowd felt. Jesus enters as a king, but his throne will be a cross. The palms that welcomed him will wither; the shouts of praise will become cries for blood. Palm Sunday asks: which crowd are you in? And would you stay when the cost becomes clear?',
      fr: 'Le Dimanche des Rameaux contient le paradoxe central du christianisme en une seule journée. La liturgie commence par une procession joyeuse — rameaux levés, hosannas chantés — et se termine par la lecture du récit de la Passion, la plus longue lecture évangélique de l\'année. Joie et douleur entrelacées. Ce n\'est pas un hasard : l\'Église veut nous faire ressentir le choc que la foule originelle a vécu. Jésus entre en roi, mais son trône sera une croix. Les palmes qui l\'accueillent se faneront ; les cris de louange deviendront des cris de sang. Le Dimanche des Rameaux demande : dans quelle foule êtes-vous ? Et resteriez-vous quand le prix deviendra clair ?',
    },
    france: {
      en: 'In France, Palm Sunday is called "Dimanche des Rameaux" (Sunday of the Branches). Since palm trees don\'t grow in most of France, the faithful carry branches of **buis** (boxwood) — and in Provence, olive branches or laurel. These are blessed during Mass in a ceremony that often begins outside the church, with a solemn procession into the nave.\n\nThe blessed branches are taken home and placed behind crucifixes, above doorways, or tucked into the frames of holy images — where they remain until the following year, when they\'re burned to make the ashes for the next Ash Wednesday. In many families, it\'s tradition to visit the cemetery after Mass and place blessed buis on family graves.\n\nIn Toulouse and the southwest, the buis is sometimes woven into small crosses or elaborate "cornets de rameaux" — decorative arrangements that are true folk art. In Brittany and Normandy, farmers would bless their fields and stables with the holy branches to protect crops and livestock.\n\nThe day marks the opening of **la Semaine Sainte** (Holy Week), and in many French towns, the week brings special liturgies each evening. Some parishes still practice the medieval tradition of the "voile de Carême" — a large purple cloth that has hidden the altar cross throughout Lent, building anticipation for its unveiling on Good Friday.',
      fr: 'En France, on célèbre le Dimanche des Rameaux avec des branches de **buis** — et en Provence, d\'olivier ou de laurier — puisque les palmiers ne poussent pas dans la majeure partie du pays. Ces branches sont bénites lors de la messe dans une cérémonie qui commence souvent à l\'extérieur de l\'église, avec une procession solennelle vers la nef.\n\nLes branches bénites sont rapportées à la maison et placées derrière les crucifix, au-dessus des portes, ou glissées dans les cadres des images pieuses — où elles restent jusqu\'à l\'année suivante, quand elles seront brûlées pour fabriquer les cendres du prochain Mercredi des Cendres. Dans beaucoup de familles, c\'est la tradition de visiter le cimetière après la messe et de déposer du buis bénit sur les tombes familiales.\n\nÀ Toulouse et dans le Sud-Ouest, le buis est parfois tressé en petites croix ou en « cornets de rameaux » élaborés — des arrangements décoratifs qui relèvent du véritable art populaire. En Bretagne et en Normandie, les paysans bénissaient leurs champs et leurs étables avec les branches saintes pour protéger les récoltes et le bétail.\n\nCe jour marque l\'ouverture de **la Semaine Sainte**, et dans de nombreuses villes françaises, la semaine apporte des liturgies spéciales chaque soir. Certaines paroisses pratiquent encore la tradition médiévale du « voile de Carême » — un grand drap violet qui a caché la croix de l\'autel tout au long du Carême, créant l\'attente de son dévoilement le Vendredi Saint.',
    },
    practice: {
      en: 'If you attend Mass today, join the procession with your branch — feel the physicality of it. At home, place the blessed branch somewhere visible as a daily reminder of Holy Week. Read the Passion narrative slowly this evening (Matthew 26-27 or Mark 14-15). This week, try to attend at least one weekday service — Holy Thursday and Good Friday are the most profound liturgies of the entire year.',
      fr: 'Si vous assistez à la messe aujourd\'hui, participez à la procession avec votre rameau — ressentez-en la dimension physique. À la maison, placez le rameau bénit quelque part de visible comme rappel quotidien de la Semaine Sainte. Lisez le récit de la Passion lentement ce soir (Matthieu 26-27 ou Marc 14-15). Cette semaine, essayez d\'assister à au moins un office en semaine — le Jeudi Saint et le Vendredi Saint sont les liturgies les plus profondes de toute l\'année.',
    },
    scripture: [
      { ref: 'Matthew 21:1-11', refFr: 'Matthieu 21, 1-11' },
      { ref: 'Mark 11:1-11', refFr: 'Marc 11, 1-11' },
      { ref: 'Zechariah 9:9', refFr: 'Zacharie 9, 9' },
      { ref: 'Psalm 118:25-26', refFr: 'Psaume 118, 25-26' },
    ],
  },

  'Holy Monday': {
    origin: {
      en: 'On Monday of Holy Week, Jesus returned to the Temple in Jerusalem and drove out the merchants and money changers, overturning their tables. "My house shall be called a house of prayer, but you have made it a den of robbers" (Matthew 21:13). He also cursed a fig tree that bore no fruit — a symbolic act that the early Church understood as a warning against religious hypocrisy. The chief priests and scribes, witnessing his authority, began plotting in earnest to destroy him.',
      fr: 'Le Lundi Saint, Jésus retourna au Temple de Jérusalem et chassa les marchands et les changeurs, renversant leurs tables. « Ma maison sera appelée une maison de prière, mais vous en avez fait un repaire de brigands » (Matthieu 21, 13). Il maudit aussi un figuier qui ne portait pas de fruit — un acte symbolique que l\'Église primitive comprit comme un avertissement contre l\'hypocrisie religieuse. Les grands prêtres et les scribes, témoins de son autorité, commencèrent à comploter sérieusement pour le faire périr.',
    },
    theology: {
      en: 'The cleansing of the Temple is one of the few moments where Jesus shows visible anger. It reveals that holiness is not passive — it has edges. The Temple had become a place where the poor were exploited (money changers charged exorbitant rates, and merchants sold sacrificial animals at inflated prices). Jesus\' rage was not about decorum; it was about justice. The fig tree, lush with leaves but bearing no fruit, mirrors the Temple: impressive on the outside, barren where it counts. Holy Monday challenges us: where in our lives do we have beautiful appearances and no substance?',
      fr: 'La purification du Temple est l\'un des rares moments où Jésus montre une colère visible. Elle révèle que la sainteté n\'est pas passive — elle a des arêtes. Le Temple était devenu un lieu où les pauvres étaient exploités (les changeurs pratiquaient des taux exorbitants, les marchands vendaient les animaux sacrificiels à prix gonflés). La colère de Jésus n\'était pas une question de bienséance ; c\'était une question de justice. Le figuier, luxuriant de feuilles mais sans fruit, est le miroir du Temple : impressionnant à l\'extérieur, stérile là où ça compte. Le Lundi Saint nous interpelle : où dans nos vies avons-nous de belles apparences et aucune substance ?',
    },
    france: {
      en: 'In France, Holy Monday begins the series of daily Lenten offices that intensify throughout the week. Many parishes hold evening "Offices des Ténèbres" (Tenebrae) starting this week — an ancient liturgy where candles are extinguished one by one until the church is in near-total darkness, symbolizing the growing shadow over Jerusalem. In some French communities, Holy Monday is also a day of practical preparation: families begin planning the meal for Easter Sunday, and bakers start preparing the dough for traditional "gâteaux de Pâques" (Easter cakes) that vary by region.',
      fr: 'En France, le Lundi Saint ouvre la série d\'offices quotidiens du Carême qui s\'intensifient tout au long de la semaine. Beaucoup de paroisses tiennent des « Offices des Ténèbres » le soir à partir de cette semaine — une liturgie ancienne où les cierges sont éteints un à un jusqu\'à ce que l\'église soit plongée dans une quasi-obscurité totale, symbolisant l\'ombre croissante sur Jérusalem. Dans certaines communautés françaises, le Lundi Saint est aussi un jour de préparation pratique : les familles commencent à planifier le repas du dimanche de Pâques, et les boulangers préparent la pâte des traditionnels « gâteaux de Pâques » qui varient selon les régions.',
    },
    practice: {
      en: 'Today, consider what "tables need overturning" in your own life. Where have convenience or profit crept into spaces that should be sacred? Take 10 minutes to sit in silence and examine one area of your life where appearance and reality don\'t match.',
      fr: 'Aujourd\'hui, considérez quelles « tables doivent être renversées » dans votre propre vie. Où la commodité ou le profit se sont-ils glissés dans des espaces qui devraient être sacrés ? Prenez 10 minutes pour vous asseoir en silence et examiner un domaine de votre vie où l\'apparence et la réalité ne concordent pas.',
    },
    scripture: [
      { ref: 'Matthew 21:12-17', refFr: 'Matthieu 21, 12-17' },
      { ref: 'Mark 11:15-19', refFr: 'Marc 11, 15-19' },
      { ref: 'Isaiah 56:7', refFr: 'Isaïe 56, 7' },
    ],
  },

  'Holy Tuesday': {
    origin: {
      en: 'On Tuesday of Holy Week, Jesus taught publicly in the Temple for the last time. He told the parables of the wicked tenants (Matthew 21:33-46), the wedding feast (Matthew 22:1-14), and the ten bridesmaids (Matthew 25:1-13). He debated with Pharisees and Sadducees on taxes, resurrection, and the greatest commandment. His discourse on the Mount of Olives (Matthew 24-25) warned of the destruction of the Temple and the end of the age. These were his final public words before the Passion.',
      fr: 'Le Mardi Saint, Jésus enseigna publiquement au Temple pour la dernière fois. Il raconta les paraboles des vignerons homicides (Matthieu 21, 33-46), du festin de noces (Matthieu 22, 1-14) et des dix vierges (Matthieu 25, 1-13). Il débattit avec les pharisiens et les sadducéens sur l\'impôt, la résurrection et le plus grand commandement. Son discours sur le Mont des Oliviers (Matthieu 24-25) avertit de la destruction du Temple et de la fin des temps. Ce furent ses dernières paroles publiques avant la Passion.',
    },
    theology: {
      en: 'Holy Tuesday is the day of teaching — Jesus\' last chance to speak to the crowds. His parables all share a theme: the time for decision is now. The bridesmaids who weren\'t ready missed the bridegroom. The tenants who rejected the son were judged. The guest without a wedding garment was cast out. There is an urgency here that the rest of the year can lull us into forgetting. Jesus knew what was coming, and his teaching intensified. The question behind every parable: are you ready?',
      fr: 'Le Mardi Saint est le jour de l\'enseignement — la dernière occasion de Jésus de parler aux foules. Ses paraboles partagent toutes un thème : le temps de la décision, c\'est maintenant. Les vierges qui n\'étaient pas prêtes ont manqué l\'époux. Les vignerons qui ont rejeté le fils ont été jugés. L\'invité sans vêtement de noce a été jeté dehors. Il y a une urgence ici que le reste de l\'année peut nous faire oublier. Jésus savait ce qui allait arriver, et son enseignement s\'est intensifié. La question derrière chaque parabole : êtes-vous prêt ?',
    },
    france: {
      en: 'In French liturgical tradition, Holy Tuesday often features the "Chrism Mass" (Messe Chrismale) in cathedral churches, where the bishop blesses the sacred oils that will be used throughout the year for baptisms, confirmations, ordinations, and the anointing of the sick. Priests from across the diocese gather to renew their vows — a moving display of the Church\'s unity. In some regions, this Mass draws large crowds and is one of the rare occasions when the cathedral is filled to capacity.',
      fr: 'Dans la tradition liturgique française, le Mardi Saint accueille souvent la « Messe Chrismale » dans les cathédrales, où l\'évêque bénit les huiles saintes qui seront utilisées toute l\'année pour les baptêmes, confirmations, ordinations et l\'onction des malades. Les prêtres de tout le diocèse se rassemblent pour renouveler leurs vœux — une démonstration émouvante de l\'unité de l\'Église. Dans certaines régions, cette messe attire de grandes foules et est l\'une des rares occasions où la cathédrale est remplie à pleine capacité.',
    },
    practice: {
      en: 'Read one of today\'s parables slowly — the ten bridesmaids (Matthew 25:1-13) is a good choice. Ask yourself: where in your life are you coasting on yesterday\'s preparation instead of being ready for today? Holy Week is short. Don\'t let it pass unnoticed.',
      fr: 'Lisez lentement une des paraboles du jour — les dix vierges (Matthieu 25, 1-13) est un bon choix. Demandez-vous : où dans votre vie vivez-vous sur les acquis d\'hier au lieu d\'être prêt pour aujourd\'hui ? La Semaine Sainte est courte. Ne la laissez pas passer inaperçue.',
    },
    scripture: [
      { ref: 'Matthew 25:1-13', refFr: 'Matthieu 25, 1-13' },
      { ref: 'Matthew 22:34-40', refFr: 'Matthieu 22, 34-40' },
      { ref: 'John 12:20-36', refFr: 'Jean 12, 20-36' },
    ],
  },

  'Holy Wednesday': {
    origin: {
      en: 'Holy Wednesday — also called Spy Wednesday — is the day Judas Iscariot went to the chief priests and offered to betray Jesus for thirty pieces of silver (Matthew 26:14-16). The sum was deliberately insulting: it was the price of a slave (Exodus 21:32). While Judas bargained, a woman (identified as Mary of Bethany in John\'s Gospel) anointed Jesus\' feet with costly perfume — an extravagant act of love that Judas criticized as wasteful. Jesus defended her: "She has done a beautiful thing." The contrast between the two acts — devotion and betrayal — defines this day.',
      fr: 'Le Mercredi Saint — aussi appelé Mercredi de la trahison — est le jour où Judas Iscariote alla trouver les grands prêtres et offrit de trahir Jésus pour trente pièces d\'argent (Matthieu 26, 14-16). La somme était délibérément insultante : c\'était le prix d\'un esclave (Exode 21, 32). Pendant que Judas négociait, une femme (identifiée comme Marie de Béthanie dans l\'Évangile de Jean) oignit les pieds de Jésus avec un parfum précieux — un acte d\'amour extravagant que Judas critiqua comme du gaspillage. Jésus la défendit : « Elle a fait une belle action. » Le contraste entre les deux actes — dévotion et trahison — définit cette journée.',
    },
    theology: {
      en: 'Spy Wednesday forces us to confront the reality that betrayal often comes from the inside — from someone who shared the table. Judas was one of the Twelve. He had walked with Jesus, heard his teaching, witnessed miracles. The tradition asks us not to demonize Judas too quickly, but to recognize the Judas possibility in ourselves: the moment when self-interest wins over love, when we trade something sacred for something convenient. Against this darkness, the woman\'s anointing shines. She gave something costly without calculation. She understood what the disciples did not: that this body would soon be broken.',
      fr: 'Le Mercredi Saint nous oblige à affronter la réalité que la trahison vient souvent de l\'intérieur — de quelqu\'un qui partageait la table. Judas était l\'un des Douze. Il avait marché avec Jésus, entendu son enseignement, été témoin de miracles. La tradition nous invite à ne pas diaboliser Judas trop vite, mais à reconnaître la possibilité de Judas en nous-mêmes : le moment où l\'intérêt personnel l\'emporte sur l\'amour, où l\'on échange quelque chose de sacré contre quelque chose de commode. Face à cette obscurité, l\'onction de la femme resplendit. Elle a donné quelque chose de coûteux sans calcul. Elle comprit ce que les disciples ne comprirent pas : que ce corps serait bientôt brisé.',
    },
    france: {
      en: 'In France, Holy Wednesday is traditionally a day of quiet preparation. Many parishes hold the last confession sessions before Easter — the "confessions de Pâques" — and lines can be long, especially in more devout communities. In southern France and parts of the Basque Country, confréries (brotherhoods) begin preparing their processional floats and costumes for the Good Friday processions. In Perpignan, the Procession de la Sanch — one of the oldest in France, dating to 1416 — begins its preparations, with penitents in red and black robes readying the "misteris" (mystery tableaux) that will be carried through the streets.',
      fr: 'En France, le Mercredi Saint est traditionnellement un jour de préparation tranquille. Beaucoup de paroisses tiennent les dernières séances de confession avant Pâques — les « confessions de Pâques » — et les files peuvent être longues, surtout dans les communautés plus ferventes. Dans le sud de la France et en Pays Basque, les confréries commencent à préparer leurs chars processionnels et leurs costumes pour les processions du Vendredi Saint. À Perpignan, la Procession de la Sanch — l\'une des plus anciennes de France, datant de 1416 — commence ses préparatifs, avec des pénitents en robes rouges et noires préparant les « misteris » (tableaux de mystères) qui seront portés dans les rues.',
    },
    practice: {
      en: 'This is a day for honesty. Where in your life are you acting like Judas — trading something precious for something cheap? And where might you be like the woman with the perfume — offering something costly simply because love demands it? If you haven\'t been to confession recently, consider going today or tomorrow.',
      fr: 'C\'est un jour d\'honnêteté. Où dans votre vie agissez-vous comme Judas — échangeant quelque chose de précieux contre quelque chose de bon marché ? Et où pourriez-vous être comme la femme au parfum — offrant quelque chose de coûteux simplement parce que l\'amour l\'exige ? Si vous ne vous êtes pas confessé récemment, envisagez d\'y aller aujourd\'hui ou demain.',
    },
    scripture: [
      { ref: 'Matthew 26:14-16', refFr: 'Matthieu 26, 14-16' },
      { ref: 'John 12:1-8', refFr: 'Jean 12, 1-8' },
      { ref: 'Zechariah 11:12-13', refFr: 'Zacharie 11, 12-13' },
    ],
  },

  'Holy Thursday': {
    origin: {
      en: 'Holy Thursday commemorates the Last Supper — the final meal Jesus shared with his disciples before his arrest. During supper, Jesus did something shocking: he removed his outer garment, wrapped a towel around his waist, and washed his disciples\' feet — the task of the lowest household slave. Peter objected; Jesus insisted. Then he took bread, blessed it, broke it, and said: "This is my body, given for you. Do this in remembrance of me." He did the same with the cup of wine: "This is my blood of the new covenant." After supper, they went to the Garden of Gethsemane, where Jesus prayed in agony while the disciples slept. Judas arrived with soldiers. Jesus was arrested.',
      fr: 'Le Jeudi Saint commémore la Cène — le dernier repas que Jésus partagea avec ses disciples avant son arrestation. Pendant le repas, Jésus fit quelque chose de stupéfiant : il ôta son vêtement de dessus, ceignit un linge autour de sa taille et lava les pieds de ses disciples — la tâche du plus humble esclave de la maison. Pierre protesta ; Jésus insista. Puis il prit du pain, le bénit, le rompit et dit : « Ceci est mon corps, donné pour vous. Faites ceci en mémoire de moi. » Il fit de même avec la coupe de vin : « Ceci est mon sang, le sang de la nouvelle alliance. » Après le repas, ils se rendirent au Jardin de Gethsémani, où Jésus pria dans l\'agonie tandis que les disciples dormaient. Judas arriva avec des soldats. Jésus fut arrêté.',
    },
    theology: {
      en: 'Three acts define Holy Thursday: the foot-washing, the Eucharist, and the agony in the garden. Together they reveal the full shape of Christian love. The foot-washing shows that authority means service — God kneels before us before asking us to kneel before him. The Eucharist transforms an ordinary meal into the ongoing presence of Christ — bread and wine become the vehicle of grace. And Gethsemane shows that courage is not the absence of fear: Jesus asked for the cup to pass, then drank it anyway. "Not my will, but yours." This is the night when everything turns. After tonight, there is no going back.',
      fr: 'Trois actes définissent le Jeudi Saint : le lavement des pieds, l\'Eucharistie et l\'agonie au jardin. Ensemble, ils révèlent la forme complète de l\'amour chrétien. Le lavement des pieds montre que l\'autorité signifie le service — Dieu s\'agenouille devant nous avant de nous demander de nous agenouiller devant lui. L\'Eucharistie transforme un repas ordinaire en présence continue du Christ — le pain et le vin deviennent le véhicule de la grâce. Et Gethsémani montre que le courage n\'est pas l\'absence de peur : Jésus demanda que la coupe passe, puis la but quand même. « Non pas ma volonté, mais la tienne. » C\'est la nuit où tout bascule. Après cette nuit, il n\'y a plus de retour en arrière.',
    },
    france: {
      en: 'In France, the Holy Thursday Mass (Messe de la Cène) is one of the most solemn of the year. The foot-washing ceremony (lavement des pieds) is performed by the priest on twelve members of the congregation — in many French parishes, a diverse group is chosen: young and old, men and women. After Mass, the Blessed Sacrament is carried in procession to a "reposoir" (altar of repose), often elaborately decorated with flowers and candles, where the faithful keep vigil through the night — the "adoration nocturne" or "nuit sainte" (holy night). The church bells ring during the Gloria at the beginning of Mass, then fall silent until the Easter Vigil — children are told "les cloches sont parties à Rome" (the bells have gone to Rome), a beloved tradition explaining their silence. In some regions, wooden "crécelles" (rattles) replace the bells to call the faithful to prayer.',
      fr: 'En France, la Messe de la Cène du Jeudi Saint est l\'une des plus solennelles de l\'année. Le lavement des pieds est accompli par le prêtre sur douze membres de l\'assemblée — dans beaucoup de paroisses françaises, un groupe diversifié est choisi : jeunes et vieux, hommes et femmes. Après la messe, le Saint-Sacrement est porté en procession vers un « reposoir », souvent somptueusement décoré de fleurs et de bougies, où les fidèles veillent toute la nuit — l\'« adoration nocturne » ou « nuit sainte ». Les cloches de l\'église sonnent pendant le Gloria au début de la messe, puis se taisent jusqu\'à la Vigile pascale — on dit aux enfants que « les cloches sont parties à Rome », une tradition bien-aimée expliquant leur silence. Dans certaines régions, des « crécelles » en bois remplacent les cloches pour appeler les fidèles à la prière.',
    },
    practice: {
      en: 'If you can attend only one weekday service this Holy Week, make it tonight. The foot-washing, the stripping of the altar, the procession to the place of repose — these are among the most powerful liturgical actions in the Christian calendar. If you can\'t attend, read John 13 (the foot-washing) slowly tonight. Then sit with this question: "Could you not watch one hour with me?"',
      fr: 'Si vous ne pouvez assister qu\'à un seul office en semaine cette Semaine Sainte, que ce soit ce soir. Le lavement des pieds, le dépouillement de l\'autel, la procession vers le reposoir — ce sont parmi les gestes liturgiques les plus puissants du calendrier chrétien. Si vous ne pouvez pas y assister, lisez lentement Jean 13 (le lavement des pieds) ce soir. Puis restez avec cette question : « Vous n\'avez pas pu veiller une heure avec moi ? »',
    },
    scripture: [
      { ref: 'John 13:1-17', refFr: 'Jean 13, 1-17' },
      { ref: 'Luke 22:14-20', refFr: 'Luc 22, 14-20' },
      { ref: 'Matthew 26:36-46', refFr: 'Matthieu 26, 36-46' },
    ],
  },

  'Good Friday': {
    origin: {
      en: 'Good Friday commemorates the trial, crucifixion, and death of Jesus. After his arrest in Gethsemane, Jesus was tried before the Sanhedrin, then brought to Pontius Pilate, who found no guilt in him but yielded to the crowd\'s demand for crucifixion. Jesus carried his cross through the streets of Jerusalem (the Via Dolorosa), was nailed to it at Golgotha ("the place of the skull"), and hung between two criminals. Darkness covered the land from noon until three o\'clock, when Jesus cried out "It is finished" (John 19:30) and died. His body was taken down and placed in a borrowed tomb before sunset, as the Sabbath was about to begin.',
      fr: 'Le Vendredi Saint commémore le procès, la crucifixion et la mort de Jésus. Après son arrestation à Gethsémani, Jésus fut jugé devant le Sanhédrin, puis amené à Ponce Pilate, qui ne trouva aucune faute en lui mais céda à la demande de la foule pour la crucifixion. Jésus porta sa croix à travers les rues de Jérusalem (la Via Dolorosa), fut cloué sur elle au Golgotha (« le lieu du crâne »), et pendu entre deux criminels. L\'obscurité couvrit la terre de midi à trois heures, quand Jésus cria « Tout est accompli » (Jean 19, 30) et mourut. Son corps fut descendu et déposé dans un tombeau emprunté avant le coucher du soleil, car le sabbat allait commencer.',
    },
    theology: {
      en: 'Good Friday is called "good" not because the events were good, but because of what they accomplished. The cross is the axis of history in Christian theology — the point where God\'s justice and mercy meet. On the cross, Jesus absorbed the full weight of human suffering, injustice, and death. He did not avoid it, explain it away, or minimize it. He entered it. The traditional "Seven Last Words" from the cross reveal the full range: forgiveness ("Father, forgive them"), compassion (entrusting his mother to John), honesty ("My God, why have you forsaken me?"), and finally, completion ("It is finished"). Good Friday does not ask us to celebrate suffering. It asks us to face it — and to believe that God is present even there.',
      fr: 'Le Vendredi Saint est « saint » non parce que les événements furent bons, mais à cause de ce qu\'ils ont accompli. La croix est l\'axe de l\'histoire dans la théologie chrétienne — le point où la justice et la miséricorde de Dieu se rencontrent. Sur la croix, Jésus a absorbé tout le poids de la souffrance humaine, de l\'injustice et de la mort. Il ne l\'a pas évité, ni expliqué, ni minimisé. Il y est entré. Les traditionnelles « Sept Paroles » depuis la croix révèlent toute l\'étendue : le pardon (« Père, pardonne-leur »), la compassion (confiant sa mère à Jean), l\'honnêteté (« Mon Dieu, pourquoi m\'as-tu abandonné ? »), et enfin, l\'accomplissement (« Tout est accompli »). Le Vendredi Saint ne nous demande pas de célébrer la souffrance. Il nous demande de lui faire face — et de croire que Dieu est présent même là.',
    },
    france: {
      en: 'Good Friday in France is one of the most culturally distinctive days of Holy Week. Though it\'s not a public holiday (except in Alsace-Moselle, which follows the old Concordat), it\'s widely observed.\n\nThe most famous tradition is the **Chemin de Croix** (Stations of the Cross), performed in churches and sometimes through city streets. In Paris, the Archbishop leads the Stations up the hill of Montmartre to Sacré-Cœur. In Perpignan, the **Procession de la Sanch** (Procession of the Holy Blood), dating to 1416, winds through the old city with hooded penitents in red and black carrying life-sized crucifixion scenes.\n\nIn Provence, the tradition of the **Rondeau des Pénitents** involves confréries processing in silence with heavy wooden crosses. In Brittany, many fishing villages hold processions to the sea, asking blessing on the fleet.\n\nTraditionally, French families eat no meat — the typical Good Friday meal is fish, often **brandade de morue** (salt cod) or **aïoli** with vegetables. In the north, **harengs** (herring) are common. Many families eat very simply, some fasting entirely until the evening.\n\nChurch bells remain silent all day — their journey "to Rome" continues — and crécelles mark the liturgical hours.',
      fr: 'Le Vendredi Saint en France est l\'un des jours les plus culturellement distinctifs de la Semaine Sainte. Bien que ce ne soit pas un jour férié (sauf en Alsace-Moselle, qui suit l\'ancien Concordat), il est largement observé.\n\nLa tradition la plus célèbre est le **Chemin de Croix**, accompli dans les églises et parfois à travers les rues. À Paris, l\'Archevêque mène les Stations en montant la colline de Montmartre jusqu\'au Sacré-Cœur. À Perpignan, la **Procession de la Sanch** (Procession du Saint Sang), datant de 1416, serpente à travers la vieille ville avec des pénitents encapuchonnés en rouge et noir portant des scènes de crucifixion grandeur nature.\n\nEn Provence, la tradition du **Rondeau des Pénitents** implique des confréries processionnant en silence avec de lourdes croix de bois. En Bretagne, de nombreux villages de pêcheurs tiennent des processions vers la mer, demandant la bénédiction sur la flotte.\n\nTraditionnellement, les familles françaises ne mangent pas de viande — le repas typique du Vendredi Saint est du poisson, souvent la **brandade de morue** ou l\'**aïoli** avec des légumes. Dans le nord, les **harengs** sont courants. Beaucoup de familles mangent très simplement, certaines jeûnant entièrement jusqu\'au soir.\n\nLes cloches restent silencieuses toute la journée — leur voyage « à Rome » continue — et les crécelles marquent les heures liturgiques.',
    },
    practice: {
      en: 'Good Friday is meant to be felt, not just understood. Fast if you\'re able — even a simplified meal can shift your awareness. Attend the Liturgy of the Passion if possible: the reading of John\'s Passion, the veneration of the cross, and the solemn intercessions are profoundly moving. At 3:00 PM — the traditional hour of Jesus\' death — pause whatever you\'re doing for a moment of silence.',
      fr: 'Le Vendredi Saint est fait pour être ressenti, pas seulement compris. Jeûnez si vous le pouvez — même un repas simplifié peut changer votre conscience. Assistez à la Liturgie de la Passion si possible : la lecture de la Passion selon Jean, la vénération de la croix et les intercessions solennelles sont profondément émouvantes. À 15h — l\'heure traditionnelle de la mort de Jésus — faites une pause dans ce que vous faites pour un moment de silence.',
    },
    scripture: [
      { ref: 'John 18:1 – 19:42', refFr: 'Jean 18, 1 – 19, 42' },
      { ref: 'Isaiah 52:13 – 53:12', refFr: 'Isaïe 52, 13 – 53, 12' },
      { ref: 'Psalm 22', refFr: 'Psaume 22' },
    ],
  },

  'Holy Saturday': {
    origin: {
      en: 'Holy Saturday is the great silence between death and resurrection. Jesus lies in the tomb. The Gospels say almost nothing about this day — the disciples were scattered, grieving, hiding behind locked doors. The Apostles\' Creed says Christ "descended into hell" (or "to the dead"), understood in tradition as the "Harrowing of Hell" — Christ going to the place of the dead to proclaim liberation to the righteous who had died before him, from Adam and Eve onward. It is the only day of the Christian year with no celebration of the Eucharist.',
      fr: 'Le Samedi Saint est le grand silence entre la mort et la résurrection. Jésus repose au tombeau. Les Évangiles ne disent presque rien de cette journée — les disciples étaient dispersés, en deuil, cachés derrière des portes verrouillées. Le Symbole des Apôtres dit que le Christ « est descendu aux enfers » (ou « au séjour des morts »), compris dans la tradition comme la « Descente aux enfers » — le Christ allant au séjour des morts pour proclamer la libération aux justes morts avant lui, depuis Adam et Ève. C\'est le seul jour de l\'année chrétienne sans célébration de l\'Eucharistie.',
    },
    theology: {
      en: 'Holy Saturday is the hardest day for modern people — we are uncomfortable with waiting, with not knowing, with silence. But this is precisely its gift. The disciples on this day had no idea Easter was coming. They thought it was over. They sat with grief, doubt, and the apparent victory of death. Holy Saturday validates the experience of every person who waits in darkness without knowing if dawn will come. It says: God is present even in the tomb. Even in the silence. The traditional icon of Holy Saturday — Christ pulling Adam and Eve out of their graves — is among the most powerful in Christian art: even death cannot contain him.',
      fr: 'Le Samedi Saint est le jour le plus difficile pour les gens modernes — nous sommes mal à l\'aise avec l\'attente, avec l\'inconnu, avec le silence. Mais c\'est précisément son don. Les disciples ce jour-là n\'avaient aucune idée que Pâques allait venir. Ils pensaient que c\'était fini. Ils restaient avec le deuil, le doute et la victoire apparente de la mort. Le Samedi Saint valide l\'expérience de toute personne qui attend dans l\'obscurité sans savoir si l\'aube viendra. Il dit : Dieu est présent même dans le tombeau. Même dans le silence. L\'icône traditionnelle du Samedi Saint — le Christ tirant Adam et Ève de leurs tombes — est parmi les plus puissantes de l\'art chrétien : même la mort ne peut le contenir.',
    },
    france: {
      en: 'In France, Holy Saturday is a day of intense preparation — both spiritual and domestic. Churches are cleaned and prepared for the Easter Vigil, the most important liturgy of the year. Flowers are arranged (having been absent throughout Lent), and the Paschal candle is prepared.\n\nThe **Vigile Pascale** (Easter Vigil) begins after sunset with the blessing of the new fire outside the darkened church. The Paschal candle is lit, and its flame spreads person to person through the congregation — a moment of extraordinary beauty as the dark church slowly fills with candlelight. The Exsultet (Easter proclamation) is chanted. Seven Old Testament readings trace salvation history. Then the Gloria is sung, bells ring for the first time since Holy Thursday (they have "returned from Rome"), and the church erupts in light.\n\nIn many French parishes, adult catechumens receive baptism during the Vigil — often by full immersion — and the entire community renews their baptismal promises. The celebration typically ends close to midnight with Easter greetings and champagne on the church steps.',
      fr: 'En France, le Samedi Saint est un jour de préparation intense — à la fois spirituelle et domestique. Les églises sont nettoyées et préparées pour la Vigile pascale, la liturgie la plus importante de l\'année. Les fleurs sont disposées (elles étaient absentes tout au long du Carême), et le cierge pascal est préparé.\n\nLa **Vigile Pascale** commence après le coucher du soleil avec la bénédiction du feu nouveau à l\'extérieur de l\'église plongée dans l\'obscurité. Le cierge pascal est allumé, et sa flamme se propage de personne en personne dans l\'assemblée — un moment d\'une beauté extraordinaire quand l\'église obscure se remplit lentement de lumière. L\'Exsultet (proclamation pascale) est chanté. Sept lectures de l\'Ancien Testament retracent l\'histoire du salut. Puis le Gloria est chanté, les cloches sonnent pour la première fois depuis le Jeudi Saint (elles sont « revenues de Rome »), et l\'église éclate de lumière.\n\nDans beaucoup de paroisses françaises, les catéchumènes adultes reçoivent le baptême pendant la Vigile — souvent par immersion complète — et toute la communauté renouvelle ses promesses baptismales. La célébration se termine généralement près de minuit avec des vœux de Pâques et du champagne sur les marches de l\'église.',
    },
    practice: {
      en: 'Let today be quiet. Resist the urge to rush to Easter joy. Sit with the silence. If something in your life feels dead or dormant — a relationship, a hope, a project — let Holy Saturday hold that. Not everything needs to be fixed immediately. Sometimes the most faithful thing is to wait. If you can, attend the Easter Vigil tonight — it is the single most beautiful liturgy in the Christian calendar.',
      fr: 'Laissez cette journée être calme. Résistez à l\'envie de vous précipiter vers la joie de Pâques. Restez avec le silence. Si quelque chose dans votre vie semble mort ou en sommeil — une relation, un espoir, un projet — laissez le Samedi Saint le porter. Tout n\'a pas besoin d\'être réparé immédiatement. Parfois la chose la plus fidèle est d\'attendre. Si vous le pouvez, assistez à la Vigile pascale ce soir — c\'est la liturgie la plus belle de tout le calendrier chrétien.',
    },
    scripture: [
      { ref: 'Matthew 27:57-66', refFr: 'Matthieu 27, 57-66' },
      { ref: 'Psalm 130', refFr: 'Psaume 130' },
      { ref: '1 Peter 3:18-20', refFr: '1 Pierre 3, 18-20' },
    ],
  },

  'Easter Sunday': {
    origin: {
      en: 'At dawn on the first day of the week, women went to the tomb to anoint Jesus\' body with spices. They found the heavy stone rolled away and the tomb empty. An angel announced: "He is not here; he has risen!" (Matthew 28:6). Mary Magdalene was the first to see the risen Christ, initially mistaking him for a gardener until he spoke her name. The disciples, hiding in fear, received his visit that evening: "Peace be with you." Thomas, absent that day, would not believe until he touched the wounds himself — and when he did, he made the greatest confession of faith in the Gospels: "My Lord and my God."',
      fr: 'À l\'aube du premier jour de la semaine, des femmes se rendirent au tombeau pour oindre le corps de Jésus avec des aromates. Elles trouvèrent la lourde pierre roulée et le tombeau vide. Un ange annonça : « Il n\'est pas ici ; il est ressuscité ! » (Matthieu 28, 6). Marie-Madeleine fut la première à voir le Christ ressuscité, le prenant d\'abord pour le jardinier jusqu\'à ce qu\'il prononce son nom. Les disciples, cachés par peur, reçurent sa visite ce soir-là : « La paix soit avec vous. » Thomas, absent ce jour-là, refusa de croire jusqu\'à ce qu\'il touche les plaies lui-même — et quand il le fit, il prononça la plus grande confession de foi des Évangiles : « Mon Seigneur et mon Dieu. »',
    },
    theology: {
      en: 'Easter is the foundation on which everything else stands. As Paul wrote: "If Christ has not been raised, your faith is futile" (1 Corinthians 15:17). The resurrection is not a metaphor, a symbol, or a spiritual idea in Christian theology — it is a claim about reality: that death does not have the final word. The risen Christ bore his wounds — he was not a ghost or a different person, but the same Jesus, transformed. This matters: resurrection is not escape from the body but the redemption of it. Whatever is broken can be made new. This is the Christian hope, and it begins at an empty tomb at dawn.',
      fr: 'Pâques est le fondement sur lequel tout le reste repose. Comme Paul l\'a écrit : « Si le Christ n\'est pas ressuscité, votre foi est vaine » (1 Corinthiens 15, 17). La résurrection n\'est pas une métaphore, un symbole ou une idée spirituelle dans la théologie chrétienne — c\'est une affirmation sur la réalité : la mort n\'a pas le dernier mot. Le Christ ressuscité portait ses plaies — il n\'était pas un fantôme ni une autre personne, mais le même Jésus, transformé. Cela compte : la résurrection n\'est pas la fuite du corps mais sa rédemption. Tout ce qui est brisé peut être renouvelé. C\'est l\'espérance chrétienne, et elle commence devant un tombeau vide à l\'aube.',
    },
    france: {
      en: 'Easter in France is a joyful explosion after weeks of Lenten restraint. The day begins with morning Mass, where the church — decorated with lilies and spring flowers after the austerity of Lent — rings with alleluias not heard for 40 days.\n\nThe most beloved French Easter tradition is the **chasse aux œufs** (egg hunt). According to tradition, the church bells that "flew to Rome" on Holy Thursday return on Easter morning, dropping chocolate eggs, bells, fish, and hens into gardens as they pass overhead. Children search gardens and parks for these treasures. The chocolate eggs are often elaborate — French chocolatiers compete to create the most artistic designs.\n\nThe **agneau pascal** (Easter lamb) is the traditional centerpiece of the Easter feast. In Alsace, a lamb-shaped cake called **Lamala** or **Osterlammele** is baked in special molds. In the southwest, lamb is roasted with garlic and Provençal herbs. In the north, **gâteau battu** (a rich, buttery brioche) is traditional.\n\nEaster Monday (Lundi de Pâques) is a public holiday in France — one of the few countries where this is the case. Families gather for extended meals, often outdoors if the weather permits, and children continue their egg hunts.',
      fr: 'Pâques en France est une explosion de joie après des semaines de retenue du Carême. La journée commence par la messe du matin, où l\'église — décorée de lys et de fleurs printanières après l\'austérité du Carême — résonne d\'alléluias qu\'on n\'a pas entendus depuis 40 jours.\n\nLa tradition pascale française la plus aimée est la **chasse aux œufs**. Selon la tradition, les cloches qui « sont parties à Rome » le Jeudi Saint reviennent le matin de Pâques, laissant tomber des œufs, des cloches, des poissons et des poules en chocolat dans les jardins en passant. Les enfants cherchent ces trésors dans les jardins et les parcs. Les œufs en chocolat sont souvent élaborés — les chocolatiers français rivalisent pour créer les designs les plus artistiques.\n\nL\'**agneau pascal** est la pièce maîtresse traditionnelle du repas de Pâques. En Alsace, un gâteau en forme d\'agneau appelé **Lamala** ou **Osterlammele** est cuit dans des moules spéciaux. Dans le Sud-Ouest, l\'agneau est rôti avec de l\'ail et des herbes de Provence. Dans le nord, le **gâteau battu** (une brioche riche et beurrée) est traditionnel.\n\nLe Lundi de Pâques est un jour férié en France — l\'un des rares pays où c\'est le cas. Les familles se rassemblent pour des repas prolongés, souvent en plein air si le temps le permet, et les enfants continuent leurs chasses aux œufs.',
    },
    practice: {
      en: 'This is a day for celebration, not restraint. Say "Alleluia" — it\'s been absent for 40 days. Share a festive meal with people you love. If someone asks what Easter means to you, don\'t over-explain: "Death doesn\'t win" is enough. The Easter season lasts 50 days until Pentecost — let the joy unfold slowly rather than burning out today.',
      fr: 'C\'est un jour de célébration, pas de retenue. Dites « Alléluia » — il a été absent pendant 40 jours. Partagez un repas festif avec des personnes que vous aimez. Si quelqu\'un demande ce que Pâques signifie pour vous, n\'expliquez pas trop : « La mort ne gagne pas » suffit. Le temps pascal dure 50 jours jusqu\'à la Pentecôte — laissez la joie se déployer lentement plutôt que de s\'épuiser aujourd\'hui.',
    },
    scripture: [
      { ref: 'John 20:1-18', refFr: 'Jean 20, 1-18' },
      { ref: 'Matthew 28:1-10', refFr: 'Matthieu 28, 1-10' },
      { ref: '1 Corinthians 15:3-8', refFr: '1 Corinthiens 15, 3-8' },
    ],
  },

  'Easter Monday': {
    origin: {
      en: 'Easter Monday recalls the story of two disciples walking to the village of Emmaus, about seven miles from Jerusalem (Luke 24:13-35). Despondent after the crucifixion, they encountered a stranger on the road who explained how all of Scripture pointed to the Messiah\'s suffering and glory. When they reached the village and sat down to eat, the stranger took bread, blessed it, and broke it — and "their eyes were opened" to recognize Jesus. He vanished. They rushed back to Jerusalem to tell the others: "The Lord has risen indeed!"',
      fr: 'Le Lundi de Pâques rappelle l\'histoire de deux disciples marchant vers le village d\'Emmaüs, à environ onze kilomètres de Jérusalem (Luc 24, 13-35). Découragés après la crucifixion, ils rencontrèrent un étranger sur la route qui expliqua comment toute l\'Écriture pointait vers la souffrance et la gloire du Messie. Quand ils atteignirent le village et s\'assirent pour manger, l\'étranger prit du pain, le bénit et le rompit — et « leurs yeux s\'ouvrirent » pour reconnaître Jésus. Il disparut. Ils se précipitèrent à Jérusalem pour dire aux autres : « Le Seigneur est vraiment ressuscité ! »',
    },
    theology: {
      en: 'The Emmaus story is one of the most intimate resurrection narratives. Jesus didn\'t appear in glory or power — he walked alongside two discouraged people who didn\'t recognize him. He listened to their grief before revealing himself. And he was recognized not in a miraculous sign but in the ordinary act of breaking bread. This pattern defines Christian experience ever since: Christ walks with us in our confusion, speaks through Scripture, and reveals himself in shared meals and community. The journey to Emmaus is every believer\'s journey.',
      fr: 'Le récit d\'Emmaüs est l\'un des récits de résurrection les plus intimes. Jésus n\'apparut pas dans la gloire ou la puissance — il marcha aux côtés de deux personnes découragées qui ne le reconnurent pas. Il écouta leur chagrin avant de se révéler. Et il fut reconnu non dans un signe miraculeux mais dans l\'acte ordinaire de rompre le pain. Ce schéma définit l\'expérience chrétienne depuis lors : le Christ marche avec nous dans notre confusion, parle à travers les Écritures, et se révèle dans les repas partagés et la communauté. Le chemin d\'Emmaüs est le chemin de tout croyant.',
    },
    france: {
      en: 'Easter Monday (Lundi de Pâques) is a public holiday in France — a rare distinction in a largely secular republic. It\'s a day for family gatherings, outdoor meals, and the continuation of Easter celebrations. Many families organize a second, larger chasse aux œufs (egg hunt) in parks and gardens. In Bessières, near Toulouse, a giant omelette made from over 15,000 eggs is cooked in the town square — a tradition dating to Napoleon\'s era, when he allegedly ordered the townspeople to make him an enormous omelette. Across France, the day is spent in leisurely meals, often featuring the remaining Easter lamb and chocolate.',
      fr: 'Le Lundi de Pâques est un jour férié en France — une distinction rare dans une république largement laïque. C\'est un jour de rassemblements familiaux, de repas en plein air et de continuation des festivités pascales. Beaucoup de familles organisent une seconde chasse aux œufs, plus grande, dans les parcs et jardins. À Bessières, près de Toulouse, une omelette géante de plus de 15 000 œufs est cuisinée sur la place du village — une tradition remontant à l\'époque napoléonienne, quand Napoléon aurait ordonné aux habitants de lui préparer une énorme omelette. À travers la France, la journée se passe en repas tranquilles, souvent avec les restes d\'agneau pascal et de chocolat.',
    },
    practice: {
      en: 'Take a walk today — literally, like the Emmaus disciples. As you walk, pay attention: where might Christ be present in disguise? In a conversation with a stranger, in the beauty of spring, in the faces of family? Easter Monday is about recognizing the risen Christ in ordinary moments.',
      fr: 'Faites une promenade aujourd\'hui — littéralement, comme les disciples d\'Emmaüs. En marchant, soyez attentif : où le Christ pourrait-il être présent, déguisé ? Dans une conversation avec un inconnu, dans la beauté du printemps, dans les visages de la famille ? Le Lundi de Pâques, c\'est reconnaître le Christ ressuscité dans les moments ordinaires.',
    },
    scripture: [
      { ref: 'Luke 24:13-35', refFr: 'Luc 24, 13-35' },
      { ref: 'Acts 2:14, 22-33', refFr: 'Actes 2, 14.22-33' },
    ],
  },

  'Ascension': {
    origin: {
      en: 'Forty days after Easter, the risen Jesus led his disciples to the Mount of Olives near Bethany. He gave them their final commission: "Go and make disciples of all nations" (Matthew 28:19). Then, "he was taken up before their eyes, and a cloud hid him from their sight" (Acts 1:9). As the disciples stood gazing upward, two angels appeared and said: "Why do you stand looking into heaven? This Jesus will come back in the same way you saw him go." The Ascension marks the end of Jesus\' visible, bodily presence on earth — but not the end of his presence, which continues through the Holy Spirit.',
      fr: 'Quarante jours après Pâques, Jésus ressuscité conduisit ses disciples au Mont des Oliviers près de Béthanie. Il leur donna leur mission finale : « Allez, faites de toutes les nations des disciples » (Matthieu 28, 19). Puis, « il fut élevé sous leurs yeux, et une nuée le déroba à leur regard » (Actes 1, 9). Tandis que les disciples restaient les yeux fixés au ciel, deux anges apparurent et dirent : « Pourquoi restez-vous là à regarder vers le ciel ? Ce Jésus reviendra de la même manière que vous l\'avez vu s\'en aller. » L\'Ascension marque la fin de la présence visible et corporelle de Jésus sur terre — mais non la fin de sa présence, qui continue par le Saint-Esprit.',
    },
    theology: {
      en: 'The Ascension is not about Jesus leaving — it\'s about a change in how he is present. Before the Ascension, the risen Christ was localized: he appeared here and there to specific people. After the Ascension, his presence becomes universal through the Spirit. He is not "up there" in a spatial sense; he is everywhere. The Ascension also inaugurates the Church\'s mission: Jesus entrusts the continuation of his work to human hands. The angels\' question — "Why are you standing there looking up?" — is a gentle rebuke: don\'t wait for Jesus to come back. Get to work. The kingdom advances through you.',
      fr: 'L\'Ascension n\'est pas le départ de Jésus — c\'est un changement dans sa manière d\'être présent. Avant l\'Ascension, le Christ ressuscité était localisé : il apparaissait ici et là à des personnes précises. Après l\'Ascension, sa présence devient universelle par l\'Esprit. Il n\'est pas « là-haut » dans un sens spatial ; il est partout. L\'Ascension inaugure aussi la mission de l\'Église : Jésus confie la continuation de son œuvre à des mains humaines. La question des anges — « Pourquoi restez-vous là à regarder vers le ciel ? » — est une douce réprimande : n\'attendez pas que Jésus revienne. Mettez-vous au travail. Le Royaume avance à travers vous.',
    },
    france: {
      en: 'The Ascension (l\'Ascension) is a public holiday in France — always falling on a Thursday, 39 days after Easter. The French have perfected the art of the "pont de l\'Ascension" (Ascension bridge): by taking Friday off, workers create a four-day weekend that has become one of France\'s most popular mini-vacations. This secular dimension coexists with genuine religious observance. Many parishes hold outdoor Masses, and some communities organize pilgrimages. In Lourdes, the Ascension weekend brings one of the year\'s largest pilgrimages to the grotto. In rural France, the Ascension was traditionally associated with Rogation Days — processions through the fields to bless the crops.',
      fr: 'L\'Ascension est un jour férié en France — tombant toujours un jeudi, 39 jours après Pâques. Les Français ont perfectionné l\'art du « pont de l\'Ascension » : en posant le vendredi, les travailleurs créent un week-end de quatre jours devenu l\'une des mini-vacances les plus populaires de France. Cette dimension séculière coexiste avec une observance religieuse sincère. Beaucoup de paroisses célèbrent des messes en plein air, et certaines communautés organisent des pèlerinages. À Lourdes, le week-end de l\'Ascension attire l\'un des plus grands pèlerinages de l\'année à la grotte. En France rurale, l\'Ascension était traditionnellement associée aux Rogations — des processions à travers les champs pour bénir les récoltes.',
    },
    practice: {
      en: 'The Ascension invites a shift in perspective: stop looking up and start looking around. Where is Christ present in your daily work, your relationships, your community? You are his hands and feet now. Take the angels\' question seriously: what work has been entrusted to you?',
      fr: 'L\'Ascension invite à un changement de perspective : arrêtez de regarder vers le haut et commencez à regarder autour de vous. Où le Christ est-il présent dans votre travail quotidien, vos relations, votre communauté ? Vous êtes ses mains et ses pieds maintenant. Prenez la question des anges au sérieux : quel travail vous a été confié ?',
    },
    scripture: [
      { ref: 'Acts 1:1-11', refFr: 'Actes 1, 1-11' },
      { ref: 'Matthew 28:16-20', refFr: 'Matthieu 28, 16-20' },
      { ref: 'Ephesians 1:17-23', refFr: 'Éphésiens 1, 17-23' },
    ],
  },

  'Pentecost': {
    origin: {
      en: 'Fifty days after Easter, the disciples were gathered in an upper room in Jerusalem when "suddenly a sound like the blowing of a violent wind came from heaven and filled the whole house. They saw what seemed to be tongues of fire that separated and came to rest on each of them. All of them were filled with the Holy Spirit and began to speak in other languages" (Acts 2:1-4). People from every nation heard them speaking in their own tongues. Peter, who had denied Jesus three times, stood up and preached with such power that 3,000 people were baptized that day. The Church was born.',
      fr: 'Cinquante jours après Pâques, les disciples étaient rassemblés dans une chambre haute à Jérusalem quand « soudain, il vint du ciel un bruit comme celui d\'un vent violent qui remplit toute la maison. Des langues, semblables à des langues de feu, leur apparurent et se posèrent sur chacun d\'eux. Ils furent tous remplis du Saint-Esprit et se mirent à parler en d\'autres langues » (Actes 2, 1-4). Des gens de toutes les nations les entendirent parler dans leurs propres langues. Pierre, qui avait renié Jésus trois fois, se leva et prêcha avec une telle puissance que 3 000 personnes furent baptisées ce jour-là. L\'Église était née.',
    },
    theology: {
      en: 'Pentecost is the reversal of Babel. At Babel, human pride fractured language and scattered the nations. At Pentecost, the Spirit reunites them — not by imposing one language but by making each language a vehicle for God\'s truth. This is the genius of the Christian message: it is translatable into every culture without losing its core. The Spirit also transforms the disciples from a frightened group hiding behind locked doors into bold witnesses willing to die for their testimony. Pentecost says: the same Spirit is available to you. Courage, clarity, and community are gifts, not accomplishments.',
      fr: 'La Pentecôte est l\'inversion de Babel. À Babel, l\'orgueil humain fractura les langues et dispersa les nations. À la Pentecôte, l\'Esprit les réunit — non en imposant une seule langue mais en faisant de chaque langue un véhicule pour la vérité de Dieu. C\'est le génie du message chrétien : il est traduisible dans chaque culture sans perdre son noyau. L\'Esprit transforme aussi les disciples d\'un groupe effrayé caché derrière des portes verrouillées en témoins audacieux prêts à mourir pour leur témoignage. La Pentecôte dit : le même Esprit est disponible pour vous. Le courage, la clarté et la communauté sont des dons, pas des accomplissements.',
    },
    france: {
      en: 'Pentecost Monday (Lundi de Pentecôte) was traditionally a public holiday in France until 2004, when it was designated as a "journée de solidarité" — a working day whose wages go to funding care for the elderly (created after the 2003 heatwave that killed 15,000 people). In practice, many companies still give the day off. Liturgically, Pentecost in France features red vestments and often dramatic readings of Acts 2, sometimes in multiple languages. Some parishes release doves or drop red rose petals from the ceiling to symbolize the tongues of fire. In Chartres, a famous Pentecost pilgrimage from Paris to the cathedral draws thousands of walkers over three days.',
      fr: 'Le Lundi de Pentecôte était traditionnellement un jour férié en France jusqu\'en 2004, quand il fut désigné comme « journée de solidarité » — un jour travaillé dont les salaires financent les soins aux personnes âgées (créé après la canicule de 2003 qui tua 15 000 personnes). En pratique, beaucoup d\'entreprises donnent encore ce jour. Liturgiquement, la Pentecôte en France présente des ornements rouges et souvent des lectures dramatiques des Actes 2, parfois en plusieurs langues. Certaines paroisses lâchent des colombes ou font tomber des pétales de roses rouges du plafond pour symboliser les langues de feu. À Chartres, un célèbre pèlerinage de Pentecôte de Paris à la cathédrale attire des milliers de marcheurs sur trois jours.',
    },
    practice: {
      en: 'Pentecost closes the Easter season and opens the Church\'s mission. Ask the Spirit today: what gift do I need for the work ahead? Courage? Clarity? Compassion? The Spirit gives what is needed, not what is wanted. Be open to surprise.',
      fr: 'La Pentecôte clôt le temps pascal et ouvre la mission de l\'Église. Demandez à l\'Esprit aujourd\'hui : quel don ai-je besoin pour le travail qui m\'attend ? Le courage ? La clarté ? La compassion ? L\'Esprit donne ce qui est nécessaire, pas ce qui est désiré. Soyez ouvert à la surprise.',
    },
    scripture: [
      { ref: 'Acts 2:1-13', refFr: 'Actes 2, 1-13' },
      { ref: 'John 14:15-26', refFr: 'Jean 14, 15-26' },
      { ref: 'Romans 8:22-27', refFr: 'Romains 8, 22-27' },
    ],
  },

  'Trinity Sunday': {
    origin: {
      en: 'Trinity Sunday, celebrated the Sunday after Pentecost, is unique in the liturgical calendar: it commemorates not an event but a doctrine — the mystery of God as three persons in one: Father, Son, and Holy Spirit. The feast was established for the universal Church in 1334 by Pope John XXII, though local celebrations date to the 10th century. It comes naturally after the Easter-Pentecost sequence: having celebrated the Son (Easter), and the Spirit (Pentecost), the Church now contemplates the fullness of who God is.',
      fr: 'Le Dimanche de la Trinité, célébré le dimanche après la Pentecôte, est unique dans le calendrier liturgique : il ne commémore pas un événement mais une doctrine — le mystère de Dieu comme trois personnes en une : Père, Fils et Saint-Esprit. La fête fut établie pour l\'Église universelle en 1334 par le pape Jean XXII, bien que des célébrations locales remontent au Xe siècle. Elle arrive naturellement après la séquence Pâques-Pentecôte : ayant célébré le Fils (Pâques) et l\'Esprit (Pentecôte), l\'Église contemple maintenant la plénitude de qui est Dieu.',
    },
    theology: {
      en: 'The Trinity is Christianity\'s most distinctive and most misunderstood teaching. It does not mean three gods, nor one god wearing three masks. It means that the very nature of God is relational — a community of love. The Father loves the Son, the Son loves the Father, and their love is so real it is a person: the Holy Spirit. If God is love (1 John 4:8), then God must be more than a solitary being — love requires an other. The Trinity says: relationship is at the heart of reality itself. This is not a puzzle to solve but a mystery to inhabit.',
      fr: 'La Trinité est l\'enseignement le plus distinctif et le plus mal compris du christianisme. Elle ne signifie pas trois dieux, ni un seul dieu portant trois masques. Elle signifie que la nature même de Dieu est relationnelle — une communauté d\'amour. Le Père aime le Fils, le Fils aime le Père, et leur amour est si réel qu\'il est une personne : le Saint-Esprit. Si Dieu est amour (1 Jean 4, 8), alors Dieu doit être plus qu\'un être solitaire — l\'amour requiert un autre. La Trinité dit : la relation est au cœur de la réalité elle-même. Ce n\'est pas une énigme à résoudre mais un mystère à habiter.',
    },
    france: {
      en: 'In France, Trinity Sunday traditionally marks the transition into the long stretch of "Ordinary Time" that runs through summer and autumn. In many parishes, it\'s an occasion for special choral music — the Te Deum is often sung. In some French regions, Trinity Sunday was historically associated with community celebrations and outdoor Masses in the countryside, marking the beginning of the agricultural growing season.',
      fr: 'En France, le Dimanche de la Trinité marque traditionnellement la transition vers la longue période du « Temps ordinaire » qui court tout l\'été et l\'automne. Dans beaucoup de paroisses, c\'est l\'occasion d\'une musique chorale spéciale — le Te Deum est souvent chanté. Dans certaines régions françaises, le Dimanche de la Trinité était historiquement associé à des célébrations communautaires et des messes en plein air à la campagne, marquant le début de la saison agricole.',
    },
    practice: {
      en: 'Today, notice the relational patterns in your life. Where do you experience love flowing between people — not just sentiment, but real self-giving? That pattern is a reflection of the Trinity. Pray today not to a distant deity but to a God who is already in relationship with you.',
      fr: 'Aujourd\'hui, remarquez les schémas relationnels dans votre vie. Où vivez-vous l\'amour circulant entre les personnes — non pas seulement un sentiment, mais un véritable don de soi ? Ce schéma est un reflet de la Trinité. Priez aujourd\'hui non vers une divinité distante mais vers un Dieu qui est déjà en relation avec vous.',
    },
    scripture: [
      { ref: 'Matthew 28:16-20', refFr: 'Matthieu 28, 16-20' },
      { ref: '2 Corinthians 13:13', refFr: '2 Corinthiens 13, 13' },
      { ref: 'John 3:16-18', refFr: 'Jean 3, 16-18' },
    ],
  },

  'Corpus Christi': {
    origin: {
      en: 'The Feast of Corpus Christi (Body and Blood of Christ) was instituted in 1264 by Pope Urban IV, inspired by the Eucharistic miracle of Bolsena (1263), where a priest who doubted the real presence saw the bread bleed during Mass. The feast was championed by Saint Thomas Aquinas, who composed its liturgical texts, including the hymns Pange Lingua and Tantum Ergo — still sung today. Unlike Holy Thursday, which celebrates the institution of the Eucharist in the shadow of the Passion, Corpus Christi celebrates it in the full light of resurrection joy.',
      fr: 'La Fête-Dieu (Corps et Sang du Christ) fut instituée en 1264 par le pape Urbain IV, inspiré par le miracle eucharistique de Bolsena (1263), où un prêtre qui doutait de la présence réelle vit le pain saigner pendant la messe. La fête fut défendue par saint Thomas d\'Aquin, qui composa ses textes liturgiques, dont les hymnes Pange Lingua et Tantum Ergo — encore chantés aujourd\'hui. Contrairement au Jeudi Saint, qui célèbre l\'institution de l\'Eucharistie dans l\'ombre de la Passion, la Fête-Dieu la célèbre dans la pleine lumière de la joie pascale.',
    },
    theology: {
      en: 'Corpus Christi celebrates the most radical claim in Christian worship: that in the Eucharist, bread and wine become the body and blood of Christ. Not symbolically, not metaphorically — really. This teaching, rooted in Jesus\' own words ("This is my body"), has been debated for centuries but remains central to Catholic and Orthodox faith. The feast insists that the spiritual is not opposed to the material — God comes to us through physical things: bread, wine, water, oil, human touch. The Eucharist says: the ordinary can carry the extraordinary. Every meal echoes this one.',
      fr: 'La Fête-Dieu célèbre l\'affirmation la plus radicale du culte chrétien : que dans l\'Eucharistie, le pain et le vin deviennent le corps et le sang du Christ. Pas symboliquement, pas métaphoriquement — réellement. Cet enseignement, enraciné dans les propres paroles de Jésus (« Ceci est mon corps »), a été débattu pendant des siècles mais reste central dans la foi catholique et orthodoxe. La fête insiste : le spirituel ne s\'oppose pas au matériel — Dieu vient à nous par des choses physiques : pain, vin, eau, huile, toucher humain. L\'Eucharistie dit : l\'ordinaire peut porter l\'extraordinaire. Chaque repas fait écho à celui-ci.',
    },
    france: {
      en: 'The Fête-Dieu holds a special place in French Catholic culture. The most distinctive tradition is the **procession du Saint-Sacrement** — the Blessed Sacrament is carried through the streets under a canopy (dais), with the faithful processing behind. Streets are decorated with flower petals, banners, and temporary altars called "reposoirs" where the procession pauses for prayer and benediction.\n\nIn many French towns, especially in the south and in Alsace, the streets are carpeted with elaborate flower designs — **tapis de fleurs** — created by parishioners who work through the night. In Génicourt-sur-Meuse (Lorraine), the flower carpet tradition has been maintained for centuries. In some Provençal towns, the procession includes folk costumes and traditional music.\n\nThe feast traditionally falls on Thursday (60 days after Easter), and in France it was historically a public holiday. Though no longer officially so, many parishes still celebrate with special solemnity on the following Sunday.',
      fr: 'La Fête-Dieu occupe une place particulière dans la culture catholique française. La tradition la plus distinctive est la **procession du Saint-Sacrement** — le Saint-Sacrement est porté dans les rues sous un dais, avec les fidèles processionnant derrière. Les rues sont décorées de pétales de fleurs, de bannières et d\'autels temporaires appelés « reposoirs » où la procession s\'arrête pour la prière et la bénédiction.\n\nDans beaucoup de villes françaises, surtout dans le sud et en Alsace, les rues sont tapissées de motifs floraux élaborés — des **tapis de fleurs** — créés par des paroissiens qui travaillent toute la nuit. À Génicourt-sur-Meuse (Lorraine), la tradition des tapis de fleurs est maintenue depuis des siècles. Dans certaines villes provençales, la procession inclut des costumes folkloriques et de la musique traditionnelle.\n\nLa fête tombe traditionnellement un jeudi (60 jours après Pâques), et en France elle était historiquement un jour férié. Bien que ce ne soit plus officiellement le cas, beaucoup de paroisses célèbrent encore avec une solennité particulière le dimanche suivant.',
    },
    practice: {
      en: 'Today, receive communion with special attention. Slow down. Notice the bread, the wine, the hands that give and receive. If there\'s a Corpus Christi procession near you, join it — there\'s something powerful about taking the Eucharist out of the church and into the streets, claiming that Christ is present not just inside sacred walls but in the world.',
      fr: 'Aujourd\'hui, recevez la communion avec une attention particulière. Ralentissez. Remarquez le pain, le vin, les mains qui donnent et reçoivent. S\'il y a une procession de la Fête-Dieu près de chez vous, rejoignez-la — il y a quelque chose de puissant dans le fait de sortir l\'Eucharistie de l\'église et de la porter dans les rues, affirmant que le Christ est présent non seulement dans les murs sacrés mais dans le monde.',
    },
    scripture: [
      { ref: 'John 6:51-58', refFr: 'Jean 6, 51-58' },
      { ref: '1 Corinthians 11:23-26', refFr: '1 Corinthiens 11, 23-26' },
      { ref: 'Deuteronomy 8:2-3, 14-16', refFr: 'Deutéronome 8, 2-3.14-16' },
    ],
  },

  // ─── FIXED FEASTS ────────────────────────────────────────

  'Solemnity of Mary, Mother of God': {
    origin: {
      en: 'On January 1, eight days after Christmas, the Church celebrates the oldest Marian feast in the Western calendar. The title "Mother of God" (Theotokos) was defined at the Council of Ephesus in 431 AD — not primarily as a statement about Mary, but about Christ: if Jesus is truly God, then the woman who bore him is truly the Mother of God. The feast also commemorates the circumcision and naming of Jesus, eight days after his birth, as prescribed by Jewish law.',
      fr: 'Le 1er janvier, huit jours après Noël, l\'Église célèbre la plus ancienne fête mariale du calendrier occidental. Le titre de « Mère de Dieu » (Théotokos) fut défini au Concile d\'Éphèse en 431 — non pas principalement comme une affirmation sur Marie, mais sur le Christ : si Jésus est vraiment Dieu, alors la femme qui l\'a porté est vraiment la Mère de Dieu. La fête commémore aussi la circoncision et le nom donné à Jésus, huit jours après sa naissance, selon la loi juive.',
    },
    theology: {
      en: 'This feast asks a startling question: what does it mean that God had a mother? That the infinite was held by finite arms, that the Creator nursed at a human breast? Mary\'s motherhood grounds the incarnation in physical reality — God did not merely appear as human, he was born, held, fed, and named by a human woman. The feast also falls on the World Day of Peace, linking Mary\'s "yes" to God with the world\'s longing for peace.',
      fr: 'Cette fête pose une question stupéfiante : que signifie le fait que Dieu ait eu une mère ? Que l\'infini fut tenu par des bras finis, que le Créateur fut nourri au sein d\'une femme ? La maternité de Marie ancre l\'incarnation dans la réalité physique — Dieu n\'a pas simplement paru humain, il est né, a été tenu, nourri et nommé par une femme humaine. La fête tombe aussi le Jour mondial de la paix, liant le « oui » de Marie à Dieu avec l\'aspiration du monde à la paix.',
    },
    france: {
      en: 'In France, January 1 blends secular New Year celebrations with this ancient feast. Many families attend morning Mass before or after réveillon festivities. The tradition of the "étrennes" (New Year gifts, distinct from Christmas gifts) has roots in this feast day. In some regions, the day begins with a procession and special prayers for peace.',
      fr: 'En France, le 1er janvier mêle les célébrations séculières du Nouvel An avec cette fête ancienne. Beaucoup de familles assistent à la messe du matin avant ou après les festivités du réveillon. La tradition des « étrennes » (cadeaux du Nouvel An, distincts des cadeaux de Noël) a ses racines dans cette fête. Dans certaines régions, la journée commence par une procession et des prières spéciales pour la paix.',
    },
    practice: {
      en: 'As you begin a new year, consider Mary\'s posture: she "treasured all these things and pondered them in her heart." Before making resolutions, take time to ponder — what has God been doing in your life? What deserves to be carried forward?',
      fr: 'En commençant une nouvelle année, considérez l\'attitude de Marie : elle « gardait toutes ces choses et les méditait dans son cœur ». Avant de prendre des résolutions, prenez le temps de méditer — qu\'a fait Dieu dans votre vie ? Qu\'est-ce qui mérite d\'être porté plus loin ?',
    },
    scripture: [
      { ref: 'Luke 2:16-21', refFr: 'Luc 2, 16-21' },
      { ref: 'Numbers 6:22-27', refFr: 'Nombres 6, 22-27' },
      { ref: 'Galatians 4:4-7', refFr: 'Galates 4, 4-7' },
    ],
  },

  'Epiphany': {
    origin: {
      en: 'Epiphany (January 6) celebrates the visit of the Magi — wise men from the East who followed a star to find the newborn King of the Jews. They brought gifts of gold (for a king), frankincense (for God), and myrrh (for one who would die). Warned in a dream not to return to Herod, they went home by another route. The word "epiphany" means "manifestation" — this feast celebrates Christ\'s revelation to the nations beyond Israel, represented by these foreign visitors.',
      fr: 'L\'Épiphanie (6 janvier) célèbre la visite des Mages — des sages venus d\'Orient qui suivirent une étoile pour trouver le nouveau-né Roi des Juifs. Ils apportèrent de l\'or (pour un roi), de l\'encens (pour Dieu) et de la myrrhe (pour celui qui mourrait). Avertis en songe de ne pas retourner chez Hérode, ils rentrèrent par un autre chemin. Le mot « épiphanie » signifie « manifestation » — cette fête célèbre la révélation du Christ aux nations au-delà d\'Israël, représentées par ces visiteurs étrangers.',
    },
    theology: {
      en: 'The Epiphany carries a subversive message: God revealed himself first not to the religious establishment but to foreign astrologers following a star. The Magi represent everyone who searches for truth outside conventional channels — and finds it. Their gifts prophesy Christ\'s identity and destiny. And their departure "by another route" is the first conversion story: encountering Christ changes your path.',
      fr: 'L\'Épiphanie porte un message subversif : Dieu s\'est révélé d\'abord non à l\'establishment religieux mais à des astrologues étrangers suivant une étoile. Les Mages représentent tous ceux qui cherchent la vérité en dehors des canaux conventionnels — et la trouvent. Leurs cadeaux prophétisent l\'identité et le destin du Christ. Et leur départ « par un autre chemin » est la première histoire de conversion : rencontrer le Christ change votre route.',
    },
    france: {
      en: 'Epiphany in France is synonymous with the **Galette des Rois** (King\'s Cake) — one of France\'s most beloved food traditions. A flaky puff pastry cake filled with frangipane (almond cream) conceals a small figurine called a **fève**. The youngest person at the table hides under it and calls out who gets each slice. Whoever finds the fève becomes king or queen for the day and wears a golden paper crown. Bakeries across France sell galettes throughout January — it\'s the single best-selling pastry of the year.\n\nIn southern France (Provence, Languedoc), the tradition features a **couronne des rois** — a brioche ring decorated with candied fruits — rather than the northern frangipane galette. In some families, a second piece is always cut: the "part du pauvre" (the poor person\'s share), originally set aside for an unexpected visitor or a beggar.\n\nLiturgically, some parishes celebrate the feast with a star-guided procession, recalling the Magi\'s journey.',
      fr: 'L\'Épiphanie en France est synonyme de la **Galette des Rois** — l\'une des traditions alimentaires les plus aimées de France. Une galette feuilletée fourrée de frangipane (crème d\'amande) dissimule une petite figurine appelée **fève**. Le plus jeune de la table se cache dessous et désigne qui reçoit chaque part. Celui qui trouve la fève devient roi ou reine du jour et porte une couronne dorée en papier. Les boulangeries de toute la France vendent des galettes tout le mois de janvier — c\'est la pâtisserie la plus vendue de l\'année.\n\nDans le sud de la France (Provence, Languedoc), la tradition présente une **couronne des rois** — une brioche en forme d\'anneau décorée de fruits confits — plutôt que la galette frangipane du nord. Dans certaines familles, une deuxième part est toujours coupée : la « part du pauvre », originellement réservée à un visiteur inattendu ou un mendiant.\n\nLiturgiquement, certaines paroisses célèbrent la fête avec une procession guidée par une étoile, rappelant le voyage des Mages.',
    },
    practice: {
      en: 'Share a Galette des Rois with family or friends — the tradition is joyful and easy to participate in. As you eat, reflect: what star are you following? What gifts do you bring to the encounter with God?',
      fr: 'Partagez une Galette des Rois en famille ou entre amis — la tradition est joyeuse et facile à vivre. En mangeant, réfléchissez : quelle étoile suivez-vous ? Quels dons apportez-vous à la rencontre avec Dieu ?',
    },
    scripture: [
      { ref: 'Matthew 2:1-12', refFr: 'Matthieu 2, 1-12' },
      { ref: 'Isaiah 60:1-6', refFr: 'Isaïe 60, 1-6' },
      { ref: 'Ephesians 3:2-6', refFr: 'Éphésiens 3, 2-6' },
    ],
  },

  'Christmas Day': {
    origin: {
      en: 'Christmas celebrates the birth of Jesus Christ in Bethlehem. Mary and Joseph, having traveled from Nazareth for a Roman census, found no room at the inn. Jesus was born in humble circumstances and laid in a manger — a feeding trough for animals. Shepherds, alerted by angels, were the first visitors. The date of December 25 was established by the 4th century, possibly to Christianize the Roman feast of Sol Invictus (the Unconquered Sun) — a fitting symbol, as Christ is called the "light of the world."',
      fr: 'Noël célèbre la naissance de Jésus-Christ à Bethléem. Marie et Joseph, ayant voyagé depuis Nazareth pour un recensement romain, ne trouvèrent pas de place à l\'auberge. Jésus naquit dans des circonstances humbles et fut couché dans une mangeoire — une auge pour les animaux. Les bergers, alertés par les anges, furent les premiers visiteurs. La date du 25 décembre fut établie au IVe siècle, possiblement pour christianiser la fête romaine du Sol Invictus (le Soleil invaincu) — un symbole approprié, car le Christ est appelé la « lumière du monde ».',
    },
    theology: {
      en: 'The incarnation — God becoming human — is Christianity\'s most radical claim. Not that God appeared in human form (many religions have that), but that God became fully, permanently, vulnerably human. A baby who needed to be fed, changed, and held. The Creator of the universe, helpless in a manger. Christmas says: God is not distant, not abstract, not indifferent to the human condition. He entered it. And by entering it, he transformed it from within.',
      fr: 'L\'incarnation — Dieu devenant humain — est l\'affirmation la plus radicale du christianisme. Non que Dieu soit apparu sous forme humaine (beaucoup de religions ont cela), mais que Dieu soit devenu pleinement, définitivement, vulnérablement humain. Un bébé qui avait besoin d\'être nourri, changé et porté. Le Créateur de l\'univers, sans défense dans une mangeoire. Noël dit : Dieu n\'est pas distant, ni abstrait, ni indifférent à la condition humaine. Il y est entré. Et en y entrant, il l\'a transformée de l\'intérieur.',
    },
    france: {
      en: 'Christmas in France is a deeply layered celebration blending sacred and secular traditions. The **Réveillon de Noël** (Christmas Eve dinner) is the centerpiece — a grand, multi-course meal that can last well past midnight. Traditional dishes vary by region: foie gras and oysters as starters, roast turkey or capon (chapon) as the main course, and the iconic **bûche de Noël** (Yule log cake) for dessert.\n\nMany families attend **Messe de Minuit** (Midnight Mass) — though it often starts at 10 or 11 PM now. Churches are decorated with nativity scenes, and in Provence, elaborate **crèches** with hand-painted clay figurines called **santons** (little saints) depict not just the Holy Family but entire Provençal village scenes.\n\nIn Alsace, Christmas markets (**Marchés de Noël**) — the oldest in France, dating to 1570 in Strasbourg — transform city centers into magical displays of lights, crafts, and vin chaud (mulled wine). The tradition of the Christmas tree also entered France through Alsace.\n\nFrench children traditionally place their shoes by the fireplace for Père Noël to fill. In some regions, Saint Nicholas (December 6) brings gifts separately from Christmas.',
      fr: 'Noël en France est une célébration aux multiples couches mêlant traditions sacrées et profanes. Le **Réveillon de Noël** en est la pièce maîtresse — un grand repas de plusieurs plats qui peut durer bien au-delà de minuit. Les plats traditionnels varient selon les régions : foie gras et huîtres en entrée, dinde rôtie ou chapon en plat principal, et l\'iconique **bûche de Noël** en dessert.\n\nBeaucoup de familles assistent à la **Messe de Minuit** — bien qu\'elle commence souvent à 22h ou 23h maintenant. Les églises sont décorées de crèches, et en Provence, des **crèches** élaborées avec des figurines en argile peintes à la main appelées **santons** (petits saints) représentent non seulement la Sainte Famille mais des scènes entières de village provençal.\n\nEn Alsace, les **Marchés de Noël** — les plus anciens de France, datant de 1570 à Strasbourg — transforment les centres-villes en décors féeriques de lumières, d\'artisanat et de vin chaud. La tradition du sapin de Noël est aussi entrée en France par l\'Alsace.\n\nLes enfants français placent traditionnellement leurs chaussures devant la cheminée pour que le Père Noël les remplisse. Dans certaines régions, saint Nicolas (6 décembre) apporte des cadeaux séparément de Noël.',
    },
    practice: {
      en: 'Amid the gifts and gatherings, take a moment to sit with the nativity scene — really look at it. A homeless baby born to refugees in an occupied country. God chose to enter the world not through power but through vulnerability. What does that say about where God is present today?',
      fr: 'Au milieu des cadeaux et des rassemblements, prenez un moment pour vous asseoir devant la crèche — regardez-la vraiment. Un bébé sans-abri né de réfugiés dans un pays occupé. Dieu a choisi d\'entrer dans le monde non par la puissance mais par la vulnérabilité. Qu\'est-ce que cela dit de l\'endroit où Dieu est présent aujourd\'hui ?',
    },
    scripture: [
      { ref: 'Luke 2:1-20', refFr: 'Luc 2, 1-20' },
      { ref: 'John 1:1-14', refFr: 'Jean 1, 1-14' },
      { ref: 'Isaiah 9:1-6', refFr: 'Isaïe 9, 1-6' },
    ],
  },

  'All Saints\' Day': {
    origin: {
      en: 'All Saints\' Day (November 1) honors all the saints — known and unknown — who have entered heaven. Originally celebrated in May, it was moved to November 1 in the 8th century, possibly to Christianize the Celtic festival of Samhain. The feast recognizes that holiness is not reserved for the famous or canonized: countless unnamed people have lived lives of extraordinary faithfulness. They are the "great cloud of witnesses" (Hebrews 12:1) surrounding us.',
      fr: 'La Toussaint (1er novembre) honore tous les saints — connus et inconnus — qui sont entrés au ciel. Célébrée à l\'origine en mai, elle fut déplacée au 1er novembre au VIIIe siècle, possiblement pour christianiser la fête celtique de Samhain. La fête reconnaît que la sainteté n\'est pas réservée aux célèbres ou aux canonisés : d\'innombrables personnes anonymes ont vécu des vies d\'une fidélité extraordinaire. Ils sont la « grande nuée de témoins » (Hébreux 12, 1) qui nous entoure.',
    },
    theology: {
      en: 'All Saints\' Day makes a bold claim: holiness is possible. Not perfection — the saints were deeply flawed people — but a life oriented toward God with enough consistency that it bore fruit. The feast also affirms the communion of saints: the living and the dead are connected in one body. Those who have gone before us are not gone; they are present in a way we don\'t fully understand. All Saints\' Day says: you are not alone in this. Others have walked this path before you, and they are cheering you on.',
      fr: 'La Toussaint fait une affirmation audacieuse : la sainteté est possible. Pas la perfection — les saints étaient des personnes profondément imparfaites — mais une vie orientée vers Dieu avec assez de constance pour porter du fruit. La fête affirme aussi la communion des saints : les vivants et les morts sont liés dans un seul corps. Ceux qui nous ont précédés ne sont pas partis ; ils sont présents d\'une manière que nous ne comprenons pas entièrement. La Toussaint dit : vous n\'êtes pas seul dans cette aventure. D\'autres ont marché sur ce chemin avant vous, et ils vous encouragent.',
    },
    france: {
      en: 'La Toussaint is a public holiday in France and one of the most widely observed feasts, even by non-practicing families. The central tradition is visiting cemeteries to honor deceased relatives. Families clean graves, place **chrysanthèmes** (chrysanthemums) — France\'s quintessential flower of remembrance — and spend time in quiet reflection. French florists sell millions of chrysanthemum pots in the days before November 1; it\'s the single largest flower-buying occasion of the year.\n\nSchools are on vacation during "les vacances de la Toussaint" (fall break), making it a family period. In Brittany and other Celtic-influenced regions, the connection to ancient Samhain traditions is still felt: candles are lit for the dead, and some communities hold vigils.\n\nThough technically November 2 (All Souls\' Day) is the day for praying for the deceased, in French practice the two days merge, with Toussaint carrying both celebrations. Masses on this day are among the best attended of the year.',
      fr: 'La Toussaint est un jour férié en France et l\'une des fêtes les plus observées, même par les familles non-pratiquantes. La tradition centrale est de visiter les cimetières pour honorer les parents défunts. Les familles nettoient les tombes, déposent des **chrysanthèmes** — la fleur par excellence du souvenir en France — et passent du temps en recueillement. Les fleuristes français vendent des millions de pots de chrysanthèmes dans les jours précédant le 1er novembre ; c\'est la plus grande occasion d\'achat de fleurs de l\'année.\n\nLes écoles sont en vacances pendant « les vacances de la Toussaint », ce qui en fait une période familiale. En Bretagne et dans d\'autres régions d\'influence celtique, le lien avec les anciennes traditions de Samhain est encore perceptible : des bougies sont allumées pour les morts, et certaines communautés tiennent des veillées.\n\nBien que techniquement le 2 novembre (Jour des Défunts) soit le jour pour prier pour les défunts, dans la pratique française les deux jours fusionnent, la Toussaint portant les deux célébrations. Les messes de ce jour sont parmi les plus fréquentées de l\'année.',
    },
    practice: {
      en: 'Visit a cemetery today if you can — even if you have no family buried there. The practice of tending graves connects you to the communion of saints in a physical way. Light a candle for someone who shaped your faith. Name them. Remember that you are part of a story much larger than your own life.',
      fr: 'Visitez un cimetière aujourd\'hui si vous le pouvez — même si vous n\'y avez pas de famille enterrée. La pratique d\'entretenir les tombes vous connecte à la communion des saints de manière physique. Allumez une bougie pour quelqu\'un qui a façonné votre foi. Nommez-le. Souvenez-vous que vous faites partie d\'une histoire bien plus grande que votre propre vie.',
    },
    scripture: [
      { ref: 'Revelation 7:2-4, 9-14', refFr: 'Apocalypse 7, 2-4.9-14' },
      { ref: 'Matthew 5:1-12', refFr: 'Matthieu 5, 1-12' },
      { ref: 'Hebrews 12:1-2', refFr: 'Hébreux 12, 1-2' },
    ],
  },

  'The Assumption': {
    origin: {
      en: 'The Assumption (August 15) celebrates the belief that Mary, at the end of her earthly life, was taken body and soul into heaven. Though not explicitly described in Scripture, the tradition dates to the earliest centuries of Christianity. It was defined as dogma by Pope Pius XII in 1950. The feast reflects the ancient Christian conviction that Mary, who bore God in her body, was the first to share fully in the resurrection that awaits all believers.',
      fr: 'L\'Assomption (15 août) célèbre la croyance que Marie, à la fin de sa vie terrestre, fut élevée corps et âme au ciel. Bien que non explicitement décrite dans les Écritures, la tradition remonte aux premiers siècles du christianisme. Elle fut définie comme dogme par le pape Pie XII en 1950. La fête reflète la conviction chrétienne ancienne que Marie, qui porta Dieu dans son corps, fut la première à partager pleinement la résurrection qui attend tous les croyants.',
    },
    theology: {
      en: 'The Assumption makes a claim about the body: it matters. In a world that often treats the body as inferior to the soul, this feast insists that God honors the whole person — body and soul together. Mary\'s assumption is a preview of what Christians believe awaits everyone: not escape from the body but its transformation and glorification. The feast also honors Mary\'s unique role: the body that carried, nursed, and raised the Son of God was not abandoned to decay.',
      fr: 'L\'Assomption fait une affirmation sur le corps : il compte. Dans un monde qui traite souvent le corps comme inférieur à l\'âme, cette fête insiste que Dieu honore la personne entière — corps et âme ensemble. L\'assomption de Marie est un aperçu de ce que les chrétiens croient attendre chacun : non l\'évasion du corps mais sa transformation et sa glorification. La fête honore aussi le rôle unique de Marie : le corps qui porta, nourrit et éleva le Fils de Dieu ne fut pas abandonné à la corruption.',
    },
    france: {
      en: 'August 15 is a public holiday in France — and one of the most significant. The Assumption has been France\'s national Marian feast since Louis XIII consecrated France to the Virgin Mary in 1638. The day features elaborate processions in many cities and towns. In Marseille, the procession to Notre-Dame de la Garde is a major event. In Lourdes, the Assumption draws one of the year\'s largest pilgrimages.\n\nFalling in the heart of les grandes vacances (summer holidays), August 15 is also a major family gathering day. Coastal towns hold fireworks, markets, and fêtes. In many rural communities, the day combines religious observance with village festivals.\n\nThe "vœu de Louis XIII" (vow of Louis XIII) is still commemorated in some parishes, with special prayers for France. In Paris, a Marian procession on the Seine has been revived in recent years.',
      fr: 'Le 15 août est un jour férié en France — et l\'un des plus significatifs. L\'Assomption est la fête mariale nationale de la France depuis que Louis XIII consacra la France à la Vierge Marie en 1638. La journée présente des processions élaborées dans de nombreuses villes. À Marseille, la procession vers Notre-Dame de la Garde est un événement majeur. À Lourdes, l\'Assomption attire l\'un des plus grands pèlerinages de l\'année.\n\nTombant au cœur des grandes vacances, le 15 août est aussi un grand jour de rassemblement familial. Les villes côtières organisent feux d\'artifice, marchés et fêtes. Dans beaucoup de communautés rurales, le jour combine observance religieuse et fêtes de village.\n\nLe « vœu de Louis XIII » est encore commémoré dans certaines paroisses, avec des prières spéciales pour la France. À Paris, une procession mariale sur la Seine a été ravivée ces dernières années.',
    },
    practice: {
      en: 'Today, honor the physical. Your body is not a prison for your soul — it is part of who you are, and God has plans for it. Take care of it. Also consider: what does it mean to say "yes" to God the way Mary did, fully and without reservation?',
      fr: 'Aujourd\'hui, honorez le physique. Votre corps n\'est pas une prison pour votre âme — il fait partie de qui vous êtes, et Dieu a des projets pour lui. Prenez-en soin. Considérez aussi : que signifie dire « oui » à Dieu comme Marie l\'a fait, pleinement et sans réserve ?',
    },
    scripture: [
      { ref: 'Revelation 12:1-6', refFr: 'Apocalypse 12, 1-6' },
      { ref: 'Luke 1:39-56', refFr: 'Luc 1, 39-56' },
      { ref: '1 Corinthians 15:20-26', refFr: '1 Corinthiens 15, 20-26' },
    ],
  },

  // ─── SEASONS ─────────────────────────────────────────────

  'Advent': {
    origin: {
      en: 'Advent (from the Latin "adventus," meaning "coming") is the four-week season of preparation before Christmas. It emerged in the 4th-5th centuries, originally as a period of fasting and penance (a "Little Lent"). Over time, its character shifted toward joyful expectation. The season has a double focus: preparing to celebrate Christ\'s first coming at Christmas, and anticipating his promised return at the end of time.',
      fr: 'L\'Avent (du latin « adventus », signifiant « venue ») est la période de quatre semaines de préparation avant Noël. Il émergea aux IVe-Ve siècles, d\'abord comme période de jeûne et de pénitence (un « petit Carême »). Au fil du temps, son caractère s\'est orienté vers l\'attente joyeuse. La saison a un double focus : se préparer à célébrer la première venue du Christ à Noël, et anticiper son retour promis à la fin des temps.',
    },
    theology: {
      en: 'Advent teaches the spiritual discipline of waiting — something our culture is terrible at. In a world of instant gratification, Advent says: some things are worth waiting for. The season uses the imagery of darkness and light: days are short, candles are lit one by one, the world waits for dawn. But Advent waiting is not passive; it is active preparation. The prophets cry out: prepare the way! Make straight the paths! Advent asks: what needs to be cleared away in your life to make room for God?',
      fr: 'L\'Avent enseigne la discipline spirituelle de l\'attente — quelque chose dans laquelle notre culture est terrible. Dans un monde de gratification instantanée, l\'Avent dit : certaines choses valent la peine d\'être attendues. La saison utilise l\'imagerie de l\'obscurité et de la lumière : les jours sont courts, les bougies sont allumées une à une, le monde attend l\'aube. Mais l\'attente de l\'Avent n\'est pas passive ; c\'est une préparation active. Les prophètes crient : préparez le chemin ! Aplanissez les sentiers ! L\'Avent demande : qu\'est-ce qui doit être dégagé dans votre vie pour faire de la place à Dieu ?',
    },
    france: {
      en: 'Advent in France is marked by the **Calendrier de l\'Avent** (Advent calendar), the lighting of the **Couronne de l\'Avent** (Advent wreath) with four candles (three purple, one rose for Gaudete Sunday), and the beloved **Marchés de Noël** that open across the country. Strasbourg\'s market — the Christkindelsmärik, founded in 1570 — is the oldest and most famous in France.\n\nIn many French families, the Advent wreath is placed on the dining table, and a candle is lit each Sunday before the meal. Children open a window of the Advent calendar each morning. In Provence, families set up the crèche (nativity scene) at the start of Advent, adding a new santon each day.\n\nThe liturgical color is purple (violet), shifting to rose on the third Sunday (Gaudete — "Rejoice"). The "O Antiphons," sung in the final week before Christmas, are among the most beautiful chants in the Western tradition.',
      fr: 'L\'Avent en France est marqué par le **Calendrier de l\'Avent**, l\'allumage de la **Couronne de l\'Avent** avec quatre bougies (trois violettes, une rose pour le dimanche de Gaudete), et les **Marchés de Noël** qui ouvrent à travers le pays. Le marché de Strasbourg — le Christkindelsmärik, fondé en 1570 — est le plus ancien et le plus célèbre de France.\n\nDans beaucoup de familles françaises, la couronne de l\'Avent est placée sur la table de la salle à manger, et une bougie est allumée chaque dimanche avant le repas. Les enfants ouvrent une fenêtre du calendrier de l\'Avent chaque matin. En Provence, les familles installent la crèche au début de l\'Avent, ajoutant un nouveau santon chaque jour.\n\nLa couleur liturgique est le violet, passant au rose le troisième dimanche (Gaudete — « Réjouissez-vous »). Les « antiennes en O », chantées dans la dernière semaine avant Noël, comptent parmi les plus beaux chants de la tradition occidentale.',
    },
    practice: {
      en: 'Light a candle each Sunday of Advent. Read one chapter of Isaiah per week. Resist the cultural pressure to celebrate Christmas early — let the waiting do its work. The joy of Christmas is deeper when you\'ve truly waited for it.',
      fr: 'Allumez une bougie chaque dimanche de l\'Avent. Lisez un chapitre d\'Isaïe par semaine. Résistez à la pression culturelle de célébrer Noël en avance — laissez l\'attente faire son œuvre. La joie de Noël est plus profonde quand vous l\'avez vraiment attendue.',
    },
    scripture: [
      { ref: 'Isaiah 40:1-5', refFr: 'Isaïe 40, 1-5' },
      { ref: 'Luke 1:26-38', refFr: 'Luc 1, 26-38' },
      { ref: 'Matthew 3:1-3', refFr: 'Matthieu 3, 1-3' },
    ],
  },

  'Lent': {
    origin: {
      en: 'Lent is the 40-day season of preparation before Easter, beginning on Ash Wednesday and ending on Holy Saturday. The practice dates to the earliest centuries of Christianity, when it served as the final preparation period for catechumens (adults preparing for baptism at Easter). Over time, the entire community joined in the observance. The 40 days echo Jesus\' 40 days of fasting in the desert, Moses\' 40 days on Mount Sinai, and Israel\'s 40 years of wandering.',
      fr: 'Le Carême est la période de 40 jours de préparation avant Pâques, commençant le Mercredi des Cendres et se terminant le Samedi Saint. La pratique remonte aux premiers siècles du christianisme, quand elle servait de période de préparation finale pour les catéchumènes (adultes se préparant au baptême à Pâques). Au fil du temps, toute la communauté s\'est jointe à l\'observance. Les 40 jours font écho aux 40 jours de jeûne de Jésus au désert, aux 40 jours de Moïse au Mont Sinaï, et aux 40 ans d\'errance d\'Israël.',
    },
    theology: {
      en: 'Lent is not about self-punishment. It is about clearing space. The three traditional Lenten practices — fasting, prayer, and almsgiving — each attack a different form of clutter. Fasting clears physical dependency and resets desire. Prayer clears mental noise and creates room for God. Almsgiving clears the grip of possessions and opens the heart to others. Together, they are a spring cleaning of the soul. Lent asks: what would your life look like with less? Less distraction, less consumption, less self-focus?',
      fr: 'Le Carême n\'est pas de l\'autopunition. C\'est faire de la place. Les trois pratiques traditionnelles du Carême — le jeûne, la prière et l\'aumône — attaquent chacune une forme différente d\'encombrement. Le jeûne dégage la dépendance physique et réinitialise le désir. La prière dégage le bruit mental et crée de l\'espace pour Dieu. L\'aumône desserre l\'emprise des possessions et ouvre le cœur aux autres. Ensemble, elles sont un grand ménage de l\'âme. Le Carême demande : à quoi ressemblerait votre vie avec moins ? Moins de distraction, moins de consommation, moins de centrage sur soi ?',
    },
    france: {
      en: 'In France, Lent begins with the dramatic contrast of Mardi Gras (literally "Fat Tuesday") and Ash Wednesday. Mardi Gras is celebrated with crêpes, beignets, and carnival festivities — a last indulgence before the fast. Nice hosts France\'s most famous carnival.\n\nTraditionally, French Catholics give up meat, sweets, alcohol, or other pleasures. The practice of "faire carême" (keeping Lent) is less universal than it once was, but it\'s seeing a cultural resurgence among younger Catholics. Many parishes organize "parcours de Carême" — structured weekly programs of reflection, community service, and prayer.\n\nLenten Fridays without meat have left a deep mark on French cuisine: the rich tradition of fish dishes, from brandade de morue to sole meunière, developed partly as creative Lenten cooking.',
      fr: 'En France, le Carême commence avec le contraste dramatique du Mardi Gras et du Mercredi des Cendres. Le Mardi Gras est célébré avec des crêpes, des beignets et des festivités de carnaval — une dernière indulgence avant le jeûne. Nice accueille le carnaval le plus célèbre de France.\n\nTraditionnellement, les catholiques français renoncent à la viande, aux sucreries, à l\'alcool ou à d\'autres plaisirs. La pratique de « faire carême » est moins universelle qu\'autrefois, mais connaît un regain culturel parmi les jeunes catholiques. Beaucoup de paroisses organisent des « parcours de Carême » — des programmes hebdomadaires structurés de réflexion, service communautaire et prière.\n\nLes vendredis de Carême sans viande ont laissé une empreinte profonde sur la cuisine française : la riche tradition des plats de poisson, de la brandade de morue à la sole meunière, s\'est développée en partie comme cuisine créative du Carême.',
    },
    practice: {
      en: 'Choose one concrete practice for the season — fasting, prayer, or generosity. Make it specific and daily. The best Lenten discipline is the one that costs you something real, not a token gesture. And remember: Sundays are not counted in the 40 days — they are mini-Easters, even in Lent.',
      fr: 'Choisissez une pratique concrète pour la saison — jeûne, prière ou générosité. Rendez-la spécifique et quotidienne. La meilleure discipline de Carême est celle qui vous coûte quelque chose de réel, pas un geste symbolique. Et rappelez-vous : les dimanches ne sont pas comptés dans les 40 jours — ce sont des mini-Pâques, même en Carême.',
    },
    scripture: [
      { ref: 'Matthew 4:1-11', refFr: 'Matthieu 4, 1-11' },
      { ref: 'Psalm 51', refFr: 'Psaume 51' },
      { ref: 'Isaiah 58:6-9', refFr: 'Isaïe 58, 6-9' },
    ],
  },

  'Easter Season': {
    origin: {
      en: 'The Easter Season — also called Eastertide — spans the 50 days from Easter Sunday to Pentecost. This "Great Fifty Days" was celebrated as a single, unified feast from the earliest centuries. During this time, the Church meditates on the post-resurrection appearances of Christ, the preparation of the disciples for his departure, and the promise of the Holy Spirit. Fasting was forbidden during Eastertide — it is, by definition, a season of joy.',
      fr: 'Le Temps pascal s\'étend sur les 50 jours de Pâques à la Pentecôte. Ces « Cinquante Grands Jours » étaient célébrés comme une fête unique et unifiée dès les premiers siècles. Pendant ce temps, l\'Église médite sur les apparitions post-résurrection du Christ, la préparation des disciples à son départ, et la promesse du Saint-Esprit. Le jeûne était interdit pendant le Temps pascal — c\'est, par définition, une saison de joie.',
    },
    theology: {
      en: 'The Easter Season exists because resurrection is too big for a single day. Fifty days of "Alleluia" — a word absent throughout Lent — train us to live in the reality of the resurrection. The season follows the disciples\' own experience: from initial shock and disbelief, through joyful encounters with the risen Christ, to his departure at the Ascension, and finally the explosive arrival of the Spirit at Pentecost. It is a school for learning to live in a world where death has been defeated but not yet eliminated.',
      fr: 'Le Temps pascal existe parce que la résurrection est trop grande pour un seul jour. Cinquante jours d\'« Alléluia » — un mot absent tout au long du Carême — nous forment à vivre dans la réalité de la résurrection. La saison suit l\'expérience propre des disciples : du choc initial et de l\'incrédulité, à travers des rencontres joyeuses avec le Christ ressuscité, jusqu\'à son départ à l\'Ascension, et enfin l\'arrivée explosive de l\'Esprit à la Pentecôte. C\'est une école pour apprendre à vivre dans un monde où la mort a été vaincue mais pas encore éliminée.',
    },
    france: {
      en: 'The Easter Season in France encompasses two public holidays — Easter Monday and Ascension Thursday — and culminates at Pentecost. It coincides with the arrival of spring, and French Catholic life takes on a lighter, more outdoor character. First Communions are celebrated during this period, often in May, with elaborate family gatherings. May is also Mary\'s month, and many parishes organize Marian devotions, May crownings, and pilgrimages to Marian shrines (Lourdes, La Salette, Rocamadour).',
      fr: 'Le Temps pascal en France englobe deux jours fériés — le Lundi de Pâques et le Jeudi de l\'Ascension — et culmine à la Pentecôte. Il coïncide avec l\'arrivée du printemps, et la vie catholique française prend un caractère plus léger et plus extérieur. Les premières communions sont célébrées pendant cette période, souvent en mai, avec des rassemblements familiaux élaborés. Mai est aussi le mois de Marie, et beaucoup de paroisses organisent des dévotions mariales, des couronnements de mai et des pèlerinages vers les sanctuaires mariaux (Lourdes, La Salette, Rocamadour).',
    },
    practice: {
      en: 'Say "Alleluia" freely — it\'s back after 40 days of absence. Let the joy of Easter unfold over weeks, not just a single Sunday. Each day during this season, read one of the post-resurrection appearances (John 20-21, Luke 24, Acts 1). Notice how the risen Christ meets people where they are: in grief, in doubt, in work, in meals.',
      fr: 'Dites « Alléluia » librement — il est de retour après 40 jours d\'absence. Laissez la joie de Pâques se déployer sur des semaines, pas seulement un seul dimanche. Chaque jour pendant cette saison, lisez une des apparitions post-résurrection (Jean 20-21, Luc 24, Actes 1). Remarquez comment le Christ ressuscité rencontre les gens là où ils sont : dans le deuil, dans le doute, dans le travail, dans les repas.',
    },
    scripture: [
      { ref: 'John 20:19-29', refFr: 'Jean 20, 19-29' },
      { ref: 'Acts 1:1-8', refFr: 'Actes 1, 1-8' },
      { ref: 'Revelation 21:1-5', refFr: 'Apocalypse 21, 1-5' },
    ],
  },

  'Ordinary Time': {
    origin: {
      en: 'Ordinary Time — "ordinary" from the Latin "ordinalis" meaning "counted" (numbered weeks), not "common" — spans two periods of the liturgical year: from Epiphany to Ash Wednesday, and from Pentecost to Advent. Together, these periods make up about 33 weeks. During Ordinary Time, the Church reads through Scripture systematically, following the Gospel narratives week by week. It is the season of growth, of daily faithfulness, of the long middle of the spiritual life.',
      fr: 'Le Temps ordinaire — « ordinaire » vient du latin « ordinalis » signifiant « compté » (semaines numérotées), non « commun » — couvre deux périodes de l\'année liturgique : de l\'Épiphanie au Mercredi des Cendres, et de la Pentecôte à l\'Avent. Ensemble, ces périodes représentent environ 33 semaines. Pendant le Temps ordinaire, l\'Église parcourt les Écritures systématiquement, suivant les récits évangéliques semaine après semaine. C\'est la saison de la croissance, de la fidélité quotidienne, du long milieu de la vie spirituelle.',
    },
    theology: {
      en: 'Ordinary Time is the most underrated season. It lacks the drama of Lent, the joy of Easter, the anticipation of Advent. But most of life is ordinary time — the daily work of loving, growing, failing, and trying again. The season teaches that holiness is not found primarily in peak experiences but in consistent faithfulness. The green vestments symbolize growth — slow, steady, often imperceptible, but real. Ordinary Time says: God is present in the unremarkable Tuesday as much as in the Easter sunrise.',
      fr: 'Le Temps ordinaire est la saison la plus sous-estimée. Il manque le drame du Carême, la joie de Pâques, l\'anticipation de l\'Avent. Mais la majeure partie de la vie est du temps ordinaire — le travail quotidien d\'aimer, de grandir, d\'échouer et de recommencer. La saison enseigne que la sainteté ne se trouve pas principalement dans les expériences de pointe mais dans la fidélité constante. Les ornements verts symbolisent la croissance — lente, régulière, souvent imperceptible, mais réelle. Le Temps ordinaire dit : Dieu est présent dans le mardi sans histoire autant que dans le lever de soleil de Pâques.',
    },
    france: {
      en: 'In France, Ordinary Time coincides with some of the most characteristically French celebrations: village fêtes, outdoor markets, the rhythm of school terms and vacations. Many parishes use this season for catechesis, Bible study groups, and community-building activities. The summer stretch of Ordinary Time overlaps with les grandes vacances, and church attendance drops — but pilgrimages peak, especially to Lourdes, Chartres, and the Camino de Santiago through southern France.',
      fr: 'En France, le Temps ordinaire coïncide avec certaines des célébrations les plus caractéristiquement françaises : fêtes de village, marchés en plein air, rythme des trimestres scolaires et des vacances. Beaucoup de paroisses utilisent cette saison pour la catéchèse, les groupes d\'étude biblique et les activités de construction communautaire. La période estivale du Temps ordinaire recoupe les grandes vacances, et la fréquentation des églises baisse — mais les pèlerinages culminent, surtout à Lourdes, Chartres et sur le Chemin de Saint-Jacques à travers le sud de la France.',
    },
    practice: {
      en: 'In Ordinary Time, build a daily rhythm of prayer and Scripture. Don\'t wait for dramatic seasons — this is where the real work of faith happens. Choose a Gospel and read it straight through, a chapter a day. Let the ordinariness of it shape you.',
      fr: 'En Temps ordinaire, construisez un rythme quotidien de prière et d\'Écriture. N\'attendez pas les saisons dramatiques — c\'est ici que le vrai travail de la foi se fait. Choisissez un Évangile et lisez-le d\'un bout à l\'autre, un chapitre par jour. Laissez l\'ordinaire de cette démarche vous façonner.',
    },
    scripture: [
      { ref: 'Psalm 1', refFr: 'Psaume 1' },
      { ref: 'Colossians 3:12-17', refFr: 'Colossiens 3, 12-17' },
      { ref: 'Matthew 13:31-32', refFr: 'Matthieu 13, 31-32' },
    ],
  },
}

/**
 * Look up rich lore for a liturgical event by its English name.
 * Falls back to the current liturgical season name if no event-specific lore exists.
 */
export function getLore(eventName: string): LiturgicalLore | undefined {
  return LORE[eventName]
}

/** All event names that have lore entries */
export function getLoreKeys(): string[] {
  return Object.keys(LORE)
}
