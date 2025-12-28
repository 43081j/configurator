import {useEffect, useState} from 'preact/hooks';
import {execute} from '@43081j/configurator-core';
import type {FileInfo} from '@43081j/configurator-core';
import {config} from '../store/config.js';
import {activeTab, sidebarOpen} from '../store/ui.js';
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
      // Reset to summary only if current active tab no longer exists
      if (
        activeTab.value !== 'summary' &&
        !files.some((file) => file.name === activeTab.value)
      ) {
        activeTab.value = 'summary';
      }
    };

    generateContent();
  }, [config.value]);

  const tabs = [
    {id: 'summary', label: 'Summary'},
    ...content.files.map((file) => ({id: file.name, label: file.name}))
  ];

  return (
    <div class="flex flex-col h-full">
      <div class="flex items-center border-b border-gray-200 bg-white overflow-x-auto">
        <button
          onClick={() => (sidebarOpen.value = true)}
          class="md:hidden sticky left-0 p-2 ml-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 bg-white z-10"
          aria-label="Open menu"
        >
          <div class="i-material-symbols-menu text-2xl text-gray-700" />
        </button>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => (activeTab.value = tab.id)}
            class={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex-shrink-0 whitespace-nowrap ${
              activeTab.value === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div class="flex-1 overflow-auto p-6">
        {activeTab.value === 'summary' ? (
          <SummaryTab
            files={content.files}
            dependencies={content.dependencies}
            devDependencies={content.devDependencies}
          />
        ) : (
          <FileTab
            file={content.files.find((file) => file.name === activeTab.value)!}
          />
        )}
      </div>
    </div>
  );
}
