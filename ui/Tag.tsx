type TagProps = {
  children: React.ReactNode;
  variant?: "teal" | "default";
};

export default function Tag({ children, variant = "default" }: TagProps) {
  const base = "rounded-full px-2.5 py-0.5 text-xs";
  const styles =
    variant === "teal"
      ? `${base} bg-teal-50 font-medium text-teal-700`
      : `${base} bg-stone-100 text-stone-600`;

  return <span className={styles}>{children}</span>;
}
