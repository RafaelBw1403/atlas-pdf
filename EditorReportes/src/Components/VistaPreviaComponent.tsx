import { useRef } from "react";
import { Typography } from "antd";

const { Text } = Typography;

type Props = {
  htmlProp: string;
  error?: string | null;
}

export const VistaPreviaComponent = ({
  htmlProp,
  error
}: Props) => {

  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div style={{ width: "100%", height: "100%", border: "none" }}>
      <Text
        type={error ? "danger" : "secondary"}
        italic
        style={{ fontSize: '12px', display: 'block', marginBottom: 12 }}
        title={error || undefined}
      >
        * Esta es una aproximación visual. El formato final puede variar ligeramente en el PDF generado.
        {/* {error && (
          <span> ⚠️ Error de compilación — pasa el mouse aquí o abre la consola (F12)</span>
        )} */}
      </Text>
      <iframe
        ref={iframeRef}
        title="preview"
        srcDoc={htmlProp}
        style={{ 
          width: "100%", 
          height: "100%", 
          border: "none",
          paddingBottom: "98px"
        }}
      />
    </div>
  );
};

