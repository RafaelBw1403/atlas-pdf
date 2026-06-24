

// import { useEffect } from 'react';
// import { useReporteStore } from '../store/useReportStore';
import React, { useCallback, useEffect } from 'react';
import { EditorBaseComponent } from './EditorBaseComponent';
// import { getExtensions } from '../utils/codeMirrorExtensions';

type Props = {
  cssProp: string;
  setCssProp: ( css: string ) => void;
  readOnly?: boolean;
  onAttemptEditLocked?: () => void;
}

export const EditorCssComponent = React.memo(({ 
  cssProp, 
  setCssProp, 
  readOnly = false, 
  onAttemptEditLocked = () => {} }: Props) => {
  // const { css: cssCode, setCss } = useReporteStore();

  const handleCssChange = (val: string) => {
    console.log("[CSS onChange] ->", val.slice(0, 40));
    setCssProp(val);
  };
  

  return (
    <EditorBaseComponent
      label="Editor CSS"
      value={cssProp}
      onChange={handleCssChange}
      language='css'
      path='file:///editor-css.css'
      readOnly={readOnly}
      onAttemptEditLocked={onAttemptEditLocked}
    />
  );
});
