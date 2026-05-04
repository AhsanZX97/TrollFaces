interface ReferenceFaceProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-16 w-16',
  md: 'h-32 w-32',
  lg: 'h-48 w-48',
};

export function ReferenceFace({ size = 'md' }: ReferenceFaceProps) {
  return (
    <figure className="flex flex-col items-center gap-2">
      <img
        src="/trollface.png"
        alt="Reference troll face"
        className={`${sizes[size]} rounded-2xl border bg-white object-contain p-2 shadow-sm`}
      />
      <figcaption className="text-xs text-muted-foreground">
        Match this face
      </figcaption>
    </figure>
  );
}
