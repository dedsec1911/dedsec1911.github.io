// components/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Typography, Box } from '@mui/material';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

/**
 *  NOTE:
 *  -----
 *  We build our renderers first, then cast
 *  them ONCE to `Components`.  That avoids the
 *  deep, brittle type-checking errors you kept hitting.
 */
const rawComponents = {
  /* ────────── headings ────────── */
  h1: (props: any) => <Typography variant="h4" gutterBottom {...props} />,
  h2: (props: any) => <Typography variant="h5" gutterBottom {...props} />,
  h3: (props: any) => <Typography variant="h6" gutterBottom {...props} />,

  /* ────────── text & lists ─────── */
  p:  (props: any) => <Typography variant="body1" paragraph {...props} />,
  ul: (props: any) => <Typography component="ul" sx={{ pl: 4 }} {...props} />,
  ol: (props: any) => <Typography component="ol" sx={{ pl: 4 }} {...props} />,
  li: (props: any) => <Typography component="li" {...props} />,

  /* ────────── tables ───────────── */
  table: (props: any) => (
    <Box component="div" sx={{ overflowX: 'auto', my: 2 }}>
      <Box component="table" sx={{ minWidth: 650, borderCollapse: 'collapse' }} {...props} />
    </Box>
  ),
  thead: (props: any) => <Box component="thead" sx={{ bgcolor: 'grey.100' }} {...props} />,
  tr:    (props: any) => <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }} {...props} />,
  th:    (props: any) => <Box component="th" sx={{ p: 1.5, fontWeight: 'bold' }} {...props} />,
  td:    (props: any) => <Box component="td" sx={{ p: 1.5 }} {...props} />,

  /* ────────── code ─────────────── */
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={materialLight}
        language={match[1]}
        showLineNumbers
        wrapLines
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <Box
        component="code"
        sx={{
          fontFamily: 'monospace',
          bgcolor: 'grey.100',
          px: 0.5,
          borderRadius: 1,
          fontSize: '0.875rem',
        }}
        {...props}
      >
        {children}
      </Box>
    );
  },

  /* ────────── blockquote ───────── */
  blockquote: (props: any) => (
    <Box
      component="blockquote"
      sx={{
        borderLeft: 4,
        borderColor: 'primary.main',
        pl: 2,
        my: 2,
        color: 'text.secondary',
        fontStyle: 'italic',
      }}
      {...props}
    />
  ),
} as unknown as Components;   // ← single, intentional cast

/* ***************************************************************** */
export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={rawComponents}>
      {content}
    </ReactMarkdown>
  );
}
