import {useEffect, useState} from 'preact/hooks';
import {config} from '../store/config.js';
import {activeTab, sidebarOpen} from '../store/ui.js';
import {SummaryTab} from './SummaryTab.js';
import {FileTab} from './FileTab.js';
import {exportFilesAsTar} from '../utils/export.js';
import {generateContent, type GeneratedContent} from '../utils/generate.js';

export function ContentPanel() {
  const [content, setContent] = useState<GeneratedContent>({
    files: [],
    dependencies: new Map(),
    devDependencies: new Map(),
    error: undefined,
    packageJSON: {}
  });

  useEffect(() => {
    const runGeneration = async () => {
      const result = await generateContent(config.value);
      setContent(result);
      if (
        activeTab.value !== 'summary' &&
        !result.files.some((file) => file.name === activeTab.value)
      ) {
        activeTab.value = 'summary';
      }
    };

    runGeneration();
  }, [config.value]);

  const tabs = [
    {id: 'summary', label: 'Summary'},
    ...content.files.map((file) => ({id: file.name, label: file.name}))
  ];

  return (
    <div class="flex flex-col h-full">
      <div class="flex border-b border-gray-200 bg-white">
        <div class="flex-shrink-0 md:hidden flex items-center">
          <button
            onClick={() => (sidebarOpen.value = true)}
            class="p-2 ml-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <div class="i-material-symbols-menu text-2xl text-gray-700" />
          </button>
        </div>

        <div class="flex-1 overflow-x-auto flex items-center">
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

        <div class="flex-shrink-0 flex items-center">
          <button
            onClick={() => exportFilesAsTar(content.files)}
            disabled={content.files.length === 0}
            class="mr-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center gap-2 text-sm font-medium cursor-pointer"
            aria-label="Export files as tar"
            title="Export files as tar"
          >
            <span>Export</span>
            <div class="i-material-symbols-download text-xl" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-6">
        {activeTab.value === 'summary' ? (
          <SummaryTab
            files={content.files}
            dependencies={content.dependencies}
            devDependencies={content.devDependencies}
            error={content.error}
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
