import {useState} from 'preact/hooks';
import type {FileInfo} from '@43081j/configurator-core';

export interface FileTabProps {
  file: FileInfo | undefined;
}

export function FileTab({file}: FileTabProps) {
  const [copied, setCopied] = useState(false);

  if (!file) {
    return <p class="text-gray-500">No file to display</p>;
  }

  const content =
    typeof file.contents === 'string'
      ? file.contents
      : JSON.stringify(file.contents, null, 2);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class="relative">
      <pre class="font-mono text-sm bg-gray-900 text-gray-100 p-4 pr-12 rounded-lg overflow-auto">
        <code>{content}</code>
      </pre>
      <button
        onClick={copyToClipboard}
        class="absolute top-3 right-3 px-2 py-1.5 rounded hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200 flex items-center gap-1"
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        <div
          class={
            copied
              ? 'i-material-symbols:assignment-turned-in text-green-400'
              : 'i-material-symbols:assignment'
          }
        />
        {copied && <span class="text-xs text-green-400">Copied</span>}
      </button>
    </div>
  );
}
