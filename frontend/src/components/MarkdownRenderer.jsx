import React from 'react';

/**
 * Renders simple markdown-like text (from Gemini AI advice) into HTML.
 * Handles headings (###, ####), list items (- or *), and paragraphs.
 * @param {Object} props
 * @param {string} props.content - The markdown-like text content
 * @param {string} [props.emptyMessage='No content available.'] - Message when content is empty
 * @returns {JSX.Element} The rendered markdown
 */
export default function MarkdownRenderer({ content, emptyMessage = 'No content available.' }) {
  if (!content) {
    return (
      <p className="text-xs text-slate-400 italic">{emptyMessage}</p>
    );
  }

  return (
    <div className="text-slate-600 text-sm leading-relaxed prose prose-slate max-w-none">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('####')) {
          return (
            <h5 key={i} className="text-xs font-extrabold text-slate-800 mt-3 mb-1">
              {line.replace(/####/g, '').trim()}
            </h5>
          );
        }
        if (line.startsWith('###')) {
          return (
            <h4 key={i} className="text-sm font-extrabold text-slate-800 mt-4 mb-2">
              {line.replace(/###/g, '').trim()}
            </h4>
          );
        }
        if (line.startsWith('-') || line.startsWith('*')) {
          return (
            <li key={i} className="ml-4 list-disc text-xs my-1">
              {line.substring(2)}
            </li>
          );
        }
        return (
          <p key={i} className="my-1.5 text-xs">{line}</p>
        );
      })}
    </div>
  );
}
