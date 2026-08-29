import Image from "next/image";

type UserAvatarProps = {
  name?: string | null;
  image?: string | null;
  size?: number;
};

export function UserAvatar({ name, image, size = 28 }: UserAvatarProps) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-full bg-gs-surface-2 text-gs-accent"
      style={{ width: size, height: size }}
    >
      {(name?.trim().charAt(0) ?? "?").toUpperCase()}
    </span>
  );
}
