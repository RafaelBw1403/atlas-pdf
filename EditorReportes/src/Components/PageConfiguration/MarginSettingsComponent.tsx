import { InputNumber } from "antd";
import type { IMarginSettings } from "../../interfaces/IPrintSettings";


interface MarginSettingsProps {
  margins: IMarginSettings;
  onMarginsChange: (newMargins: IMarginSettings) => void;
  readOnly?: boolean;
}

// --- 2. COMPONENTE ---

export const MarginSettingsComponent = ({ margins, onMarginsChange, readOnly = false }: MarginSettingsProps) => {

  return (
    <div className="print-settings-section">
      <h4 className="print-settings-title">
        Márgenes (mm)
      </h4>
      
      <div className="print-settings-row">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <div key={side} className="print-settings-col">
            <label className="print-settings-label">
              {side.charAt(0).toUpperCase() + side.slice(1)}
            </label>
            <InputNumber
                className="print-settings-input"
                min = {0}
                step="1"
                precision={1}
                value={margins[side]}
                onChange={(val) => {
                    if (readOnly) return;
                    onMarginsChange({
                        ...margins,
                        [side]: val || 0
                    });
                }}
                placeholder="0"
                disabled={readOnly}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
