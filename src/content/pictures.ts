import type { Gender } from './types';

/**
 * Picture flashcards: everyday objects shown as images, so the Polish word attaches to the thing itself
 * rather than to its English translation. Images are Twemoji (CC BY 4.0), in public/pictures.
 * Every image is a single, unmistakable object; each deck avoids two pictures that could be confused.
 */

export interface Picture {
  id: string;
  pl: string;
  en: string;
  g: Gender;
  /** Path of the image, served from public/. */
  img: string;
}

export interface PictureDeck {
  id: string;
  pl: string;
  en: string;
  pictures: Picture[];
}

type Row = [slug: string, pl: string, en: string, g: Gender];

const deck = (id: string, pl: string, en: string, rows: Row[]): PictureDeck => ({
  id,
  pl,
  en,
  pictures: rows.map(([slug, p, e, g]) => ({ id: `pic-${slug}`, pl: p, en: e, g, img: `/pictures/${slug}.svg` })),
});

export const PICTURE_DECKS: PictureDeck[] = [
  deck('food', 'Jedzenie', 'Food', [
    ['apple', 'jabłko', 'apple', 'n'],
    ['banana', 'banan', 'banana', 'm'],
    ['bread', 'chleb', 'bread', 'm'],
    ['cheese', 'ser', 'cheese', 'm'],
    ['lemon', 'cytryna', 'lemon', 'f'],
    ['carrot', 'marchewka', 'carrot', 'f'],
    ['strawberry', 'truskawka', 'strawberry', 'f'],
    ['tomato', 'pomidor', 'tomato', 'm'],
  ]),
  deck('animals', 'Zwierzęta', 'Animals', [
    ['dog', 'pies', 'dog', 'm'],
    ['cat', 'kot', 'cat', 'm'],
    ['horse', 'koń', 'horse', 'm'],
    ['cow', 'krowa', 'cow', 'f'],
    ['pig', 'świnia', 'pig', 'f'],
    ['fish', 'ryba', 'fish', 'f'],
    ['bird', 'ptak', 'bird', 'm'],
    ['mouse', 'mysz', 'mouse', 'f'],
  ]),
  deck('wildlife', 'Dzikie zwierzęta', 'More animals', [
    ['elephant', 'słoń', 'elephant', 'm'],
    ['penguin', 'pingwin', 'penguin', 'm'],
    ['butterfly', 'motyl', 'butterfly', 'm'],
    ['tortoise', 'żółw', 'tortoise', 'm'],
    ['snail', 'ślimak', 'snail', 'm'],
    ['bee', 'pszczoła', 'bee', 'f'],
    ['duck', 'kaczka', 'duck', 'f'],
    ['rabbit', 'królik', 'rabbit', 'm'],
  ]),
  deck('home', 'W domu', 'At home', [
    ['key', 'klucz', 'key', 'm'],
    ['book', 'książka', 'book', 'f'],
    ['chair', 'krzesło', 'chair', 'n'],
    ['bed', 'łóżko', 'bed', 'n'],
    ['door', 'drzwi', 'door', 'pl'],
    ['spoon', 'łyżka', 'spoon', 'f'],
    ['knife', 'nóż', 'knife', 'm'],
    ['scissors', 'nożyczki', 'scissors', 'pl'],
  ]),
  deck('things', 'Rzeczy', 'Things', [
    ['house', 'dom', 'house', 'm'],
    ['clock', 'zegar', 'clock', 'm'],
    ['glasses', 'okulary', 'glasses', 'pl'],
    ['light-bulb', 'żarówka', 'light bulb', 'f'],
    ['ball', 'piłka', 'ball', 'f'],
    ['guitar', 'gitara', 'guitar', 'f'],
    ['umbrella', 'parasol', 'umbrella', 'm'],
    ['phone', 'telefon', 'phone', 'm'],
  ]),
  deck('clothes', 'Ubrania', 'Clothes', [
    ['shoe', 'but', 'shoe', 'm'],
    ['hat', 'kapelusz', 'hat', 'm'],
    ['socks', 'skarpetki', 'socks', 'pl'],
    ['t-shirt', 'koszulka', 'T-shirt', 'f'],
    ['dress', 'sukienka', 'dress', 'f'],
    ['gloves', 'rękawiczki', 'gloves', 'pl'],
    ['scarf', 'szalik', 'scarf', 'm'],
    ['trousers', 'spodnie', 'trousers', 'pl'],
  ]),
  deck('transport', 'Transport', 'Getting around', [
    ['car', 'samochód', 'car', 'm'],
    ['bus', 'autobus', 'bus', 'm'],
    ['bicycle', 'rower', 'bicycle', 'm'],
    ['plane', 'samolot', 'plane', 'm'],
    ['ship', 'statek', 'ship', 'm'],
    ['train', 'pociąg', 'train', 'm'],
    ['motorbike', 'motocykl', 'motorbike', 'm'],
    ['helicopter', 'helikopter', 'helicopter', 'm'],
  ]),
  deck('nature', 'Przyroda', 'Nature', [
    ['tree', 'drzewo', 'tree', 'n'],
    ['sun', 'słońce', 'sun', 'n'],
    ['moon', 'księżyc', 'moon', 'm'],
    ['star', 'gwiazda', 'star', 'f'],
    ['flower', 'kwiat', 'flower', 'm'],
    ['mountain', 'góra', 'mountain', 'f'],
    ['cloud', 'chmura', 'cloud', 'f'],
    ['rainbow', 'tęcza', 'rainbow', 'f'],
  ]),
  deck('body', 'Ciało', 'The body', [
    ['hand', 'ręka', 'hand', 'f'],
    ['eye', 'oko', 'eye', 'n'],
    ['ear', 'ucho', 'ear', 'n'],
    ['nose', 'nos', 'nose', 'm'],
    ['foot', 'stopa', 'foot', 'f'],
    ['tooth', 'ząb', 'tooth', 'm'],
    ['mouth', 'usta', 'mouth', 'pl'],
    ['heart', 'serce', 'heart', 'n'],
  ]),
];

export const PICTURES: Picture[] = PICTURE_DECKS.flatMap((d) => d.pictures);
