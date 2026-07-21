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
  return (
    <div className="text-center">
      <h1 className="font-display text-3xl font-bold text-plum">
        {icon ? `${icon} ` : ""}
        {title}
      </h1>
      {sub && <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-plum/60">{sub}</p>}
    </div>
  );
}
