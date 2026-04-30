import { useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function AbapEditor({ code }: { code: string }) {
  const editorRef = useRef<any>(null);

  const handleMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <Editor
        height="100%"
        defaultLanguage="abap"
        defaultValue={code}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 16 },
          renderLineHighlight: 'line',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
        }}
      />
    </div>
  );
}
