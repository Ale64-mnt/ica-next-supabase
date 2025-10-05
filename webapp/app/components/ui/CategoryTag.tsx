export default function CategoryTag({
  children,
  color = "bg-orange-500",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className={`inline-block uppercase tracking-wide text-[11px] md:text-xs font-semibold text-white ${color} px-2.5 py-1 rounded-md`}
    >
      {children}
    </span>
  );
}
