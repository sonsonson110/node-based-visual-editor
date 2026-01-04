import Quill, { Delta, Range } from "quill";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
  readOnly?: boolean;
  defaultValue?: Delta;
  onTextChange?: (delta: Delta, oldDelta: Delta, source: string) => void;
  onSelectionChange?: (range: Range, oldRange: Range, source: string) => void;
  placeholder?: string;
  modules?: Record<string, unknown>;
  formats?: string[];
}

const RichTextEditor = forwardRef<Quill | null, RichTextEditorProps>(
  (
    {
      readOnly = false,
      defaultValue,
      onTextChange,
      onSelectionChange,
      placeholder = "Write something...",
      modules,
      formats,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    // Keep callbacks up to date
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    // Update readOnly mode
    useEffect(() => {
      if (typeof ref === "function") return;
      ref?.current?.enable(!readOnly);
    }, [ref, readOnly]);

    // Initialize Quill
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );

      const quill = new Quill(editorContainer, {
        theme: "snow",
        placeholder,
        modules,
        formats,
      });

      // Set ref
      if (typeof ref === "function") {
        ref(quill);
      } else if (ref) {
        ref.current = quill;
      }

      // Set initial content
      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      // Register event listeners
      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      // Cleanup
      return () => {
        if (typeof ref === "function") {
          ref(null);
        } else if (ref) {
          ref.current = null;
        }
        container.innerHTML = "";
      };
    }, [ref, placeholder, modules, formats]);

    return <div ref={containerRef}></div>;
  }
);

export default RichTextEditor;
