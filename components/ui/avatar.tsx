import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: number; // px
}

export function Avatar({
  src,
  name,
  size = 32,
  className = "",
  ...props
}: AvatarProps) {
  const initials = React.useMemo(() => {
    const n = name || "";
    const parts = n.trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name ?? "avatar"}
          src={src}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-sm font-medium leading-none">{initials}</span>
      )}
    </div>
  );
}
