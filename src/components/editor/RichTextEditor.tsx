import React, { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  height?: number;
}

export const RichTextEditor: React.FC<Props> = ({
  value,
  onChange,
  label,
  required = false,
  height = 300
}) => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      // Cleanup editor instance on unmount
      if (editorRef.current) {
        editorRef.current.remove();
      }
    };
  }, []);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        value={value}
        onEditorChange={onChange}
        init={{
          height,
          menubar: true,
          readonly: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          branding: false,
          promotion: false,
          statusbar: true,
          resize: true,
          elementpath: true,
          verify_html: true,
          forced_root_block: 'p',
          entity_encoding: 'raw',
          setup: (editor) => {
            editor.on('init', () => {
              editor.setContent(value || '');
            });
          }
        }}
      />
    </div>
  );
};