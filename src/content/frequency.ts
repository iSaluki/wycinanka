import { slug } from './build';
import type { FrequencyWord } from './types';

/**
 * The 500 most useful Polish words, by dictionary form, in approximate order of frequency.
 *
 * Order is informed by the OpenSubtitles 2018 Polish frequency list (hermitdave/FrequencyWords),
 * with inflected forms grouped under their dictionary form. Subtitles mirror everyday speech,
 * which is what a beginner hears first. Coverage figures in the app come from that list:
 * the 100 most frequent word forms make up about 43% of spoken text, the top 1,000 about 68%.
 *
 * Format: "polish | english | part of speech | example (pl) | example (en)"
 */
const RAW = `
nie | no, not | particle | Nie wiem. | I don't know.
to | this, it | pronoun | To jest dobre. | This is good.
się | oneself | pronoun | Jak się masz? | How are you?
w | in | preposition | Jestem w domu. | I'm at home.
na | on, at | preposition | Książka jest na stole. | The book is on the table.
i | and | conjunction | kawa i herbata | coffee and tea
że | that | conjunction | Myślę, że tak. | I think so.
z | with, from | preposition | kawa z mlekiem | coffee with milk
co | what | pronoun | Co to jest? | What is this?
być | to be | verb | Jestem zmęczony. | I'm tired.
do | to | preposition | Idę do domu. | I'm going home.
tak | yes, so | particle | Tak, oczywiście. | Yes, of course.
o | about, at | preposition | o siódmej | at seven
jak | how, like | adverb | Jak się nazywasz? | What's your name?
ale | but | conjunction | Mały, ale ładny. | Small but pretty.
a | and, whereas | conjunction | A ty? | And you?
ja | I | pronoun | Ja też. | Me too.
ty | you | pronoun | A ty? | And you?
on | he | pronoun | On jest z Polski. | He's from Poland.
za | behind, for, too | preposition | za dużo | too much
ten | this | pronoun | ten dom | this house
po | after, along | preposition | po obiedzie | after lunch
tylko | only | particle | tylko chwila | just a moment
czy | question word; whether | particle | Czy to prawda? | Is it true?
tu | here | adverb | Chodź tu! | Come here!
móc | can, to be able to | verb | Czy mogę? | May I?
mieć | to have | verb | Mam pytanie. | I have a question.
już | already | adverb | Już jestem. | I'm here now.
jeśli | if | conjunction | Jeśli chcesz. | If you want.
dla | for | preposition | dla ciebie | for you
wiedzieć | to know | verb | Nie wiem. | I don't know.
coś | something | pronoun | Coś jeszcze? | Anything else?
dobrze | well, fine | adverb | Wszystko dobrze. | Everything's fine.
więc | so | conjunction | Więc co robimy? | So what are we doing?
od | from, since | preposition | od poniedziałku | from Monday
teraz | now | adverb | Nie teraz. | Not now.
pan | sir, you (formal, to a man) | noun | Czy pan mówi po angielsku? | Do you speak English?
wszystko | everything | pronoun | To wszystko. | That's all.
nic | nothing | pronoun | Nic nie szkodzi. | Never mind.
tam | there | adverb | Tam jest bank. | There's the bank.
proszę | please | particle | Proszę bardzo. | Here you are.
gdzie | where | adverb | Gdzie jesteś? | Where are you?
kiedy | when | adverb | Kiedy wracasz? | When are you coming back?
ona | she | pronoun | Ona jest lekarką. | She's a doctor.
chcieć | to want | verb | Chcę kawę. | I want a coffee.
by | would | particle | Co byś zrobił? | What would you do?
sobie | (to/for) oneself | pronoun | Kupiłem sobie książkę. | I bought myself a book.
bardzo | very | adverb | Dziękuję bardzo. | Thank you very much.
przez | through, via | preposition | przez park | through the park
jego | his, him | pronoun | To jego samochód. | That's his car.
dlaczego | why | adverb | Dlaczego nie? | Why not?
pani | madam, you (formal, to a woman) | noun | Czy pani jest z Krakowa? | Are you from Kraków?
jeszcze | still, yet, more | adverb | Jeszcze raz. | Once more.
mój | my | pronoun | mój brat | my brother
my | we | pronoun | My też. | Us too.
żeby | so that, to | conjunction | Przyszedłem, żeby pomóc. | I came to help.
no | well | particle | No, dobrze. | Well, OK.
bo | because | conjunction | Bo tak. | Just because.
też | also, too | particle | Ja też. | Me too.
tutaj | here | adverb | Mieszkam tutaj. | I live here.
naprawdę | really | adverb | Naprawdę? | Really?
nigdy | never | adverb | Nigdy nie wiem. | I never know.
kto | who | pronoun | Kto to jest? | Who is that?
dobry | good | adjective | dobry pomysł | a good idea
przepraszać | to apologise | verb | Przepraszam! | Sorry!
musieć | to have to | verb | Muszę iść. | I have to go.
porządek | order | noun | W porządku. | All right.
dziękować | to thank | verb | Dziękuję! | Thank you!
nawet | even | particle | nawet teraz | even now
chyba | probably, I think | particle | Chyba tak. | I think so.
dom | house, home | noun | w domu | at home
prawda | truth | noun | To prawda. | That's true.
zrobić | to do, to make (and finish) | verb | Zrobię to. | I'll do it.
właśnie | just, exactly | particle | Właśnie! | Exactly!
zawsze | always | adverb | jak zawsze | as always
hej | hey | interjection | Hej, co słychać? | Hey, how's it going?
bez | without | preposition | bez cukru | without sugar
trochę | a little | adverb | trochę wody | a little water
ktoś | someone | pronoun | Ktoś dzwoni. | Someone's ringing.
powiedzieć | to say, to tell | verb | Co powiedziałeś? | What did you say?
który | which, who | pronoun | Który autobus? | Which bus?
czas | time | noun | Nie mam czasu. | I don't have time.
więcej | more | adverb | Poproszę więcej. | More, please.
twój | your | pronoun | twoja torba | your bag
rok | year | noun | w przyszłym roku | next year
albo | or | conjunction | kawa albo herbata | coffee or tea
prosty | simple, straight | adjective | To proste. | It's simple.
chodzić | to go, to walk (regularly) | verb | Chodzę na basen. | I go swimming.
razem | together | adverb | Idziemy razem? | Shall we go together?
stać | to stand | verb | Stoję na przystanku. | I'm standing at the stop.
cześć | hi, bye | interjection | Cześć, Ola! | Hi, Ola!
sam | alone, oneself | pronoun | Mieszkam sam. | I live alone.
myśleć | to think | verb | Myślę, że tak. | I think so.
przed | before, in front of | preposition | przed domem | in front of the house
raz | once, time | noun | jeszcze raz | once more
czemu | why | adverb | Czemu nie? | Why not?
niż | than | conjunction | lepszy niż | better than
człowiek | person, man | noun | dobry człowiek | a good person
dalej | further, on | adverb | Czytaj dalej. | Keep reading.
przy | by, near | preposition | przy oknie | by the window
dzień | day | noun | Dzień dobry! | Hello! (Good day!)
życie | life | noun | Takie jest życie. | That's life.
lepiej | better | adverb | Czuję się lepiej. | I feel better.
rzecz | thing | noun | moje rzeczy | my things
ok | OK | interjection | OK, dobrze. | OK, fine.
robić | to do, to make | verb | Co robisz? | What are you doing?
niech | let | particle | Niech będzie. | So be it.
oczywiście | of course | adverb | Oczywiście! | Of course!
siebie | oneself | pronoun | dla siebie | for oneself
cóż | well | particle | Cóż, trudno. | Well, never mind.
u | at (someone's) | preposition | u mamy | at Mum's
dać | to give | verb | Daj mi to. | Give me that.
nikt | nobody | pronoun | Nikt nie wie. | Nobody knows.
pod | under | preposition | pod stołem | under the table
dlatego | that's why | adverb | Dlatego przyszedłem. | That's why I came.
pewnie | probably, sure | adverb | Pewnie tak. | Probably.
aby | in order to | conjunction | aby zrozumieć | in order to understand
wtedy | then | adverb | Wtedy nie wiedziałem. | I didn't know then.
wyglądać | to look (like) | verb | Wyglądasz świetnie. | You look great.
jeden | one | numeral | jeden bilet | one ticket
dziś | today | adverb | dziś wieczorem | this evening
taki | such, like this | pronoun | taki duży | so big
dwa | two | numeral | dwa bilety | two tickets
potem | then, afterwards | adverb | Potem zobaczymy. | We'll see later.
znaczyć | to mean | verb | Co to znaczy? | What does it mean?
rozumieć | to understand | verb | Nie rozumiem. | I don't understand.
dziać się | to happen | verb | Co się dzieje? | What's going on?
wiele | many, much | adverb | wiele razy | many times
stąd | from here | adverb | Jestem stąd. | I'm from here.
miejsce | place, seat | noun | Czy to miejsce jest wolne? | Is this seat free?
iść | to go (on foot) | verb | Idę do pracy. | I'm going to work.
kilka | a few | numeral | kilka minut | a few minutes
pomóc | to help | verb | Czy możesz mi pomóc? | Can you help me?
dużo | a lot | adverb | dużo ludzi | a lot of people
ile | how much, how many | adverb | Ile to kosztuje? | How much is it?
jasne | sure | interjection | Jasne! | Sure!
cały | whole, all | adjective | cały dzień | all day
skąd | where from | adverb | Skąd jesteś? | Where are you from?
dziecko | child | noun | Mam dwoje dzieci. | I have two children.
przykro | sorry (sad) | adverb | Przykro mi. | I'm sorry.
można | one can, it's allowed | verb | Czy można tu palić? | Can you smoke here?
jakiś | some, a | pronoun | jakiś problem | some problem
sposób | way | noun | w ten sposób | this way
nad | above, over | preposition | nad morzem | by the sea
trzeba | it's necessary | verb | Trzeba iść. | We need to go.
praca | work, job | noun | Idę do pracy. | I'm going to work.
tyle | so much, so many | adverb | Tyle pracy! | So much work!
bardziej | more | adverb | bardziej interesujący | more interesting
zanim | before | conjunction | zanim wyjdziesz | before you go out
zbyt | too | adverb | zbyt drogi | too expensive
szybko | quickly, fast | adverb | Mów wolniej, nie tak szybko. | Speak slower, not so fast.
dzisiaj | today | adverb | Dzisiaj jest piątek. | Today is Friday.
zobaczyć | to see | verb | Do zobaczenia! | See you!
zaraz | in a moment | adverb | Zaraz wracam. | Back in a moment.
świetnie | great | adverb | Świetnie! | Great!
kochać | to love | verb | Kocham cię. | I love you.
nadal | still | adverb | Nadal tu mieszkam. | I still live here.
jaki | what, what kind of | pronoun | Jaki to kolor? | What colour is it?
racja | right | noun | Masz rację. | You're right.
kochanie | darling | noun | Dobranoc, kochanie. | Good night, darling.
trzy | three | numeral | trzy dni | three days
ojciec | father | noun | mój ojciec | my father
ani | neither, nor | conjunction | ani ja, ani ty | neither me nor you
później | later | adverb | Do później! | See you later!
ponieważ | because | conjunction | ponieważ pada | because it's raining
przestać | to stop | verb | Przestań! | Stop it!
długo | for a long time | adverb | Jak długo? | How long?
mama | mum | noun | moja mama | my mum
kiedyś | once, some day | adverb | Kiedyś tam pojadę. | I'll go there some day.
wciąż | still | adverb | Wciąż czekam. | I'm still waiting.
nadzieja | hope | noun | Mam nadzieję. | I hope so.
aż | until, as much as | particle | aż do rana | until morning
jutro | tomorrow | adverb | Do jutra! | See you tomorrow!
każdy | every, everyone | pronoun | każdy dzień | every day
problem | problem | noun | Nie ma problemu. | No problem.
widzieć | to see | verb | Widzisz? | You see?
stary | old | adjective | stary dom | an old house
tata | dad | noun | Mój tata jest z Gdańska. | My dad is from Gdańsk.
potrzebować | to need | verb | Potrzebuję pomocy. | I need help.
znowu | again | adverb | Znowu pada. | It's raining again.
znaleźć | to find | verb | Nie mogę znaleźć kluczy. | I can't find my keys.
noc | night | noun | Dobrej nocy! | Have a good night!
dokładnie | exactly | adverb | Dokładnie tak. | Exactly.
pierwszy | first | adjective | pierwszy raz | the first time
czuć | to feel | verb | Jak się czujesz? | How are you feeling?
pieniądze | money | noun | Nie mam pieniędzy. | I have no money.
nasz | our | pronoun | nasz dom | our house
słuchać | to listen | verb | Słucham? | Pardon? / Yes?
koniec | end | noun | na koniec | at the end
wcześniej | earlier | adverb | Przyjdź wcześniej. | Come earlier.
spokój | peace, calm | noun | Daj mi spokój! | Leave me alone!
chwila | moment | noun | Chwileczkę! | Just a moment!
zostać | to stay, to become | verb | Zostań tutaj. | Stay here.
żyć | to live, to be alive | verb | Jak żyjesz? | How's life?
porozmawiać | to have a talk | verb | Musimy porozmawiać. | We need to talk.
poza | apart from, outside | preposition | poza domem | away from home
imię | first name | noun | Jak masz na imię? | What's your first name?
lub | or | conjunction | kartą lub gotówką | by card or in cash
miło | nicely; nice | adverb | Miło cię widzieć. | Nice to see you.
minuta | minute | noun | pięć minut | five minutes
prawie | almost | adverb | Prawie gotowe. | Almost ready.
drzwi | door | noun | Zamknij drzwi. | Close the door.
powód | reason | noun | bez powodu | for no reason
powinien | should | verb | Powinieneś odpocząć. | You should rest.
gdzieś | somewhere | adverb | gdzieś w Polsce | somewhere in Poland
lubić | to like | verb | Lubię kawę. | I like coffee.
sprawa | matter, case | noun | Nie ma sprawy. | No worries.
czekać | to wait | verb | Czekam na autobus. | I'm waiting for the bus.
pomysł | idea | noun | Dobry pomysł! | Good idea!
wydawać się | to seem | verb | Wydaje mi się, że tak. | I think so.
jednak | however | conjunction | A jednak! | And yet!
inny | other, different | adjective | inny kolor | a different colour
dość | quite, enough | adverb | Mam dość. | I've had enough.
pomoc | help | noun | Pomocy! | Help!
przecież | after all | particle | Przecież wiesz. | But you know.
ciągle | constantly | adverb | Ciągle pada. | It keeps raining.
źle | badly, wrong | adverb | Źle się czuję. | I feel unwell.
facet | guy, bloke | noun | fajny facet | a nice bloke
jeżeli | if | conjunction | jeżeli możesz | if you can
skoro | since | conjunction | skoro tak mówisz | since you say so
podobać się | to be liked | verb | Podoba mi się. | I like it.
pamiętać | to remember | verb | Pamiętasz? | Do you remember?
sądzić | to think, to judge | verb | Tak sądzę. | I think so.
właściwie | actually | adverb | Właściwie to nie wiem. | Actually, I don't know.
pokój | room; peace | noun | mój pokój | my room
również | also | adverb | Ja również. | Me too.
wczoraj | yesterday | adverb | wczoraj wieczorem | last night
poważnie | seriously | adverb | Poważnie? | Seriously?
podczas | during | preposition | podczas obiadu | during lunch
oko | eye | noun | niebieskie oczy | blue eyes
rano | morning, in the morning | adverb | jutro rano | tomorrow morning
wystarczyć | to be enough | verb | Wystarczy! | That's enough!
spokojnie | calmly; take it easy | adverb | Spokojnie! | Calm down!
telefon | phone | noun | Gdzie jest mój telefon? | Where's my phone?
matka | mother | noun | moja matka | my mother
samochód | car | noun | nowy samochód | a new car
świat | world | noun | na całym świecie | all over the world
wziąć | to take | verb | Wezmę to. | I'll take it.
zamknąć | to close | verb | Zamknij okno. | Close the window.
mały | small | adjective | mały pies | a small dog
pozwolić | to allow | verb | Pozwól mi. | Let me.
wina | fault, blame | noun | To moja wina. | It's my fault.
wrócić | to come back | verb | Wrócę jutro. | I'll be back tomorrow.
między | between | preposition | między nami | between us
dzięki | thanks | interjection | Dzięki! | Thanks!
numer | number | noun | numer telefonu | phone number
oto | here is | particle | Oto mój dom. | Here's my house.
dopóki | as long as | conjunction | dopóki tu jestem | as long as I'm here
dziewczyna | girl, girlfriend | noun | moja dziewczyna | my girlfriend
najpierw | first | adverb | Najpierw kawa. | Coffee first.
pytanie | question | noun | Mam pytanie. | I have a question.
inaczej | differently, otherwise | adverb | Zrób to inaczej. | Do it differently.
przynajmniej | at least | adverb | przynajmniej raz | at least once
halo | hello (on the phone) | interjection | Halo? Kto mówi? | Hello? Who's speaking?
brzmieć | to sound | verb | Brzmi dobrze. | Sounds good.
wierzyć | to believe | verb | Nie wierzę! | I don't believe it!
trzymać | to hold | verb | Trzymaj się! | Take care!
w ogóle | at all | adverb | w ogóle nie | not at all
super | great | interjection | Super! | Great!
kobieta | woman | noun | ta kobieta | this woman
dokąd | where to | adverb | Dokąd idziesz? | Where are you going?
ręka | hand, arm | noun | Umyj ręce. | Wash your hands.
miłość | love | noun | pierwsza miłość | first love
całkiem | quite | adverb | całkiem dobrze | quite well
możliwy | possible | adjective | To możliwe. | It's possible.
gra | game | noun | gra komputerowa | a computer game
prawo | law, right | noun | prawo jazdy | driving licence
ważny | important | adjective | To ważne. | It's important.
wybaczyć | to forgive | verb | Wybacz mi. | Forgive me.
żona | wife | noun | moja żona | my wife
działać | to work, to function | verb | To nie działa. | It doesn't work.
także | also | adverb | Ja także. | Me too.
słyszeć | to hear | verb | Słyszysz mnie? | Can you hear me?
droga | road, way | noun | Szerokiej drogi! | Safe journey!
pewny | sure, certain | adjective | Jesteś pewny? | Are you sure?
cieszyć się | to be glad | verb | Cieszę się! | I'm glad!
dopiero | only, not until | particle | dopiero jutro | not until tomorrow
poznać | to meet, to get to know | verb | Miło cię poznać. | Nice to meet you.
serce | heart | noun | z całego serca | with all my heart
witać | to welcome | verb | Witamy w Polsce! | Welcome to Poland!
pojęcie | idea, notion | noun | Nie mam pojęcia. | I've no idea.
parę | a couple of | numeral | parę dni | a couple of days
przeciwko | against | preposition | Nie mam nic przeciwko. | I don't mind.
udać się | to succeed | verb | Udało się! | It worked!
raczej | rather | adverb | raczej nie | probably not
wiadomość | message, news | noun | Wyślij mi wiadomość. | Send me a message.
pięć | five | numeral | pięć złotych | five złoty
godzina | hour | noun | za godzinę | in an hour
plan | plan | noun | Jaki jest plan? | What's the plan?
wcale | at all | adverb | Wcale nie! | Not at all!
ciało | body | noun | całe ciało | the whole body
słowo | word | noun | nowe słowo | a new word
dostać | to get, to receive | verb | Dostałem list. | I got a letter.
nowy | new | adjective | nowy telefon | a new phone
oznaczać | to mean | verb | Co to oznacza? | What does this mean?
patrzeć | to look | verb | Patrz! | Look!
czyli | that is, so | conjunction | czyli jutro | so, tomorrow
czasem | sometimes | adverb | Czasem gotuję. | I cook sometimes.
dziwny | strange | adjective | To dziwne. | That's strange.
zostawić | to leave (something) | verb | Zostaw to! | Leave it!
zabrać | to take (away) | verb | Zabierz parasol. | Take an umbrella.
ostatnio | recently | adverb | Co ostatnio robisz? | What have you been up to lately?
rodzina | family | noun | moja rodzina | my family
ciężko | hard, heavily | adverb | Ciężko pracuję. | I work hard.
martwić się | to worry | verb | Nie martw się. | Don't worry.
rozmawiać | to talk | verb | Rozmawiamy po polsku. | We're talking in Polish.
ziemia | earth, ground | noun | na ziemi | on the ground
nazywać się | to be called | verb | Jak się nazywasz? | What's your name?
szczęście | happiness, luck | noun | Na szczęście! | Luckily!
syn | son | noun | mój syn | my son
mąż | husband | noun | mój mąż | my husband
wyjść | to go out, to leave | verb | Muszę wyjść. | I have to go out.
szkoła | school | noun | w szkole | at school
natychmiast | immediately | adverb | Chodź natychmiast! | Come right now!
serio | seriously | adverb | Serio? | Seriously?
policja | police | noun | Proszę zadzwonić na policję! | Please call the police!
rada | advice | noun | dobra rada | good advice
zgadzać się | to agree | verb | Zgadzam się. | I agree.
czasami | sometimes | adverb | czasami tak | sometimes, yes
strona | side, page | noun | po drugiej stronie | on the other side
część | part | noun | część pierwsza | part one
cztery | four | numeral | cztery pory roku | four seasons
należeć | to belong | verb | To należy do mnie. | That belongs to me.
głowa | head | noun | Boli mnie głowa. | I have a headache.
brat | brother | noun | starszy brat | older brother
blisko | near, close | adverb | Mieszkam blisko. | I live nearby.
zaczekać | to wait (a moment) | verb | Zaczekaj! | Wait!
uwierzyć | to believe | verb | Nie uwierzysz! | You won't believe it!
zły | bad, angry | adjective | Jestem zły. | I'm angry.
wieczór | evening | noun | Dobry wieczór! | Good evening!
twarz | face | noun | ładna twarz | a pretty face
środek | middle, inside | noun | w środku | inside
spotkanie | meeting | noun | Mam spotkanie. | I have a meeting.
gotowy | ready | adjective | Jesteś gotowy? | Are you ready?
temat | topic | noun | zmienić temat | change the subject
wielki | great, huge | adjective | wielki problem | a huge problem
uważać | to be careful; to think | verb | Uważaj! | Watch out!
daleko | far | adverb | Czy to daleko? | Is it far?
pół | half | numeral | pół godziny | half an hour
chociaż | although | conjunction | chociaż pada | although it's raining
miasto | town, city | noun | w centrum miasta | in the town centre
doktor | doctor | noun | Panie doktorze… | Doctor…
wieczorem | in the evening | adverb | Zadzwonię wieczorem. | I'll ring this evening.
zależeć | to depend | verb | To zależy. | It depends.
dobranoc | good night | interjection | Dobranoc! | Good night!
późno | late | adverb | Jest już późno. | It's late now.
jej | her, hers | pronoun | jej samochód | her car
zewnątrz | outside | adverb | na zewnątrz | outside
wspaniale | wonderfully | adverb | Wspaniale! | Wonderful!
mniej | less | adverb | mniej cukru | less sugar
wejść | to go in | verb | Proszę wejść. | Please come in.
wypadek | accident | noun | Był wypadek. | There's been an accident.
tydzień | week | noun | w przyszłym tygodniu | next week
chłopak | boy, boyfriend | noun | mój chłopak | my boyfriend
nieważne | never mind | adverb | Nieważne. | Never mind.
pójść | to go | verb | Pójdę do sklepu. | I'll go to the shop.
szansa | chance | noun | druga szansa | a second chance
woda | water | noun | szklanka wody | a glass of water
pracować | to work | verb | Gdzie pracujesz? | Where do you work?
jakoś | somehow | adverb | Jakoś to będzie. | It'll work out somehow.
według | according to | preposition | według mnie | in my opinion
spotkać | to meet | verb | Spotkajmy się jutro. | Let's meet tomorrow.
zupełnie | completely | adverb | zupełnie nowy | brand new
sprawdzić | to check | verb | Sprawdzę. | I'll check.
wspólny | shared, common | adjective | wspólny znajomy | a mutual friend
prawdopodobnie | probably | adverb | Prawdopodobnie jutro. | Probably tomorrow.
jechać | to go (by vehicle) | verb | Jadę do Krakowa. | I'm going to Kraków.
spać | to sleep | verb | Idę spać. | I'm going to bed.
zdjęcie | photo | noun | Zrobić ci zdjęcie? | Shall I take your photo?
uwaga | attention | noun | Uwaga! | Careful!
film | film | noun | dobry film | a good film
pogadać | to have a chat | verb | Musimy pogadać. | We need to chat.
brak | lack | noun | brak czasu | lack of time
mało | little, few | adverb | mało czasu | not much time
wkrótce | soon | adverb | Do zobaczenia wkrótce! | See you soon!
przyjaciel | friend | noun | mój najlepszy przyjaciel | my best friend
góra | mountain; top | noun | w górach | in the mountains
nazwisko | surname | noun | Jak ma pan na nazwisko? | What's your surname?
wszędzie | everywhere | adverb | Szukałem wszędzie. | I looked everywhere.
prosto | straight | adverb | Proszę iść prosto. | Go straight on.
rodzice | parents | noun | moi rodzice | my parents
początek | beginning | noun | na początku | at the beginning
nagle | suddenly | adverb | Nagle zaczęło padać. | Suddenly it started to rain.
drugi | second, other | adjective | drugi raz | the second time
często | often | adverb | Często tu jesteś? | Are you here often?
kłopot | trouble | noun | Mam kłopot. | I'm in trouble.
zacząć | to start | verb | Zaczynamy! | Let's start!
większość | most | noun | większość ludzi | most people
trudno | it's hard | adverb | Trudno. | Oh well. (It's hard.)
błąd | mistake | noun | To był błąd. | That was a mistake.
córka | daughter | noun | moja córka | my daughter
jedynie | only | adverb | jedynie ty | only you
szkoda | pity, shame | noun | Szkoda! | What a shame!
siostra | sister | noun | młodsza siostra | younger sister
zapomnieć | to forget | verb | Zapomniałem! | I forgot!
ponownie | again | adverb | Spróbuj ponownie. | Try again.
zamiast | instead of | preposition | zamiast kawy | instead of coffee
niestety | unfortunately | adverb | Niestety nie. | Unfortunately not.
zadzwonić | to ring, to call | verb | Zadzwonię do ciebie. | I'll ring you.
obiecać | to promise | verb | Obiecuję. | I promise.
osoba | person | noun | stolik dla dwóch osób | a table for two
oraz | and, as well as | conjunction | kawa oraz ciasto | coffee and cake
piękny | beautiful | adjective | piękny dzień | a beautiful day
historia | history, story | noun | długa historia | a long story
mimo | despite | preposition | mimo to | even so
głupi | stupid, silly | adjective | głupie pytanie | a silly question
pokazać | to show | verb | Pokaż mi. | Show me.
obok | next to | preposition | obok banku | next to the bank
przykład | example | noun | na przykład | for example
dłużej | longer | adverb | Zostań dłużej. | Stay longer.
oboje | both | numeral | oboje rodzice | both parents
najlepszy | best | adjective | Wszystkiego najlepszego! | All the best!
odkąd | since | conjunction | odkąd tu mieszkam | since I've lived here
łatwo | easily; it's easy | adverb | To nie jest łatwe. | It isn't easy.
wiek | age, century | noun | w moim wieku | at my age
sporo | quite a lot | adverb | sporo pracy | quite a lot of work
kupić | to buy | verb | Muszę kupić chleb. | I need to buy bread.
sześć | six | numeral | o szóstej | at six
niby | supposedly | particle | Niby dlaczego? | And why is that?
spróbować | to try | verb | Spróbuj! | Try it!
cicho | quietly; quiet! | adverb | Cicho! | Quiet!
ich | their, them | pronoun | ich dom | their house
niedługo | soon | adverb | Niedługo wrócę. | I'll be back soon.
bać się | to be afraid | verb | Nie bój się. | Don't be afraid.
strasznie | terribly | adverb | strasznie zimno | terribly cold
głos | voice | noun | Mów głośniej. | Speak louder.
około | about, around | preposition | około piątej | at about five
boleć | to hurt | verb | Boli mnie ząb. | I've got toothache.
zwykle | usually | adverb | Zwykle piję herbatę. | I usually drink tea.
następny | next | adjective | następny przystanek | the next stop
powodzenia | good luck | interjection | Powodzenia! | Good luck!
widać | you can see | verb | Nic nie widać. | You can't see a thing.
szczerze | honestly | adverb | Szczerze mówiąc… | To be honest…
szpital | hospital | noun | w szpitalu | in hospital
myśl | thought | noun | dobra myśl | a good thought
najlepiej | best | adverb | Najlepiej jutro. | Tomorrow would be best.
wracać | to come back | verb | Wracaj szybko! | Come back soon!
jedzenie | food | noun | polskie jedzenie | Polish food
nienawidzić | to hate | verb | Nienawidzę deszczu. | I hate rain.
wy | you (plural) | pronoun | A wy? | And you lot?
ulica | street | noun | na ulicy | in the street
nigdzie | nowhere | adverb | Nigdzie nie idę. | I'm not going anywhere.
włosy | hair | noun | długie włosy | long hair
tysiąc | thousand | numeral | tysiąc złotych | a thousand złoty
zamiar | intention | noun | Mam zamiar… | I intend to…
przyjść | to come | verb | Przyjdziesz? | Are you coming?
mieszkać | to live | verb | Gdzie mieszkasz? | Where do you live?
kolacja | supper | noun | Co na kolację? | What's for supper?
stan | state | noun | w dobrym stanie | in good condition
żartować | to joke | verb | Żartujesz! | You're joking!
noga | leg, foot | noun | Boli mnie noga. | My leg hurts.
grać | to play | verb | Grasz w piłkę? | Do you play football?
uwielbiać | to love, to adore | verb | Uwielbiam pierogi. | I love pierogi.
potrafić | to be able to | verb | Potrafisz pływać? | Can you swim?
zrozumieć | to understand | verb | Zrozumiałem. | I understood.
wybór | choice | noun | Nie mam wyboru. | I have no choice.
fajnie | cool, nice | adverb | Fajnie! | Cool!
trudny | difficult | adjective | trudne pytanie | a difficult question
cel | goal, aim | noun | mój cel | my goal
biuro | office | noun | w biurze | at the office
mocno | strongly, hard | adverb | Trzymaj mocno. | Hold tight.
kot | cat | noun | czarny kot | a black cat
tył | back | noun | z tyłu | at the back
wolno | slowly; it's allowed | adverb | Proszę mówić wolno. | Please speak slowly.
zapytać | to ask | verb | Mogę zapytać? | May I ask?
młody | young | adjective | młody człowiek | a young man
obawiać się | to fear | verb | Obawiam się, że nie. | I'm afraid not.
otworzyć | to open | verb | Otwórz okno. | Open the window.
odpowiedź | answer | noun | dobra odpowiedź | the right answer
związek | relationship | noun | Jestem w związku. | I'm in a relationship.
centrum | centre | noun | w centrum | in the centre
szukać | to look for | verb | Czego szukasz? | What are you looking for?
wreszcie | at last | adverb | Wreszcie weekend! | The weekend at last!
oni | they | pronoun | Oni są z Anglii. | They're from England.
mnóstwo | loads | noun | mnóstwo ludzi | loads of people
szczęśliwy | happy | adjective | Jestem szczęśliwy. | I'm happy.
hotel | hotel | noun | w hotelu | at the hotel
reszta | rest; change | noun | Reszty nie trzeba. | Keep the change.
ból | pain | noun | ból głowy | headache
ślub | wedding | noun | Biorą ślub. | They're getting married.
duży | big | adjective | duży dom | a big house
pies | dog | noun | mój pies | my dog
list | letter | noun | Napisz list. | Write a letter.
przyszłość | future | noun | w przyszłości | in the future
ciekawy | interesting, curious | adjective | ciekawa książka | an interesting book
prezent | present, gift | noun | To prezent dla ciebie. | It's a present for you.
łóżko | bed | noun | Idę do łóżka. | I'm off to bed.
sekunda | second | noun | Sekundę! | One second!
kraj | country | noun | piękny kraj | a beautiful country
jeść | to eat | verb | Co jesz? | What are you eating?
pić | to drink | verb | Co pijesz? | What are you drinking?
kawa | coffee | noun | czarna kawa | black coffee
mówić | to speak, to say | verb | Mówisz po polsku? | Do you speak Polish?
czytać | to read | verb | Lubię czytać. | I like reading.
pisać | to write | verb | Piszę e-mail. | I'm writing an email.
uczyć się | to learn, to study | verb | Uczę się polskiego. | I'm learning Polish.
sklep | shop | noun | Idę do sklepu. | I'm going to the shop.
pociąg | train | noun | pociąg do Warszawy | the train to Warsaw
pogoda | weather | noun | Jaka jest pogoda? | What's the weather like?
herbata | tea | noun | herbata z cytryną | tea with lemon
`;

const usedIds = new Set<string>();

export const FREQUENCY: FrequencyWord[] = RAW.trim()
  .split('\n')
  .map((line, i) => {
    const [pl, en, pos, exPl, exEn] = line.split('|').map((s) => s.trim());
    // Words that differ only by diacritics (pomoc / pomóc) would share a slug; number the later one.
    let id = `f:${slug(pl)}`;
    for (let n = 2; usedIds.has(id); n++) id = `f:${slug(pl)}-${n}`;
    usedIds.add(id);
    const word: FrequencyWord = { id, rank: i + 1, pl, en, pos };
    if (exPl && exEn) word.ex = [exPl, exEn];
    return word;
  });

export const BAND_SIZE = 50;

/** Share of spoken tokens covered by the N most frequent word forms (OpenSubtitles 2018, top-50k list). */
export const COVERAGE: Array<[n: number, percent: number]> = [
  [10, 19.1],
  [50, 35.4],
  [100, 43.5],
  [300, 55.7],
  [500, 61.2],
  [1000, 68.4],
];
