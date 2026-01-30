type MenuButtonProps = {
  expanded: boolean;
  onClick: (e: React.MouseEvent) => void;
};

export default function MenuButton({ expanded, onClick }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
      aria-label="Options"
      aria-expanded={expanded}
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="6" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="18" r="1.5" />
      </svg>
    </button>
  );
}
