// components/RichTextEditor.jsx
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './RichTextEditor.module.css';

const RichTextEditor = ({ value, onChange }) => {
    return (
        <div className={styles.editorWrapper}>
            <ReactQuill
                value={value}
                onChange={onChange}
                theme="snow"
                placeholder="Nhập nội dung tại đây..."
                className={styles.quill}
                modules={{
                    toolbar: [
                        [{ header: '1' }, { header: '2' }, { font: [] }],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ align: [] }],
                        [{ color: [] }, { background: [] }],
                        ['link', 'image'],
                        ['clean'],
                        ['code-block'],
                    ],
                }}
                formats={[
                    'header',
                    'font',
                    'bold',
                    'italic',
                    'underline',
                    'strike',
                    'blockquote',
                    'list',
                    'bullet',
                    'indent',
                    'link',
                    'image',
                    'color',
                    'background',
                    'align',
                    'code-block',
                ]}
            />
        </div>
    );
};

export default RichTextEditor;
