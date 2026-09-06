import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Highlighter,
  AlignLeft,
  AlignCenter,
  Quote,
  Code,
  Undo,
  Redo,
  RemoveFormatting,
} from 'lucide-react';
import { sanitizeRichText } from '../../utils/sanitizer';

interface RichTextEditorProps {
  value: string;
  onChange: (sanitizedHtml: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write detailed description, acceptance criteria, technical context...',
  minHeight = '280px',
  className = '',
  disabled = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    unorderedList: false,
    orderedList: false,
    alignLeft: true,
    alignCenter: false,
    blockquote: false,
  });

  // Sync incoming value from outside if changed externally
  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    const currentHtml = editorRef.current.innerHTML;
    if (currentHtml !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Query active formatting state under current cursor selection
  const updateActiveFormats = useCallback(() => {
    if (!document || disabled) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        h1: document.queryCommandValue('formatBlock') === 'h1',
        h2: document.queryCommandValue('formatBlock') === 'h2',
        unorderedList: document.queryCommandState('insertUnorderedList'),
        orderedList: document.queryCommandState('insertOrderedList'),
        alignLeft: document.queryCommandState('justifyLeft'),
        alignCenter: document.queryCommandState('justifyCenter'),
        blockquote: document.queryCommandValue('formatBlock') === 'blockquote',
      });
    } catch {
      // Ignore query errors if selection is outside
    }
  }, [disabled]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const rawHtml = editorRef.current.innerHTML;
    // If only empty <br> or whitespace, normalize to empty string
    if (rawHtml === '<br>' || rawHtml === '<p><br></p>' || !rawHtml.trim()) {
      isInternalChangeRef.current = true;
      onChange('');
      return;
    }
    const clean = sanitizeRichText(rawHtml);
    isInternalChangeRef.current = true;
    onChange(clean);
    updateActiveFormats();
  };

  const exec = (command: string, arg?: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleFormatBlock = (tag: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    const currentBlock = document.queryCommandValue('formatBlock');
    if (currentBlock.toLowerCase() === tag.toLowerCase()) {
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }
    handleInput();
  };

  const handleLink = () => {
    if (disabled) return;
    const selection = window.getSelection();
    const selectedText = selection?.toString();
    const currentUrl = '';
    const url = window.prompt('Enter link URL (e.g. https://...):', currentUrl);
    if (url !== null) {
      if (url.trim() === '') {
        document.execCommand('unlink', false);
      } else {
        const fullUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') 
          ? url 
          : `https://${url}`;
        if (!selectedText) {
          document.execCommand('insertHTML', false, `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${fullUrl}</a>`);
        } else {
          document.execCommand('createLink', false, fullUrl);
        }
      }
      handleInput();
    }
  };

  const handleHighlight = () => {
    if (disabled) return;
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    
    // Toggle background highlight
    const range = selection.getRangeAt(0);
    const parent = range.commonAncestorContainer.parentElement;
    if (parent && parent.tagName === 'MARK') {
      const text = parent.innerText;
      parent.replaceWith(text);
    } else {
      document.execCommand('hiliteColor', false, '#fef08a');
    }
    handleInput();
  };

  const handleCode = () => {
    if (disabled) return;
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const selectedText = selection.toString();
    if (selectedText.includes('\n')) {
      document.execCommand('insertHTML', false, `<pre class="p-2.5 rounded-lg bg-[#EFEAE2] dark:bg-[#1A1E19] font-mono text-xs overflow-x-auto my-2"><code>${selectedText}</code></pre>`);
    } else if (selectedText) {
      document.execCommand('insertHTML', false, `<code class="px-1.5 py-0.5 rounded bg-[#EFEAE2] dark:bg-[#1A1E19] font-mono text-xs">${selectedText}</code>`);
    } else {
      document.execCommand('insertHTML', false, `<code class="px-1.5 py-0.5 rounded bg-[#EFEAE2] dark:bg-[#1A1E19] font-mono text-xs">code</code>`);
    }
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      exec('bold');
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      exec('italic');
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
      e.preventDefault();
      exec('underline');
    }
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#20261F] transition-all focus-within:border-[#8B9D83] focus-within:ring-2 focus-within:ring-[#8B9D83]/20 shadow-xs ${className}`}
    >
      {/* Compact Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#E8E2D9] dark:border-[#2E372D] bg-[#F7F3ED]/80 dark:bg-[#1C221B]/80 rounded-t-2xl text-[#504639] dark:text-[#C2C9BF]">
        {/* Bold, Italic, Underline */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => exec('bold')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.bold
                ? 'bg-[#8B9D83]/25 text-[#364931] dark:text-[#E7EAE5] font-bold'
                : 'hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A]'
            }`}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.italic
                ? 'bg-[#8B9D83]/25 text-[#364931] dark:text-[#E7EAE5]'
                : 'hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A]'
            }`}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.underline
                ? 'bg-[#8B9D83]/25 text-[#364931] dark:text-[#E7EAE5]'
                : 'hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A]'
            }`}
            title="Underline (Ctrl+U)"
            aria-label="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-[#D9D1C5] dark:bg-[#353E33] mx-1" />

        {/* Headings */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => handleFormatBlock('h1')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.h1
                ? 'bg-[#8B9D83]/25 text-[#364931] dark:text-[#E7EAE5]'
                : 'hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A]'
            }`}
            title="Heading 1"
            aria-label="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFormatBlock('h2')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.h2
                ? 'bg-[#8B9D83]/25 text-[#364931] dark:text-[#E7EAE5]'
                : 'hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A]'
            }`}
            title="Heading 2"
            aria-label="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-[#D9D1C5] dark:bg-[#353E33] mx-1" />

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.unorderedList
                ? 'bg-[#8B9D83]/25 text-[#364931] dark:text-[#E7EAE5]'
                : 'hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A]'
            }`}
            title="Bullet List"
            aria-label="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.orderedList
                ? 'bg-[#8B9D83]/25 text-[#364931] dark:text-[#E7EAE5]'
                : 'hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A]'
            }`}
            title="Numbered List"
            aria-label="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-[#D9D1C5] dark:bg-[#353E33] mx-1" />

        {/* Link, Highlight, Align, Quote, Code */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleLink}
            disabled={disabled}
            className="p-1.5 rounded-lg hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
            title="Add Link"
            aria-label="Add Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleHighlight}
            disabled={disabled}
            className="p-1.5 rounded-lg hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
            title="Highlight text"
            aria-label="Highlight text"
          >
            <Highlighter className="w-3.5 h-3.5 text-[#D4A373]" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            disabled={disabled}
            className="p-1.5 rounded-lg hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
            title="Align Left"
            aria-label="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            disabled={disabled}
            className="p-1.5 rounded-lg hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
            title="Align Center"
            aria-label="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleFormatBlock('blockquote')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFormats.blockquote
                ? 'bg-[#8B9D83]/25 text-[#364931] dark:text-[#E7EAE5]'
                : 'hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A]'
            }`}
            title="Block Quote"
            aria-label="Block Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCode}
            disabled={disabled}
            className="p-1.5 rounded-lg hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
            title="Inline / Code Block"
            aria-label="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('removeFormat')}
            disabled={disabled}
            className="p-1.5 rounded-lg hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
            title="Clear formatting"
            aria-label="Clear formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5 text-[#8C867E]" />
          </button>
        </div>

        <div className="w-px h-4 bg-[#D9D1C5] dark:bg-[#353E33] mx-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            onClick={() => exec('undo')}
            disabled={disabled}
            className="p-1.5 rounded-lg hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer text-[#8C867E]"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            disabled={disabled}
            className="p-1.5 rounded-lg hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer text-[#8C867E]"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Editable Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onKeyDown={handleKeyDown}
        style={{ minHeight }}
        data-placeholder={placeholder}
        className="w-full flex-1 p-4 text-sm text-[#3D3D3D] dark:text-[#F1EFEA] focus:outline-none overflow-y-auto leading-relaxed prose prose-sm dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#8C867E]/60 empty:before:pointer-events-none"
      />
    </div>
  );
};
