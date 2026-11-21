export function excerpt(text: string, maxLength: number) {
  const characters = Array.from(text.replace(/[\uD800-\uDFFF]/gu, '\uFFFD').trim());
  if (characters.length <= maxLength) return characters.join('');

  const shortened = characters.slice(0, maxLength - 1).join('');
  const lastSpace = shortened.lastIndexOf(' ');
  return (lastSpace > shortened.length * 0.8 ? shortened.slice(0, lastSpace) : shortened).trimEnd() + '…';
}
