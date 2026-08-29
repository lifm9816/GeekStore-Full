/**
 * Stat tiles del mockup 07 + cifras del prompt (ventas, pedidos, productos, usuarios).
 */

type StatTile = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warn";
};

type AdminStatTilesProps = {
  tiles: StatTile[];
};

export function AdminStatTiles({ tiles }: AdminStatTilesProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <li
          key={tile.label}
          className="rounded-[10px] border border-gs-border bg-gs-surface p-4"
        >
          <p className="text-[12px] font-semibold text-gs-muted">{tile.label}</p>
          <p className="mt-1 text-xl font-extrabold tracking-tight md:text-2xl">
            {tile.value}
          </p>
          {tile.hint ? (
            <p
              className={`mt-1 text-[11.5px] font-semibold ${
                tile.tone === "warn" ? "text-gs-warning" : "text-gs-muted"
              }`}
            >
              {tile.hint}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
