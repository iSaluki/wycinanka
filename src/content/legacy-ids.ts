/**
 * Sentence and drill ids from before ids were derived from the text. Sentences and drills used to be numbered
 * by position (u06-l1:s2, u06-l1:d3), and learners' review cards are stored under those ids. Anything listed
 * here keeps its old number wherever it now sits in the lesson; everything else gets an id from its text
 * (see build.ts). Never edit this file: it records what learners already have.
 */
export const LEGACY_IDS: Record<string, { s: string[]; d: string[] }> = {
  'u00-l1': {
    s: [],
    d: ["t___ (you)|y","k___t (cat)|o","m___j (my)|ó","s___r (cheese)|e"],
  },
  'u00-l2': {
    s: [],
    d: ["___oda (water)|w","ma___y (small)|ł","no___ (night)|c","___a (I)|j"],
  },
  'u00-l3': {
    s: [],
    d: ["___koła (school)|sz","___as (time)|cz","mo___e (sea)|rz","mo___e (maybe)|ż"],
  },
  'u00-l4': {
    s: [],
    d: ["Ka___a|si","___ocia (aunt)|ci","ko___ (horse)|ń","wie___ (village)|ś"],
  },
  'u00-l5': {
    s: [],
    d: ["r___ka (hand)|ę","s___ (they are)|ą","dzięku___ (thank you)|ję"],
  },
  'u00-l6': {
    s: [],
    d: ["t___y (three)|rz","___ęście (happiness)|szcz","chle___ (bread)|b"],
  },
  'u01-l1': {
    s: ["To jest kot.","To jest dom.","Tak, to woda."],
    d: ["___oda (water)|w","___ajko (egg)|j","no___ (night)|c"],
  },
  'u01-l2': {
    s: ["To jest szkoła.","Chleb i ser.","Mały kot."],
    d: ["___koła (school)|sz","___as (time)|cz","___eka (river)|rz","ma___y (small)|ł"],
  },
  'u01-l3': {
    s: ["Cześć, Kasia!","To jest ciocia.","To jest koń."],
    d: ["cze___ć (hi)|ś","___ocia (aunt)|ci","ko___ (horse)|ń","r___ka (hand)|ę"],
  },
  'u02-l1': {
    s: ["Dzień dobry, pani Anno!","Na razie, do zobaczenia!","Dobranoc, mamo."],
    d: [],
  },
  'u02-l2': {
    s: ["Dziękuję bardzo!","Przepraszam, proszę.","Nie ma za co.","Tak, w porządku."],
    d: [],
  },
  'u02-l3': {
    s: ["Dobrze, dziękuję. A ty?","Jak się pani ma?","Świetnie, dziękuję!"],
    d: ["Jak się ___? (to a friend)|masz","Jak się ___ ma? (to a woman you have just met)|pani","Jak się ___ ma? (to an older man)|pan"],
  },
  'u03-l1': {
    s: ["Jestem Tom.","Ona jest w domu.","My jesteśmy tutaj.","Oni są razem."],
    d: ["Ja ___ Anna.|jestem","Oni ___ w domu.|są","Ty ___ z Anglii?|jesteś","Marek ___ tutaj.|jest"],
  },
  'u03-l2': {
    s: ["Nazywam się Emma Smith.","Mam na imię Jack.","To jest mój przyjaciel, Adam.","Miło mi, jestem Kasia."],
    d: [],
  },
  'u03-l3': {
    s: ["Jestem z Anglii.","Skąd jesteś? Z Polski?","Kasia to Polka.","Mieszkam w Londynie, ale jestem ze Szkocji."],
    d: ["Jestem ___ Szkocji.|ze","Kasia to ___.|Polka","Tom to ___.|Anglik","Jestem z ___.|Walii"],
  },
  'u04-l1': {
    s: ["Gdzie jest mój telefon?","Gdzie jest moja torba?","To jest moje mieszkanie."],
    d: ["___ telefon|ten","___ książka|ta","___ okno|to","___ mieszkanie|to"],
  },
  'u04-l2': {
    s: ["To jest nowy telefon.","Ta książka jest dobra.","Moje mieszkanie jest małe.","Samochód jest drogi, ale ładny."],
    d: ["To jest ___ książka.|nowa","To jest ___ okno.|duże","Mój samochód jest ___.|stary","Kawa jest ___.|zimna"],
  },
  'u04-l3': {
    s: ["Co to jest? To jest herbata.","Kto to jest? To jest Marek.","Czy to jest twój telefon?","Telefon jest tutaj, ale torba jest tam."],
    d: [],
  },
  'u05-l1': {
    s: ["Dwa i dwa to cztery.","Pięć i pięć to dziesięć.","Trzy i sześć to dziewięć."],
    d: ["dwa + trzy = ___|pięć","cztery + cztery = ___|osiem","jeden + dwa = ___|trzy","pięć + pięć = ___|dziesięć"],
  },
  'u05-l2': {
    s: ["Mam dwadzieścia lat.","On ma trzydzieści pięć lat.","To kosztuje piętnaście złotych."],
    d: ["20 = ___|dwadzieścia","50 = ___|pięćdziesiąt","12 = ___|dwanaście","45 = czterdzieści ___|pięć"],
  },
  'u05-l3': {
    s: ["Ile to kosztuje?","To kosztuje dwa złote.","Płacę kartą, dziękuję."],
    d: ["jeden ___|złoty","dwa ___|złote","pięć ___|złotych","dwanaście ___|złotych","dwadzieścia trzy ___|złote"],
  },
  'u06-l1': {
    s: ["Poproszę kawę z mlekiem.","Poproszę herbatę bez cukru.","Dla mnie piwo.","Dwie kawy, poproszę."],
    d: ["Poproszę ___.|kawę","Poproszę ___.|herbatę","Poproszę ___.|sok","Poproszę ___.|piwo","Poproszę wodę ___.|gazowaną"],
  },
  'u06-l2': {
    s: ["Poproszę zupę i kanapkę.","Czy są pierogi?","Pierogi są bardzo dobre.","Obiad jest o trzeciej."],
    d: ["Poproszę ___.|zupę","Poproszę ___.|kanapkę","Poproszę ___.|ciasto"],
  },
  'u06-l3': {
    s: ["Poproszę rachunek.","Kawa na miejscu czy na wynos?","To wszystko, dziękuję.","Jeszcze jedną kawę, proszę."],
    d: [],
  },
  'u07-l1': {
    s: ["Czytam książkę.","Mieszkam w Manchesterze.","Przepraszam, nie rozumiem.","Słucham muzyki."],
    d: ["Ja ___ książkę.|czytam","Ona ___ w Krakowie.|mieszka","My ___ muzyki.|słuchamy","Czy ty ___ po polsku?|rozumiesz"],
  },
  'u07-l2': {
    s: ["Pracuję w Londynie.","Chcę kawę.","Muszę iść.","Czy mogę zapłacić kartą?"],
    d: ["On ___ w biurze.|pracuje","Czy ___ mi pomóc?|możesz","Ja ___ kawę.|chcę","Oni ___ herbatę.|piją"],
  },
  'u07-l3': {
    s: ["Mówię trochę po polsku.","Czy mówisz po angielsku?","Lubię herbatę.","Uczę się polskiego."],
    d: ["Ona ___ po polsku.|mówi","Co ___?|robisz","___ się polskiego.|Uczę","Oni ___ kawę.|lubią"],
  },
  'u08-l1': {
    s: ["To jest moja mama.","To jest mój brat, Piotr.","Moja żona jest z Polski.","Mój syn mieszka w Leeds."],
    d: ["___ mama|moja","___ brat|mój","___ dziecko|moje","___ tata|mój"],
  },
  'u08-l2': {
    s: ["Mam brata i siostrę.","Czy masz dzieci?","Mamy psa i kota.","Ile masz lat?"],
    d: ["Mam ___.|siostrę","Masz ___?|brata","Ona ___ dwoje dzieci.|ma","Mamy ___.|psa"],
  },
  'u08-l3': {
    s: ["Przepraszam, nie mam czasu.","Nie ma kawy.","Nie mam samochodu.","Mamy nie ma w domu."],
    d: ["Nie mam ___.|samochodu","Nie ma ___.|kawy","Nie mam ___.|siostry","Tu nie ma ___.|mleka"],
  },
  'u09-l1': {
    s: ["Gdzie jest apteka?","Przepraszam, gdzie jest toaleta?","Tam jest poczta."],
    d: [],
  },
  'u09-l2': {
    s: ["Jestem w domu.","Ona jest w pracy.","Mieszkam w Anglii, ale pracuję w Polsce.","Spotkamy się na dworcu."],
    d: ["Jestem w ___.|pracy","Mieszkam w ___.|Polsce","On jest na ___.|poczcie","Czekam w ___.|parku"],
  },
  'u09-l3': {
    s: ["Apteka jest blisko.","Proszę iść prosto, potem w lewo.","Bank jest obok poczty.","Czy to daleko?"],
    d: [],
  },
  'u10-l1': {
    s: ["Dzisiaj jest piątek.","W sobotę mam czas.","Jutro pracuję.","Do zobaczenia w poniedziałek!"],
    d: ["w ___|środę","___ wtorek|we","w ___|niedzielę","w ___|piątek"],
  },
  'u10-l2': {
    s: ["Jest druga.","Pracuję od dziewiątej do piątej.","O której jest pociąg?","Wieczorem czytam."],
    d: ["Jest ___.|trzecia","Spotkanie jest o ___.|piątej","Jest ___.|ósma","Wstaję o ___.|siódmej"],
  },
  'u10-l3': {
    s: ["Wstaję o siódmej.","Zwykle jem śniadanie w domu.","Wracam do domu o szóstej.","Wieczorem oglądam telewizję."],
    d: [],
  },
  'u11-l1': {
    s: ["Wczoraj byłem w pracy.","Gdzie byłeś?","To było bardzo dobre.","Byliśmy w Polsce."],
    d: ["Wczoraj (ja — Anna) ___ w domu.|byłam","Tom ___ w pracy.|był","Kasiu, czy ___ w Krakowie?|byłaś","Adam i Ewa ___ w kinie.|byli"],
  },
  'u11-l2': {
    s: ["Wczoraj pracowałem do późna.","Co robiłaś w weekend?","Mieszkałam w Warszawie.","Oglądaliśmy film."],
    d: ["Wczoraj (ja — Tom) ___ książkę.|czytałem","Ona ___ w Londynie.|mieszkała","Moi rodzice ___ film.|oglądali","Kasia i Ola ___ w banku.|pracowały"],
  },
  'u11-l3': {
    s: ["Poszłam do sklepu.","Pojechaliśmy do Gdańska pociągiem.","Jadłem pierogi w Krakowie.","Nie mogłem przyjść."],
    d: ["Wczoraj Tom ___ do kina.|poszedł","Anna ___ do Krakowa.|pojechała","(ja — Ewa) ___ dużo kawy.|piłam"],
  },
  'u12-l1': {
    s: ["Przeczytałam tę książkę.","Codziennie piję kawę.","Czy zjadłeś już obiad?","Kupiłem nowy telefon."],
    d: ["Wczoraj ___ cały film.|obejrzałem","Codziennie ___ kawę.|piję","Już ___ zupę.|zjadłem","Często ___ książki.|czytam","Kiedy zadzwoniłaś, ___ obiad.|jadłam"],
  },
  'u12-l2': {
    s: ["Co powiedziałeś?","Wezmę to.","Zobaczymy.","Zamknij okno, proszę.","Zapomniałam hasła."],
    d: ["Czy możesz ___ drzwi?|otworzyć","Zawsze ___ klucze!|zapominam","Kiedy ___ do domu?|wrócisz"],
  },
  'u12-l3': {
    s: ["Zawsze piję herbatę rano.","Nigdy nie byłem w Gdańsku.","Jeszcze nie skończyłem.","W końcu kupiliśmy mieszkanie."],
    d: ["Często ___ do mamy.|dzwonię","Właśnie ___ list.|napisałem","Nigdy ___ w Polsce.|nie byłem"],
  },
  'u13-l1': {
    s: ["Jutro będę w pracy.","Będę czekać na dworcu.","Będzie padać.","Co będziesz robić w sobotę?"],
    d: ["Jutro ___ w domu.|będę","Oni ___ w Polsce w lipcu.|będą","Co ___ robić w weekend?|będziesz"],
  },
  'u13-l2': {
    s: ["Zadzwonię do ciebie wieczorem.","Kupię chleb.","Przyjdę o siódmej.","Spróbuję jeszcze raz."],
    d: ["Jutro ___ do ciebie.|zadzwonię","Zaraz ___ to.|zrobię"],
  },
  'u13-l3': {
    s: ["W przyszłym tygodniu jadę do Polski.","Mam zamiar uczyć się codziennie.","Może pójdziemy do kina?","Wrócę za godzinę."],
    d: [],
  },
  'u14-l1': {
    s: ["Poproszę herbatę z cytryną.","Mieszkam z przyjacielem.","Czy idziesz z nami?","Rozmawiałam z mamą."],
    d: ["Herbata z ___.|cytryną","Kawa z ___.|cukrem","Idę do kina z ___.|Anną","Czy pójdziesz ze ___?|mną"],
  },
  'u14-l2': {
    s: ["Jestem nauczycielem.","Moja siostra jest lekarką.","Pracuję jako kierowca.","On jest studentem."],
    d: ["Jestem ___.|lekarzem","Ona jest ___.|pielęgniarką","Mój brat jest ___.|studentem","To jest ___.|nauczyciel"],
  },
  'u14-l3': {
    s: ["Jadę do pracy autobusem.","Jedziemy pociągiem do Krakowa.","Chodzę do pracy pieszo.","Wolę jeździć rowerem."],
    d: ["Jadę ___.|pociągiem","Lecimy ___.|samolotem","Jeździsz ___?|tramwajem"],
  },
  'u15-l1': {
    s: ["Dokąd idziesz?","Idę do domu.","Jadę do Warszawy.","Jeżdżę do pracy tramwajem."],
    d: ["Teraz ___ do sklepu.|idę","Codziennie ___ do pracy autobusem.|jeżdżę","Jutro ___ do Krakowa pociągiem.|jadę","Często ___ do kina.|chodzę"],
  },
  'u15-l2': {
    s: ["Idę do sklepu po chleb.","Jedziemy do Polski na wakacje.","Idę na pocztę.","Pojedziesz ze mną do Krakowa?"],
    d: ["Idę do ___.|pracy","Jadę do ___.|Londynu","Idziemy do ___.|kina","Idę ___ pocztę.|na"],
  },
  'u15-l3': {
    s: ["Poproszę bilet do Krakowa.","Z którego peronu odjeżdża pociąg?","Pociąg jest opóźniony.","Gdzie jest przystanek autobusowy?"],
    d: ["Poproszę bilet ___.|do Gdańska","Pociąg odjeżdża z ___ trzeciego.|peronu"],
  },
  'u16-l1': {
    s: ["Bardzo mi się tu podoba.","Czy smakuje ci zupa?","Jest mi zimno.","Kraków bardzo mi się podoba."],
    d: ["Czy ___ się podoba?|ci","Jest ___ zimno.|mi","Te buty ___ mi się.|podobają","Ta zupa bardzo ___ mi.|smakuje"],
  },
  'u16-l2': {
    s: ["Kupiłam mamie kwiaty.","Co kupić bratu na urodziny?","To jest prezent dla ciebie.","Pomagam siostrze."],
    d: ["Kupiłem ___ kwiaty.|mamie","Daj to ___.|bratu","Pomagam ___.|siostrze","Dziękuję ___!|ci"],
  },
  'u16-l3': {
    s: ["Myślę, że to dobry pomysł.","Niestety nie mogę przyjść.","Szkoda, że cię nie było.","Zgadzam się z tobą."],
    d: [],
  },
  'u17-l1': {
    s: ["Chciałbym zarezerwować stolik.","Czy mógłby mi pan pomóc?","Wolałabym herbatę.","Chcielibyśmy dwa bilety."],
    d: ["(Tom) ___ kawę.|Chciałbym","(Anna) ___ zapłacić kartą.|Chciałabym","Czy ___ pani otworzyć okno?|mogłaby","Kasiu, ___ mi pomóc?|mogłabyś"],
  },
  'u17-l2': {
    s: ["Gdybym miał czas, pojechałbym do Polski.","Na twoim miejscu zadzwoniłabym do niego.","Co byś zrobił?","Gdyby było ciepło, poszlibyśmy na spacer."],
    d: ["Gdybym ___ pieniądze, kupiłbym dom.|miał","Gdybyś chciał, ___ ci.|pomógłbym","Na twoim ___ nie czekałabym.|miejscu"],
  },
  'u17-l3': {
    s: ["Czy mogę prosić o paragon?","Przepraszam, że przeszkadzam, ale mam pytanie.","Kupiłem ten telefon wczoraj i nie działa.","Chciałabym to zwrócić."],
    d: [],
  },
  'u18-l1': {
    s: ["Mam dwadzieścia dwa lata.","Poproszę dwie kawy i trzy piwa.","W grupie jest dziesięć osób.","Mamy pięć kotów."],
    d: ["dwie ___|kawy","pięć ___|kaw","trzy ___|koty","dwanaście ___|piw","dwadzieścia trzy ___|lata","Mam trzydzieści pięć ___.|lat"],
  },
  'u18-l2': {
    s: ["Mam dużo pracy.","Poproszę trochę wody.","Wystarczy, dziękuję.","Ile czasu to zajmie?"],
    d: ["Poproszę trochę ___.|wody","Mam dużo ___.|pracy","Poczekaj kilka ___.|minut","Ile masz ___?|czasu"],
  },
  'u18-l3': {
    s: ["Poproszę kilo jabłek.","Poproszę butelkę wody.","Pół kilo sera, proszę.","Poproszę dwadzieścia deko szynki."],
    d: ["Poproszę paczkę ___.|kawy","Poproszę ___ wody.|butelkę","Kawałek ___, proszę.|ciasta"],
  },
};
