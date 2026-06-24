import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const components: Partial<Components> = {
  table: ({ children }) => (
    <div style={{ overflowX: "auto", margin: "12px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ border: "1px solid #d1d5db", padding: "8px 12px", background: "#f3f4f6", textAlign: "left", fontSize: "13px" }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ border: "1px solid #d1d5db", padding: "8px 12px", fontSize: "13px" }}>{children}</td>
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontSize: "13px", color: "#dc2626" }} {...props}>{children}</code>;
    }
    return <code className={className} {...props}>{children}</code>;
  },
  pre: ({ children }) => (
    <pre style={{ background: "#1e293b", color: "#e2e8f0", padding: "16px", borderRadius: "8px", overflow: "auto", fontSize: "13px", lineHeight: "1.5" }}>{children}</pre>
  ),
  h1: ({ children }) => <h1 style={{ fontSize: "24px", color: "#0f172a", margin: "24px 0 12px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: "20px", color: "#1e293b", margin: "20px 0 10px" }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: "16px", color: "#334155", margin: "16px 0 8px" }}>{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft: "4px solid #3b82f6", padding: "8px 16px", margin: "12px 0", background: "#f8fafc", borderRadius: "0 8px 8px 0" }}>{children}</blockquote>
  ),
  a: ({ href, children }) => <a href={href} style={{ color: "#3b82f6" }}>{children}</a>,
};

interface Props {
  content: string;
}

export const MarkdownRenderer = ({ content }: Props) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};
