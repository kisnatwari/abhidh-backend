import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Undo,
  Redo
} from 'lucide-react';

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
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [isStrikethrough, setIsStrikethrough] = React.useState(false);
  const [isCode, setIsCode] = React.useState(false);

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Initialize content on mount
  React.useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    if (!editorRef.current) return;
    
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    setIsStrikethrough(document.queryCommandState('strikeThrough'));
    setIsCode(document.queryCommandState('code'));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          execCommand('undo');
          break;
        case 'y':
          e.preventDefault();
          execCommand('redo');
          break;
      }
    }
  };

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'underline':
        execCommand('underline');
        break;
      case 'strikethrough':
        execCommand('strikeThrough');
        break;
      case 'code':
        execCommand('code');
        break;
    }
  };

  const formatHeading = (headingSize: string) => {
    execCommand('formatBlock', headingSize);
  };

  const insertList = (type: 'ul' | 'ol') => {
    execCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
  };

  const insertQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertCode = () => {
    execCommand('formatBlock', 'pre');
  };

  return (
    <div className={cn('border rounded-md', className)}>
      <ToolbarPlugin
        onFormatText={formatText}
        onFormatHeading={formatHeading}
        onInsertList={insertList}
        onInsertQuote={insertQuote}
        onInsertLink={insertLink}
        onInsertCode={insertCode}
        onUndo={() => execCommand('undo')}
        onRedo={() => execCommand('redo')}
        isBold={isBold}
        isItalic={isItalic}
        isUnderline={isUnderline}
        isStrikethrough={isStrikethrough}
        isCode={isCode}
      />
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={updateToolbarState}
          onKeyUp={updateToolbarState}
          className={cn(
            'min-h-[200px] p-3 focus:outline-none prose max-w-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ 
            whiteSpace: 'pre-wrap', 
            direction: 'ltr', 
            textAlign: 'left',
            unicodeBidi: 'normal'
          }}
          suppressContentEditableWarning={true}
        />
        {!value && (
          <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
      
      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
        />
      )}
    </div>
  );
}

interface ToolbarPluginProps {
  onFormatText: (format: string) => void;
  onFormatHeading: (headingSize: string) => void;
  onInsertList: (type: 'ul' | 'ol') => void;
  onInsertQuote: () => void;
  onInsertLink: () => void;
  onInsertCode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
}

function ToolbarPlugin({
  onFormatText,
  onFormatHeading,
  onInsertList,
  onInsertQuote,
  onInsertLink,
  onInsertCode,
  onUndo,
  onRedo,
  isBold,
  isItalic,
  isUnderline,
  isStrikethrough,
  isCode,
}: ToolbarPluginProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('bold')}
          className={cn(isBold && 'bg-muted')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('italic')}
          className={cn(isItalic && 'bg-muted')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('underline')}
          className={cn(isUnderline && 'bg-muted')}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('strikethrough')}
          className={cn(isStrikethrough && 'bg-muted')}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('code')}
          className={cn(isCode && 'bg-muted')}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormatHeading('h1')}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormatHeading('h2')}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormatHeading('h3')}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onInsertList('ul')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onInsertList('ol')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onInsertQuote}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onInsertLink}
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onInsertCode}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onUndo}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRedo}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}