interface Props {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({
  title,
  subtitle,
}: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-sm text-zinc-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}