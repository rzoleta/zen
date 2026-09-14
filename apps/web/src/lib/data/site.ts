export const site = {
	name: 'Zen',
	mark: '前',
	github: 'https://github.com/rzoleta/zen',
	// App Store listing is not live yet; point at the repo until it is.
	download: 'https://github.com/rzoleta/zen',
	deck: {
		name: 'Kaishi 1.5k',
		url: 'https://github.com/donkuri/kaishi',
		words: 1500
	},
	fsrs: 'https://github.com/open-spaced-repetition/fsrs4anki/wiki/ABC-of-FSRS'
} as const;

export const designs = [
	{ id: 'card', label: 'Card' },
	{ id: 'sentence', label: 'Sentence' },
	{ id: 'night', label: 'Night' },
	{ id: 'tategaki', label: 'Tategaki' },
	{ id: 'phone', label: 'Phone' }
] as const;

export type DesignId = (typeof designs)[number]['id'];
