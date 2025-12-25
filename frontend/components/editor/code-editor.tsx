/**
 * Code Editor Component
 * Monaco Editor wrapper untuk menulis kode program
 */

"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { Card } from "@/components/ui/card";

interface EditorKodeProps {
  nilai: string;
  onChange: (nilai: string) => void;
  bahasa?: string;
  tinggi?: string;
  placeholder?: string;
}

export function EditorKode({
  nilai,
  onChange,
  bahasa = "python",
  tinggi = "400px",
  placeholder = "// Tulis kode Anda di sini...",
}: EditorKodeProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <Card className="overflow-hidden">
      <Editor
        height={tinggi}
        defaultLanguage={bahasa}
        language={bahasa}
        value={nilai}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            <p>Memuat editor...</p>
          </div>
        }
      />
    </Card>
  );
}
