/* ---------------------------------------
   MarkdownRenderer.tsx  (final minimal fix)
--------------------------------------- */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Typography, Box } from '@mui/material';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  /* --- your renderers ------------------------------------ */
  const components = {
    /* headings MUST accept `level` too --------------------- */
    h1: ({ level, ...props }) => <Typography variant="h4" gutterBottom {...props} />,
    h2: ({ level, ...props }) => <Typography variant="h5" gutterBottom {...props} />,
    h3: ({ level, ...props }) => <Typography variant="h6" gutterBottom {...props} />,

    /* paragraph & lists ----------------------------------- */
    p:  (props) => <Typography variant="body1" paragraph {...props} />,
    ul: (props) => <Typography component="ul" sx={{ pl: 4 }} {...props} />,
    ol: (props) => <Typography component="ol" sx={{ pl: 4 }} {...props} />,
    li: (props) => <Typography component="li" {...props} />,

    /* tables ---------------------------------------------- */
    table: (props) => (
      <Box component="div" sx={{ overflowX: 'auto', my: 2 }}>
        <Box component="table" sx={{ minWidth: 650, borderCollapse: 'collapse' }} {...props} />
      </Box>
    ),
    thead: (props) => <Box component="thead" sx={{ bgcolor: 'grey.100' }} {...props} />,
    tr:    (props) => <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }} {...props} />,
    th:    (props) => <Box component="th" sx={{ p: 1.5, fontWeight: 'bold' }} {...props} />,
    td:    (props) => <Box component="td" sx={{ p: 1.5 }} {...props} />,

    /* code ------------------------------------------------ */
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? '');
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

    /* blockquote ------------------------------------------ */
    blockquote: (props) => (
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
  } as unknown as Components;      // ← single, targeted assertion

  /* ------------------------------------------------------- */
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
