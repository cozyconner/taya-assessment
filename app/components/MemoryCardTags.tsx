import Tag from "@/app/components/Tag";

function formatMood(mood: string): string {
  return mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
}

type MemoryCardTagsProps = {
  mood: string;
  categories: string[];
  maxCategories?: number;
  className?: string;
};

export default function MemoryCardTags({
  mood,
  categories,
  maxCategories,
  className,
}: MemoryCardTagsProps) {
  const displayCategories = maxCategories
    ? categories.slice(0, maxCategories)
    : categories;

  return (
    <div
      className={`flex flex-wrap items-center gap-2${className ? ` ${className}` : ""}`}
    >
      <Tag variant="teal">{formatMood(mood)}</Tag>
      {displayCategories.map((cat) => (
        <Tag key={cat}>{cat}</Tag>
      ))}
    </div>
  );
}
