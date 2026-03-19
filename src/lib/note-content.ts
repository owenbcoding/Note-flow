const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i

export function isHtmlContent(content: string): boolean {
  return HTML_TAG_REGEX.test(content)
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function plainTextToHtml(content: string): string {
  if (!content.trim()) {
    return '<p><br></p>'
  }

  return content
    .split('\n')
    .map((line) => (line.trim() ? `<p>${escapeHtml(line)}</p>` : '<p><br></p>'))
    .join('')
}

export function normalizeContentForEditor(content: string): string {
  return isHtmlContent(content) ? content : plainTextToHtml(content)
}

export function htmlToPlainText(content: string): string {
  if (!isHtmlContent(content)) {
    return content
  }

  return content
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function isEmptyEditorContent(content: string): boolean {
  return htmlToPlainText(content).trim().length === 0
}
