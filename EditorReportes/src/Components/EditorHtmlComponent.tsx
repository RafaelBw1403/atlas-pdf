// EditorHtmlComponent.tsx - Versión simplificada y corregida
import React, { useCallback, useState } from "react";
import { debounce } from 'lodash';
import { EditorBaseComponent } from "./EditorBaseComponent";

type Props = {
  htmlCodeprop: string;
  setHtmlCodeProp: (html: string) => void;
  jsonStringProp?: Record<string, any>;
  readOnly?: boolean;
  onAttemptEditLocked?: () => void;
}

export const EditorHtmlComponent = React.memo(({
  htmlCodeprop,
  setHtmlCodeProp,
  jsonStringProp,
  readOnly = false,
  onAttemptEditLocked = () => {},
}: Props) => {
  const [error, setError] = useState("");

  const debouncedProcess = useCallback(
    debounce((html: string) => {
      setHtmlCodeProp(html);
    }, 500),
    [setHtmlCodeProp]
  );

  const handleChange = useCallback((value: string) => {
    debouncedProcess(value);
  }, [debouncedProcess]);

  return (
    <EditorBaseComponent
      key={`html-editor-${readOnly}`}
      label="HTML"
      value={htmlCodeprop}
      onChange={handleChange}
      language="html"
      error={error}
      autocompleteJson={jsonStringProp || {}}
      readOnly={readOnly}
      onAttemptEditLocked={onAttemptEditLocked}
    />
  );
});