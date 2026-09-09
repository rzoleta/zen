export interface FuriganaSegment {
  text: string;
  reading?: string;
}

const annotatedBase = /[\p{Script=Han}々〆ヵヶ0-9０-９]/u;

export function parseFuriganaMarkup(markup: string): FuriganaSegment[] {
  const characters = Array.from(markup.replaceAll(" ", ""));
  const segments: FuriganaSegment[] = [];
  let plain = "";

  const pushPlain = () => {
    if (!plain) return;
    segments.push({ text: plain });
    plain = "";
  };

  for (let index = 0; index < characters.length; ) {
    if (!annotatedBase.test(characters[index] ?? "")) {
      plain += characters[index] ?? "";
      index += 1;
      continue;
    }

    let baseEnd = index;
    while (annotatedBase.test(characters[baseEnd] ?? "")) baseEnd += 1;

    if (characters[baseEnd] !== "[") {
      plain += characters.slice(index, baseEnd).join("");
      index = baseEnd;
      continue;
    }

    const readingEnd = characters.indexOf("]", baseEnd + 1);
    if (readingEnd < 0) {
      plain += characters.slice(index, baseEnd + 1).join("");
      index = baseEnd + 1;
      continue;
    }

    const reading = characters.slice(baseEnd + 1, readingEnd).join("");
    if (!reading) {
      plain += characters.slice(index, readingEnd + 1).join("");
      index = readingEnd + 1;
      continue;
    }

    pushPlain();
    segments.push({
      text: characters.slice(index, baseEnd).join(""),
      reading,
    });
    index = readingEnd + 1;
  }

  pushPlain();
  return segments;
}

export function plainFuriganaText(segments: FuriganaSegment[]): string {
  return segments.map((segment) => segment.text).join("");
}
