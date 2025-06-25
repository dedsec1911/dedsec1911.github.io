// components/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Typography, Box } from '@mui/material';
import type { Components } from 'react-markdown';
import type { ComponentPropsWithoutRef } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components = {
    h1: ({ level, ...props }: { level: number } & ComponentPropsWithoutRef<'h1'>) => (
      <Typography variant="h4" gutterBottom {...props} />
    ),
    h2: ({ level, ...props }: { level: number } & ComponentPropsWithoutRef<'h2'>) => (
      <Typography variant="h5" gutterBottom {...props} />
    ),
    h3: ({ level, ...props }: { level: number } & ComponentPropsWithoutRef<'h3'>) => (
      <Typography variant="h6" gutterBottom {...props} />
    ),
    p:  (props: ComponentPropsWithoutRef<'p'>) => <Typography variant="body1" paragraph {...props} />,
    ul: (props: ComponentPropsWithoutRef<'ul'>) => <Typography component="ul" sx={{ pl: 4 }} {...props} />,
    ol: (props: ComponentPropsWithoutRef<'ol'>) => <Typography component="ol" sx={{ pl: 4 }} {...props} />,
    li: (props: ComponentPropsWithoutRef<'li'>) => <Typography component="li" {...props} />,
    table: (props: ComponentPropsWithoutRef<'table'>) => (
      <Box component="div" sx={{ overflowX: 'auto', my: 2 }}>
        <Box component="table" sx={{ minWidth: 650, borderCollapse: 'collapse' }} {...props} />
      </Box>
    ),
    thead: (props: ComponentPropsWithoutRef<'thead'>) => (
      <Box component="thead" sx={{ bgcolor: 'grey.100' }} {...props} />
    ),
    tr: (props: ComponentPropsWithoutRef<'tr'>) => (
      <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }} {...props} />
    ),
    th: (props: ComponentPropsWithoutRef<'th'>) => (
      <Box component="th" sx={{ p: 1.5, fontWeight: 'bold' }} {...props} />
    ),
    td: (props: ComponentPropsWithoutRef<'td'>) => (
      <Box component="td" sx={{ p: 1.5 }} {...props} />
    ),
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
    blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
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
  } as Components;

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
