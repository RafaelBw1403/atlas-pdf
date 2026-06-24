// MonacoCodeEditor.tsx - Versión con formateo
import { useEffect } from 'react';
import Editor, { useMonaco } from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useCodeFormatter } from "../../hooks/useCodeFormatter";


type MonacoLang = "html" | "css" | "json";

type Props = {
    value: string;
    language: MonacoLang;
    onChange: (val: string) => void;
    height?: string | number;
    schema?: object;
    path?: string;
    onFormat?: number;
    autocompleteJson?: Record<string, any>;
    /** Si true, el editor se muestra en modo solo lectura */
    readOnly?: boolean;
    /** Callback que se dispara cuando el usuario intenta editar en modo readOnly */
    onAttemptEditLocked?: () => void;
};

export default function MonacoCodeEditor({
    value,
    language,
    onChange,
    height = "100%",
    schema,
    path,
    onFormat,
    autocompleteJson,
    readOnly = false,
    onAttemptEditLocked,
}: Props) {
    const monaco = useMonaco();
    const { formatCode } = useCodeFormatter();

    const handleMount: OnMount = (editor, monaco) => {

        editor.updateOptions({
            automaticLayout: true,
            fontSize: 14,
            lineHeight: 1.5,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            minimap: { enabled: true },
            fontLigatures: true,
            renderWhitespace: "selection",
            readOnly: readOnly,
            scrollbar: {
                horizontal: "auto",
                vertical: "auto",
                useShadows: false,
            },
            quickSuggestions: !readOnly,
            suggestOnTriggerCharacters: !readOnly,
            parameterHints: { enabled: !readOnly },
        });

        // Si está en modo bloqueado, capturar intentos de escritura
        if (onAttemptEditLocked) {
            editor.onKeyDown((e) => {
                const currentReadOnly = editor.getOption(monaco.editor.EditorOption.readOnly);

                if (currentReadOnly) {
                    // Usar códigos numéricos de teclas
                    // 16: Shift, 17: Ctrl, 18: Alt, 37: Left, 38: Up, 39: Right, 40: Down
                    // 33: PageUp, 34: PageDown, 35: End, 36: Home
                    const navigationKeyCodes = [16, 17, 18, 37, 38, 39, 40, 33, 34, 35, 36];

                    if (!navigationKeyCodes.includes(e.keyCode)) {
                        e.preventDefault();
                        e.stopPropagation();
                        onAttemptEditLocked();
                    }
                }

            });
        }

        // Configurar shortcut Ctrl+Shift+F para formatear
        if (monaco) {
            editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
                () => {
                    if (readOnly) return;
                    const currentValue = editor.getValue();
                    const formatted = formatCode(currentValue, language);
                    editor.setValue(formatted);
                    onChange(formatted);
                }
            );

            // También registrar el comando nativo de formateo
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI, () => {
                if (readOnly) return;
                editor.getAction('editor.action.formatDocument')?.run();
            });
        }

        // Optional: wire JSON schema for validation/autocomplete
        if (language === "json" && schema) {
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                allowComments: true,
                schemas: [
                {
                    uri: "inmemory://schema/documentData.json",
                    fileMatch: ["*"],
                    schema,
                },
                ],
            });
        }
    };

    useEffect(() => {
        if (onFormat) {
            handleFormat();
        }
    }, [onFormat])

    // Efecto para formateo externo (desde botón)
    const handleFormat = () => {
        const formatted = formatCode(value, language);
        onChange(formatted);
    };

    useEffect(() => {
        if (!monaco || !autocompleteJson || language !== 'html') return;

        // Función para aplanar el JSON (ej: "cliente.nombre")
        const getSuggestions = (obj: any, monaco: any, prefix = ""): any[] => {
            let suggestions: any[] = [];
            for (const key in obj) {
            const fullPath = prefix ? `${prefix}.${key}` : key;
            
            suggestions.push({
                label: fullPath,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: fullPath,
                detail: typeof obj[key] === 'object' ? 'Objeto' : String(obj[key]),
                range: null // Monaco lo calcula automáticamente si es null
            });

            if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
                suggestions = suggestions.concat(getSuggestions(obj[key], monaco, fullPath));
            }
            }
            return suggestions;
        };

        // Registramos el proveedor
        const provider = monaco.languages.registerCompletionItemProvider('html', {
            triggerCharacters: ['{'],
            provideCompletionItems: (model, position) => {
            const textUntilPosition = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
            });

            // Solo sugerir si el usuario escribió "{{"
            if (!textUntilPosition.endsWith('{{')) {
                return { suggestions: [] };
            }

            return {
                suggestions: getSuggestions(autocompleteJson, monaco)
            };
            },
        });

        // LIMPIEZA: IMPORTANTE
        return () => provider.dispose(); 
    }, [autocompleteJson, language]);


    return (
        <div style={{ height, minHeight: 0, overflow: "hidden", position: 'relative' }}>
            {readOnly && (
                <div style={{
                    position: 'absolute', top: 8, right: 12, zIndex: 10,
                    background: 'rgba(0,0,0,0.55)', color: '#fff',
                    padding: '2px 10px', borderRadius: 4, fontSize: 11,
                    pointerEvents: 'none', letterSpacing: 1
                }}>
                    SOLO LECTURA
                </div>
            )}
            <Editor
                theme="vs-dark"
                language={language}
                value={value}
                onChange={(v) => onChange(v ?? "")}
                onMount={handleMount}
                height="100%"
                {...(path ? { path } : {})}
                keepCurrentModel={false}
                options={{
                    automaticLayout: true,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineHeight: 1.5,
                    readOnly: readOnly,
                    suggestOnTriggerCharacters: !readOnly,
                    quickSuggestions: !readOnly,
                    parameterHints: { enabled: !readOnly },
                    snippetSuggestions: "top",
                    quickSuggestionsDelay: 100,
                    suggest: {
                        showMethods: true,
                        showFunctions: true,
                        showConstructors: true,
                        showDeprecated: true,
                        showFields: true,
                        showVariables: true,
                        showClasses: true,
                        showStructs: true,
                        showInterfaces: true,
                        showModules: true,
                        showProperties: true,
                        showEvents: true,
                        showOperators: true,
                        showUnits: true,
                        showValues: true,
                        showConstants: true,
                        showEnums: true,
                        showEnumMembers: true,
                        showKeywords: true,
                        showWords: true,
                        showColors: true,
                        showFiles: true,
                        showReferences: true,
                        showFolders: true,
                        showTypeParameters: true,
                        showSnippets: true
                    }
                }}
            />
        </div>
    );
}