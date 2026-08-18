import React, { useState } from 'react';
import { AtSign, ExternalLink, FileText, Image as ImageIcon, Eye, X } from 'lucide-react';

interface FormattedTextProps {
  content: string;
  className?: string;
  isDark?: boolean;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  content,
  className = '',
  isDark = false,
}) => {
  const [modalImage, setModalImage] = useState<string | null>(null);

  if (!content) return null;

  // Split lines to process block elements (headings, quotes, lists)
  const lines = content.split('\n');

  // Process inline markdown: Bold, Italic, Font styles, Links, Images, Mentions, Code
  const renderInline = (text: string): React.ReactNode[] => {
    // Regex matches:
    // 1. Images: !\[(.*?)\]\((.*?)\)
    // 2. Links: \[(.*?)\]\((.*?)\)
    // 3. Mentions: @([a-zA-Z0-9À-ÿ\s._-]+(?:\s\([^)]+\))?)(?=\s|[.,;:!?]|$|\n)
    // 4. Custom font wrapper: \[font:(serif|mono|cursive|sans|display)\](.*?)\[\/font\]
    // 5. Bold: \*\*(.*?)\*\*
    // 6. Italic: \*(.*?)\* or _(.*?)_
    // 7. Inline Code: `(.*?)`
    // 8. Strikethrough: ~~(.*?)~~

    const regex = /(!\[(.*?)\]\((.*?)\)|\[(.*?)\]\((.*?)\)|\[font:(serif|mono|cursive|sans|display)\]([\s\S]*?)\[\/font\]|\*\*(.*?)\*\*|(?:\*|_)(.*?)(?:\*|_)|`([^`]+)`|~~(.*?)~~|@([A-Za-zÀ-ÿ0-9._-]+(?:\s[A-Za-zÀ-ÿ0-9._-]+)*))/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      // Plain text before match
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }

      const fullMatch = match[0];

      // 1. Image: ![alt](url)
      if (fullMatch.startsWith('![') && fullMatch.includes('](')) {
        const alt = match[2] || 'Image insérée';
        const url = match[3];
        elements.push(
          <span key={`img-${match.index}`} className="inline-block my-1.5 max-w-full">
            <span
              onClick={() => setModalImage(url)}
              className="group relative inline-block rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm cursor-pointer bg-slate-100 dark:bg-slate-800 align-middle"
            >
              <img
                src={url}
                alt={alt}
                className="max-h-48 max-w-xs sm:max-w-sm rounded-lg object-cover hover:opacity-90 transition-opacity"
                loading="lazy"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Eye className="w-3 h-3" /> Agrandir
              </span>
            </span>
          </span>
        );
      }
      // 2. Link / File Link: [title](url)
      else if (fullMatch.startsWith('[') && !fullMatch.startsWith('[font:') && fullMatch.includes('](')) {
        const title = match[4] || 'Lien';
        const url = match[5];
        const isFile = url.includes('.pdf') || url.includes('.doc') || url.includes('data:');
        elements.push(
          <a
            key={`link-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 font-bold underline underline-offset-2 px-1.5 py-0.5 rounded transition-colors ${
              isDark
                ? 'text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/60'
                : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100'
            }`}
          >
            {isFile ? <FileText className="w-3.5 h-3.5 shrink-0" /> : <ExternalLink className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate max-w-[200px] sm:max-w-[280px]">{title}</span>
          </a>
        );
      }
      // 3. Custom Font Tag: [font:serif]...[/font]
      else if (fullMatch.startsWith('[font:')) {
        const fontType = match[6];
        const innerText = match[7];
        let fontClass = 'font-sans';
        if (fontType === 'serif') fontClass = 'font-serif italic tracking-wide';
        else if (fontType === 'mono') fontClass = 'font-mono text-[92%] bg-slate-200/60 dark:bg-slate-800/80 px-1 rounded';
        else if (fontType === 'cursive') fontClass = 'italic font-serif';
        else if (fontType === 'display') fontClass = 'font-extrabold uppercase tracking-wider text-[90%]';

        elements.push(
          <span key={`font-${match.index}`} className={fontClass}>
            {renderInline(innerText)}
          </span>
        );
      }
      // 4. Bold: **text**
      else if (match[8] !== undefined) {
        elements.push(
          <strong key={`bold-${match.index}`} className="font-extrabold text-slate-900 dark:text-white">
            {renderInline(match[8])}
          </strong>
        );
      }
      // 5. Italic: *text* or _text_
      else if (match[9] !== undefined) {
        elements.push(
          <em key={`italic-${match.index}`} className="italic">
            {renderInline(match[9])}
          </em>
        );
      }
      // 6. Inline Code: `text`
      else if (match[10] !== undefined) {
        elements.push(
          <code
            key={`code-${match.index}`}
            className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold ${
              isDark ? 'bg-slate-800 text-pink-300 border border-slate-700' : 'bg-slate-100 text-pink-600 border border-slate-200'
            }`}
          >
            {match[10]}
          </code>
        );
      }
      // 7. Strikethrough: ~~text~~
      else if (match[11] !== undefined) {
        elements.push(
          <del key={`del-${match.index}`} className="line-through opacity-70">
            {renderInline(match[11])}
          </del>
        );
      }
      // 8. Mention: @Name
      else if (match[12] !== undefined) {
        const mentionName = match[12].replace(/^@/, '');
        elements.push(
          <span
            key={`mention-${match.index}`}
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] mx-0.5 shadow-2xs border ${
              isDark
                ? 'bg-indigo-900/60 text-indigo-200 border-indigo-700/60'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <AtSign className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>{mentionName}</span>
          </span>
        );
      } else {
        elements.push(fullMatch);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements;
  };

  // Group and render lines
  const renderLines = () => {
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 1: # Heading
      if (trimmed.startsWith('# ')) {
        return (
          <h3
            key={idx}
            className={`text-base font-black mt-2 mb-1 border-b pb-1 ${
              isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
            }`}
          >
            {renderInline(trimmed.substring(2))}
          </h3>
        );
      }

      // Heading 2: ## Heading
      if (trimmed.startsWith('## ')) {
        return (
          <h4
            key={idx}
            className={`text-sm font-extrabold mt-1.5 mb-0.5 ${
              isDark ? 'text-indigo-300' : 'text-indigo-900'
            }`}
          >
            {renderInline(trimmed.substring(3))}
          </h4>
        );
      }

      // Heading 3: ### Heading
      if (trimmed.startsWith('### ')) {
        return (
          <h5
            key={idx}
            className={`text-xs font-bold uppercase tracking-wider mt-1 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            {renderInline(trimmed.substring(4))}
          </h5>
        );
      }

      // Blockquote: > text
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className={`pl-3 border-l-2 my-1 italic text-xs ${
              isDark
                ? 'border-indigo-500 text-slate-300 bg-indigo-950/20 py-1 rounded-r'
                : 'border-indigo-400 text-slate-600 bg-indigo-50/40 py-1 rounded-r'
            }`}
          >
            {renderInline(trimmed.substring(2))}
          </blockquote>
        );
      }

      // Bullet List item: * item or - item or • item
      if (/^[-*•]\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^[-*•]\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-0.5 pl-1 text-xs">
            <span className="text-indigo-400 font-bold shrink-0 leading-tight select-none">•</span>
            <div className="flex-1 min-w-0">{renderInline(itemText)}</div>
          </div>
        );
      }

      // Numbered List item: 1. item
      if (/^\d+\.\s+/.test(trimmed)) {
        const matchNum = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (matchNum) {
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5 pl-1 text-xs">
              <span className={`font-bold shrink-0 font-mono text-[11px] select-none ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {matchNum[1]}.
              </span>
              <div className="flex-1 min-w-0">{renderInline(matchNum[2])}</div>
            </div>
          );
        }
      }

      // Empty line -> spacing
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      // Standard paragraph line
      return (
        <div key={idx} className="leading-relaxed">
          {renderInline(line)}
        </div>
      );
    });
  };

  return (
    <>
      <div className={`formatted-rich-text text-xs sm:text-sm whitespace-pre-wrap break-words ${className}`}>
        {renderLines()}
      </div>

      {/* Lightbox / Image Preview Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors z-10"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={modalImage}
              alt="Aperçu agrandi"
              className="w-full h-full object-contain max-h-[80vh] rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
