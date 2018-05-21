var testString = `And so widi the sunshine and the great bursts of leaves 
growing on the trees, just as things grow in fast movies, 
I had that familiar conviction that life was beginning over 
again with the summer. 
Chris Froome
DICHTER:
O sprich mir nicht von jener bunten Menge,
Bei deren Anblick uns der Geist entflieht.
Verhülle mir das wogende Gedränge,
Das wider Willen uns zum Strudel zieht.
Nein, führe mich zur stillen Himmelsenge,
Wo nur dem Dichter reine Freude blüht;
Wo Lieb und Freundschaft unsres Herzens Segen
Mit Götterhand erschaffen und erpflegen.

Ach!  was in tiefer Brust uns da entsprungen,
Was sich die Lippe schüchtern vorgelallt,
Mißraten jetzt und jetzt vielleicht gelungen,
Verschlingt des wilden Augenblicks Gewalt.
Oft, wenn es erst durch Jahre durchgedrungen,
Erscheint es in vollendeter Gestalt.
Was glänzt, ist für den Augenblick geboren,
Das Echte bleibt der Nachwelt unverloren.

LUSTIGE PERSON:
Wenn ich nur nichts von Nachwelt hören sollte.
Gesetzt, daß ich von Nachwelt reden wollte,
Wer machte denn der Mitwelt Spaß?
Den will sie doch und soll ihn haben.
Die Gegenwart von einem braven Knaben
Ist, dächt ich, immer auch schon was.
Wer sich behaglich mitzuteilen weiß,
Den wird des Volkes Laune nicht erbittern;
Er wünscht sich einen großen Kreis,
Um ihn gewisser zu erschüttern.
Drum seid nur brav und zeigt euch musterhaft,
Laßt Phantasie, mit allen ihren Chören,
Vernunft, Verstand, Empfindung, Leidenschaft,
Doch, merkt euch wohl!  nicht ohne Narrheit hören.

DIREKTOR:
Besonders aber laßt genug geschehn!
Man kommt zu schaun, man will am liebsten sehn.
Wird vieles vor den Augen abgesponnen,
So daß die Menge staunend gaffen kann,
Da habt Ihr in der Breite gleich gewonnen,
Ihr seid ein vielgeliebter Mann.
Die Masse könnt Ihr nur durch Masse zwingen,
Ein jeder sucht sich endlich selbst was aus.
Wer vieles bringt, wird manchem etwas bringen;
Und jeder geht zufrieden aus dem Haus.
Gebt Ihr ein Stück, so gebt es gleich in Stücken!
Solch ein Ragout, es muß Euch glücken;
Leicht ist es vorgelegt, so leicht als ausgedacht.
Was hilft's, wenn Ihr ein Ganzes dargebracht?
Das Publikum wird es Euch doch zerpflücken.

DICHTER:
Ihr fühlet nicht, wie schlecht ein solches Handwerk sei!
Wie wenig das dem echten Künstler zieme!
Der saubern Herren Pfuscherei
Ist.  merk ich.  schon bei Euch Maxime.

DIREKTOR:
Ein solcher Vorwurf läßt mich ungekränkt:
Ein Mann, der recht zu wirken denkt,
Muß auf das beste Werkzeug halten.
Bedenkt, Ihr habet weiches Holz zu spalten,
Und seht nur hin, für wen Ihr schreibt!
Wenn diesen Langeweile treibt,
Kommt jener satt vom übertischten Mahle,
Und, was das Allerschlimmste bleibt,
Gar mancher kommt vom Lesen der Journale.
Man eilt zerstreut zu uns, wie zu den Maskenfesten,
Und Neugier nur beflügelt jeden Schritt;
Die Damen geben sich und ihren Putz zum besten
Und spielen ohne Gage mit.
Was träumet Ihr auf Eurer Dichterhöhe?
Was macht ein volles Haus Euch froh?
Beseht die Gönner in der Nähe!
Halb sind sie kalt, halb sind sie roh.
Der, nach dem Schauspiel, hofft ein Kartenspiel,
Der eine wilde Nacht an einer Dirne Busen.
Was plagt ihr armen Toren viel,
Zu solchem Zweck, die holden Musen?
Ich sag Euch, gebt nur mehr und immer, immer mehr,
So könnt Ihr Euch vom Ziele nie verirren
Sucht nur die Menschen zu verwirren,
Sie zu befriedigen, ist schwer--
Was fällt Euch an?  Entzückung oder Schmerzen?

DICHTER:
Geh hin und such dir einen andern Knecht!
Der Dichter sollte wohl das höchste Recht,
Das Menschenrecht, das ihm Natur vergönnt,
Um deinetwillen freventlich verscherzen!
Wodurch bewegt er alle Herzen?
Wodurch besiegt er jedes Element?
Ist es der Einklang nicht, der aus dem Busen dringt,
There was so much to read, for one thing, and so much 
fine health to be pulled down out of the young breath- 
giving air. I bought a dozen volumes on banking and credit 
and investment securities, and they stood on my shelf in 
red and gold like new money from the mint, promising to 
unfold the shining secrets that only Midas and Morgan 
and Marcenas knew. And I had the high intention of read- 
ing many other books besides. I was rather literary in 
college — one year I wrote a scries of very solemn and 
obvious editorials for the Yale News —and now I was go- 
ing to bring back all such things into my life and become 
again that most limited of all specialists, the 'well-rounded 
man.’ This isn’t just an epigram — life is much more 
successfully looked at fiom a single window, after all. 

It was a matter of chance that I should have rented a 
house in one of the strangest communities in North 
America. It was on that slender riotous island which ex- 
tends itself due east of New York — and where there are, 
among other natural curiosities, tw'o unusual formations of 
land. Twenty miles from the city a pair of enormous eggs, 
identical in contour and separated only by a courtesy bay, 
jut out into the most domesticated body of salt water in the 
(Western) hemisphere, the great wet barnyard of Long 
\n\nIsland Sound. They are not perfect ovals — like the egg in 
the Columbus story, they are both crushed flat at the con- 
tact end — but their physical resemblance must be a source 
of perpetual wonder to the gulls that fly overhead. To the 
wingless a more interesting phenomenon is their dissimil- 
arity in every particular except shape and size. 
`

var analyzer = require('../post-analyzer.js');

info = analyzer.count(testString + testString).wordCounts;

for( var word in info ) {
	var count = info[word];
	console.log(word) 
	var chars = [];
	for(var i = 0; i < word.length; i++){
		chars.push(word.charCodeAt(i)); 
	}
	console.log('Code: ' + chars.join(', '));
	console.log('Count: ' + count); 
}

