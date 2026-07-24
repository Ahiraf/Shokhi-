import Icon, { emojiToIcon } from "./Icon";

/** Small centered header for inner pages. */
export default function PageHeader({
  icon,
  title,
  sub,
}: {
  icon?: string;
  title: string;
  sub?: string;
}) {
  const iconName = emojiToIcon(icon);
  return (
    <div className="text-center">
      <h1 className="flex items-center justify-center gap-2.5 font-display text-3xl font-bold text-plum">
        {iconName && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-rose-deep">
            <Icon name={iconName} size={20} />
          </span>
        )}
        {title}
      </h1>
      {sub && <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-plum/60">{sub}</p>}
    </div>
  );
}
