type AccountStatsProps = {
  orders: number;
  loyaltyPoints: number;
  addresses: number;
  wishlist: number;
  labels: {
    orders: string;
    loyalty: string;
    addresses: string;
    wishlist: string;
  };
};

export function AccountStats({
  orders,
  loyaltyPoints,
  addresses,
  wishlist,
  labels,
}: AccountStatsProps) {
  const tiles = [
    { value: String(orders), label: labels.orders },
    { value: `${loyaltyPoints} ⭐`, label: labels.loyalty },
    { value: String(addresses), label: labels.addresses },
    { value: String(wishlist), label: labels.wishlist },
  ];

  return (
    <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <li
          key={tile.label}
          className="rounded-[10px] border border-gs-border bg-gs-surface px-3 py-4 text-center"
        >
          <div className="text-lg font-extrabold md:text-xl">{tile.value}</div>
          <div className="mt-1 text-[12px] text-gs-muted">{tile.label}</div>
        </li>
      ))}
    </ul>
  );
}
