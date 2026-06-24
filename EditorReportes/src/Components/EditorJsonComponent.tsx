import { EditorBaseComponent } from './EditorBaseComponent';

interface Props {
  jsonProp: string;
  setJsonProp: (json: string) => void;
  readOnly?: boolean;
  onAttemptEditLocked?: () => void;
}

export const EditorJsonComponent = ({ 
  jsonProp, 
  setJsonProp, 
  readOnly = false, 
  onAttemptEditLocked = () => {} }: Props) => {
  const handleChange = (value: string) => {
    try {
      setJsonProp(JSON.stringify(JSON.parse(value), null, 2));
    } catch (e) {
      setJsonProp(value);
    }
  };

  return (
    <EditorBaseComponent
      label="Editor JSON"
      value={JSON.stringify(JSON.parse(jsonProp), null, 2)}
      onChange={handleChange}
      language='json'
      readOnly={readOnly}
      onAttemptEditLocked={onAttemptEditLocked}
    />
  );
};
