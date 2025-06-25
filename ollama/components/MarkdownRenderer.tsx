// components/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Typography, Box } from '@mui/material';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const components: Components = {
    h1: ({ node, ...props }) => (
      <Typography variant="h4" gutterBottom {...props} />
    ),
    h2: ({ node, ...props }) => (
      <Typography variant="h5" gutterBottom {...props} />
    ),
    h3: ({ node, ...props }) => (
      <Typography variant="h6" gutterBottom {...props} />
    ),
    p: ({ node, ...props }) => (
      <Typography variant="body1" paragraph {...props} />
    ),
    ul: ({ node, ...props }) => (
      <Typography component="ul" sx={{ pl: 4 }} {...props} />
    ),
    ol: ({ node, ...props }) => (
      <Typography component="ol" sx={{ pl: 4 }} {...props} />
    ),
    li: ({ node, ...props }) => (
      <Typography component="li" {...props} />
    ),
    table: ({ node, ...props }) => (
      <Box component="div" sx={{ overflowX: 'auto', my: 2 }}>
        <Box component="table" sx={{ minWidth: 650, borderCollapse: 'collapse' }} {...props} />
      </Box>
    ),
    thead: ({ node, ...props }) => (
      <Box component="thead" sx={{ bgcolor: 'grey.100' }} {...props} />
    ),
    tr: ({ node, ...props }) => (
      <Box component="tr" sx={{ borderBottom: 1, borderColor: 'divider' }} {...props} />
    ),
    th: ({ node, ...props }) => (
      <Box component="th" sx={{ p: 1.5, textAlign: 'left', fontWeight: 'bold' }} {...props} />
    ),
    td: ({ node, ...props }) => (
      <Box component="td" sx={{ p: 1.5 }} {...props} />
    ),
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={materialLight}
          language={match[1]}
          PreTag="div"
          showLineNumbers
          wrapLines
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
    blockquote: ({ node, ...props }) => (
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
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
