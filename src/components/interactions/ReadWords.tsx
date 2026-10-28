/** Plain text split into word spans for useReadAlong to light up one at a time. */
export function ReadWords({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        part === '' || /^\s+$/.test(part) ? (
          part
        ) : (
          <span key={i} data-ra="r">
            {part}
          </span>
        ),
      )}
    </>
  );
}
