// Mirrors apps/mobile/src/lib/furigana.ts: parses Kaishi's `漢字[かんじ]` markup.
export interface FuriganaSegment {
	text: string;
	reading?: string;
}

const annotatedBase = /[\p{Script=Han}々〆ヵヶ0-9０-９]/u;

export function parseFuriganaMarkup(markup: string): FuriganaSegment[] {
	const characters = Array.from(markup.replaceAll(' ', ''));
	const segments: FuriganaSegment[] = [];
	let plain = '';

	const pushPlain = () => {
		if (!plain) return;
		segments.push({ text: plain });
		plain = '';
	};

	for (let index = 0; index < characters.length;) {
		if (!annotatedBase.test(characters[index] ?? '')) {
			plain += characters[index] ?? '';
			index += 1;
			continue;
		}

		let baseEnd = index;
		while (annotatedBase.test(characters[baseEnd] ?? '')) baseEnd += 1;

		if (characters[baseEnd] !== '[') {
			plain += characters.slice(index, baseEnd).join('');
			index = baseEnd;
			continue;
		}

		const readingEnd = characters.indexOf(']', baseEnd + 1);
		if (readingEnd < 0) {
			plain += characters.slice(index, baseEnd + 1).join('');
			index = baseEnd + 1;
			continue;
		}

		const reading = characters.slice(baseEnd + 1, readingEnd).join('');
		if (!reading) {
			plain += characters.slice(index, readingEnd + 1).join('');
			index = readingEnd + 1;
			continue;
		}

		pushPlain();
		segments.push({ text: characters.slice(index, baseEnd).join(''), reading });
		index = readingEnd + 1;
	}

	pushPlain();
	return segments;
}

/** Splits segments so a [start, start+length) character range can be styled separately. */
export function splitSegmentsAt(
	segments: FuriganaSegment[],
	start: number,
	length: number
): { segment: FuriganaSegment; inRange: boolean }[] {
	const out: { segment: FuriganaSegment; inRange: boolean }[] = [];
	let cursor = 0;
	const end = start + length;
	for (const segment of segments) {
		const chars = Array.from(segment.text);
		const segStart = cursor;
		const segEnd = cursor + chars.length;
		cursor = segEnd;
		if (segment.reading || segEnd <= start || segStart >= end) {
			out.push({ segment, inRange: segStart >= start && segEnd <= end });
			continue;
		}
		// Plain text straddling the boundary: split by character.
		let run = '';
		let runIn = segStart >= start && segStart < end;
		chars.forEach((ch, i) => {
			const pos = segStart + i;
			const isIn = pos >= start && pos < end;
			if (isIn !== runIn && run) {
				out.push({ segment: { text: run }, inRange: runIn });
				run = '';
			}
			runIn = isIn;
			run += ch;
		});
		if (run) out.push({ segment: { text: run }, inRange: runIn });
	}
	return out;
}
