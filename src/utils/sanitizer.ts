/**
 * Lightweight, zero-dependency HTML sanitizer and text utilities
 * for rich-text description security and plain-text conversion.
 */

const ALLOWED_TAGS = new Set([
  'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'DEL', 'MARK',
  'H1', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'BLOCKQUOTE',
  'CODE', 'PRE', 'A', 'SPAN', 'DIV', 'HR',
]);

const ALLOWED_ATTRS = new Set([
  'HREF', 'TARGET', 'REL', 'STYLE', 'CLASS', 'TITLE',
]);

/**
 * Sanitizes an HTML string, keeping only safe markup and attributes.
 * Prevents XSS, executable scripts, unsafe link protocols, and event handlers.
 */
export function sanitizeRichText(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  // In non-browser environments (e.g. Node tests/build), use regex fallback
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return dirtyHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:[^"']*/gi, '');
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(dirtyHtml, 'text/html');
    cleanNode(doc.body);
    return doc.body.innerHTML;
  } catch (err) {
    console.error('HTML sanitize error, falling back to escaped text:', err);
    return dirtyHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

function cleanNode(node: Node) {
  const children = Array.from(node.childNodes);

  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tagName = el.tagName.toUpperCase();

      if (!ALLOWED_TAGS.has(tagName)) {
        // Disallowed tag: remove or unwrap
        if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'IFRAME' || tagName === 'OBJECT') {
          node.removeChild(el);
          continue;
        } else {
          // Replace with its child text contents
          while (el.firstChild) {
            node.insertBefore(el.firstChild, el);
          }
          node.removeChild(el);
          continue;
        }
      }

      // Sanitize attributes
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const attrName = attr.name.toUpperCase();
        if (!ALLOWED_ATTRS.has(attrName)) {
          el.removeAttribute(attr.name);
          continue;
        }

        // Validate hrefs on links
        if (attrName === 'HREF') {
          const val = attr.value.trim().toLowerCase();
          if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
            el.removeAttribute(attr.name);
          }
        }

        // Validate inline styles (allow only safe styling like text-align, background-color)
        if (attrName === 'STYLE') {
          const safeStyle = el.style.cssText
            .split(';')
            .filter((rule) => {
              const [prop] = rule.split(':').map((s) => s.trim().toLowerCase());
              return ['text-align', 'background-color', 'color', 'font-weight', 'text-decoration'].includes(prop);
            })
            .join(';');
          el.style.cssText = safeStyle;
        }
      }

      // If it's an anchor, enforce rel="noopener noreferrer" and target="_blank"
      if (tagName === 'A') {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }

      // Recursively clean valid child nodes
      cleanNode(el);
    } else if (child.nodeType !== Node.TEXT_NODE) {
      // Remove comments or other non-text node types
      node.removeChild(child);
    }
  }
}

/**
 * Extracts pure plain text from rich HTML for card previews, search indexing, and snippets.
 */
export function stripHtml(html?: string): string {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  } catch {
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }
}
