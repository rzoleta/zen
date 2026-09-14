// Real entries from the bundled Kaishi 1.5k deck (apps/mobile/src/assets/deck/kaishi.json).
export interface DeckWord {
	id: number;
	word: string;
	wordFurigana: string;
	reading: string;
	meaning: string;
	sentence: string;
	sentenceFurigana: string;
	sentenceMeaning: string;
	targetStart: number;
	targetLength: number;
}

export const words: DeckWord[] = [
	{
		id: 303,
		word: '最後',
		wordFurigana: '最[さい] 後[ご]',
		reading: 'さいご',
		meaning: 'last, final',
		sentence: '今日が夏休み最後の日だ。',
		sentenceFurigana: '今日[きょう]が 夏[なつ] 休[やす]み最[さい] 後[ご]の 日[ひ]だ。',
		sentenceMeaning: "Today's the last day of summer vacation.",
		targetStart: 6,
		targetLength: 2
	},
	{
		id: 318,
		word: '覚える',
		wordFurigana: '覚[おぼ]える',
		reading: 'おぼえる',
		meaning: 'to memorize',
		sentence: '毎日、漢字を覚えます。',
		sentenceFurigana: '毎[まい] 日[にち]、 漢[かん] 字[じ]を覚[おぼ]えます。',
		sentenceMeaning: 'I memorize kanji every day.',
		targetStart: 6,
		targetLength: 4
	},
	{
		id: 194,
		word: '進む',
		wordFurigana: '進[すす]む',
		reading: 'すすむ',
		meaning: 'to move forward',
		sentence: '前に進んでください。',
		sentenceFurigana: '前[まえ]に進[すす]んでください。',
		sentenceMeaning: 'Please move forward.',
		targetStart: 2,
		targetLength: 3
	},
	{
		id: 154,
		word: '忘れる',
		wordFurigana: '忘[わす]れる',
		reading: 'わすれる',
		meaning: 'to forget',
		sentence: '約束を忘れないでください。',
		sentenceFurigana: '約[やく] 束[そく]を忘[わす]れないでください。',
		sentenceMeaning: "Please don't forget your promise.",
		targetStart: 3,
		targetLength: 5
	},
	{
		id: 134,
		word: '言葉',
		wordFurigana: '言[こと] 葉[ば]',
		reading: 'ことば',
		meaning: 'word, language',
		sentence: 'この言葉の意味が分かりません。',
		sentenceFurigana: 'この言[こと] 葉[ば]の 意[い] 味[み]が 分[わ]かりません。',
		sentenceMeaning: "I don't understand the meaning of this word.",
		targetStart: 2,
		targetLength: 2
	},
	{
		id: 150,
		word: '続ける',
		wordFurigana: '続[つづ]ける',
		reading: 'つづける',
		meaning: 'to continue, to keep up',
		sentence: '仕事を続けてください。',
		sentenceFurigana: '仕[し] 事[ごと]を続[つづ]けてください。',
		sentenceMeaning: 'Please continue your work.',
		targetStart: 3,
		targetLength: 3
	},
	{
		id: 908,
		word: '雨',
		wordFurigana: '雨[あめ]',
		reading: 'あめ',
		meaning: 'rain',
		sentence: '雨が降っています。',
		sentenceFurigana: '雨[あめ]が 降[ふ]っています。',
		sentenceMeaning: "It's raining.",
		targetStart: 0,
		targetLength: 1
	},
	{
		id: 1500,
		word: '九つ',
		wordFurigana: '九[ここの]つ',
		reading: 'ここのつ',
		meaning: 'nine (things)',
		sentence: '兄はおにぎりを九つも食べた。',
		sentenceFurigana: '兄[あに]はおにぎりを九[ここの]つも 食[た]べた。',
		sentenceMeaning: 'My older brother ate nine rice balls.',
		targetStart: 7,
		targetLength: 2
	},
	{
		id: 17,
		word: '毎日',
		wordFurigana: '毎[まい] 日[にち]',
		reading: 'まいにち',
		meaning: 'every day',
		sentence: '毎日、日本語を勉強します。',
		sentenceFurigana: '毎[まい] 日[にち]、 日本[にほん] 語[ご]を 勉[べん] 強[きょう]します。',
		sentenceMeaning: 'I study Japanese every day.',
		targetStart: 0,
		targetLength: 2
	}
];

export const wordById = (id: number) => words.find((w) => w.id === id)!;
