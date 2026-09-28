import React from 'react';

interface TextHighlightProps {
  text: string;
  query?: string;
  className?: string;
  highlightClassName?: string;
}

export const TextHighlight: React.FC<TextHighlightProps> = ({
  text,
  query = '',
  className = '',
  highlightClassName = 'bg-amber-400/25 text-amber-300 font-bold px-0.5 rounded-[1px] border border-amber-400/30'
}) => {
  if (!query || !query.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  const trimmed = query.trim();
  // Escape regex special chars
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === trimmed.toLowerCase();
        return isMatch ? (
          <mark key={i} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
};
