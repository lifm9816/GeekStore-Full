/**
 * Badges de género en catálogo / detalle (Día 15).
 */

type GenreBadge = {
  id: string;
  name: string;
};

type GenreBadgesProps = {
  genres: GenreBadge[];
  label: string;
  className?: string;
};

export function GenreBadges({ genres, label, className = "" }: GenreBadgesProps) {
  if (genres.length === 0) {
    return null;
  }

  return (
    <ul
      aria-label={label}
      className={`flex flex-wrap justify-center gap-1.5 ${className}`}
    >
      {genres.map((genre) => (
        <li
          key={genre.id}
          className="rounded-full border border-gs-border bg-gs-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-gs-muted"
        >
          {genre.name}
        </li>
      ))}
    </ul>
  );
}
