import {useEffect, useState} from 'preact/hooks';
import {execute} from '@43081j/configurator-core';
import type {FileInfo} from '@43081j/configurator-core';
import {config} from '../store/config.js';
import {activeTab} from '../store/ui.js';
import {SummaryTab} from './SummaryTab.js';
import {FileTab} from './FileTab.js';

interface GeneratedContent {
  files: FileInfo[];
  dependencies: Map<string, string>;
  devDependencies: Map<string, string>;
}

export function ContentPanel() {
  const [content, setContent] = useState<GeneratedContent>({
    files: [],
    dependencies: new Map(),
    devDependencies: new Map()
  });

  useEffect(() => {
    const generateContent = async () => {
      const files: FileInfo[] = [];
      const dependencies = new Map<string, string>();
      const devDependencies = new Map<string, string>();

      await execute({
        config: config.value,
        emitFile: async (file) => {
          files.push(file);
        },
        addDependency: (name, version) => {
          dependencies.set(name, version);
        },
        addDevDependency: (name, version) => {
          devDependencies.set(name, version);
        }
      });

      setContent({files, dependencies, devDependencies});
      activeTab.value = 0;
    };

    generateContent();
  }, [config.value]);

  const tabs = ['Summary', ...content.files.map((file) => file.name)];

  return (
    <div class="flex flex-col h-full">
      <div class="flex border-b border-gray-200 bg-white">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => (activeTab.value = index)}
            class={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab.value === index
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div class="flex-1 overflow-auto p-6">
        {activeTab.value === 0 ? (
          <SummaryTab
            files={content.files}
            dependencies={content.dependencies}
            devDependencies={content.devDependencies}
          />
        ) : (
          <FileTab file={content.files[activeTab.value - 1]} />
        )}
      </div>
    </div>
  );
}
