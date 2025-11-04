'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  className,
  disabled = false,
  name,
}: RichTextEditorProps) {
  const [quill, setQuill] = React.useState<Quill | null>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);

  // Store onChange in a ref to avoid re-registering the event handler
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    if (!editorRef.current || quill) return;

    const toolbarConfig = [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      [{ color: [] }, { background: [] }],
      ['code-block'],
      ['clean'],
    ];

    const editor = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder,
      readOnly: disabled,
      modules: {
        toolbar: toolbarConfig,
        clipboard: {
          matchVisual: false,
        },
      },
    });

    if (value) {
      editor.root.innerHTML = value;
    } else {
      editor.root.innerHTML = '<p><br></p>';
    }

    const handleTextChange = () => {
      const html = editor.root.innerHTML;
      const cleanHtml = html === '<p><br></p>' ? '' : html;
      onChangeRef.current?.(cleanHtml);
    };

    editor.on('text-change', handleTextChange);

    setQuill(editor);

    return () => {
      editor.off('text-change', handleTextChange);
    };
  }, [disabled, placeholder]);

  React.useEffect(() => {
    if (!quill) return;
    const currentContent = quill.root.innerHTML;
    const normalizedValue = value || '<p><br></p>';
    
    // Only update if the value has actually changed and is different from current content
    // This prevents infinite loops
    if (currentContent !== normalizedValue) {
      // Use updateContents with 'silent' to prevent triggering text-change event
      const delta = quill.clipboard.convert({ html: normalizedValue });
      quill.setContents(delta, 'silent');
    }
  }, [value, quill]);

  React.useEffect(() => {
    if (!quill) return;
    quill.enable(!disabled);
  }, [disabled, quill]);

  return (
    <div className={cn('w-full', className)} style={{ marginBottom: '4rem' }}>
      <div ref={editorRef} />
      {name && (
        <input
          type="hidden"
          name={name}
          value={quill ? (quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML) : value}
        />
      )}
    </div>
  );
}
