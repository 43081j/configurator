import type {FileInfo} from '@43081j/configurator-core';
import {PackageInstall} from './PackageInstall.js';
import {FileTree} from './FileTree.js';
import {activeTab} from '../store/ui.js';

export interface SummaryTabProps {
  files: FileInfo[];
  dependencies: Map<string, string>;
  devDependencies: Map<string, string>;
  error: string | undefined;
}

export function SummaryTab({
  files,
  dependencies,
  devDependencies,
  error
}: SummaryTabProps) {
  const handleFileClick = (path: string) => {
    activeTab.value = path;
  };
  const depsArray = Array.from(dependencies.entries()).map(
    ([name, version]) => `${name}@${version}`
  );
  const devDepsArray = Array.from(devDependencies.entries()).map(
    ([name, version]) => `${name}@${version}`
  );

  return (
    <div class="space-y-6">
      {error && (
        <section>
          <h3 class="text-lg font-semibold text-red-700 mb-3">Errors</h3>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">{error}</p>
          </div>
        </section>
      )}

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          Generated Files
        </h3>
        {files.length === 0 ? (
          <p class="text-gray-500 text-sm">No files generated</p>
        ) : (
          <FileTree files={files} onFileClick={handleFileClick} />
        )}
      </section>

      {devDepsArray.length > 0 && (
        <section>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            Install Dev Dependencies
          </h3>
          <PackageInstall packages={devDepsArray} isDev={true} />
        </section>
      )}

      {depsArray.length > 0 && (
        <section>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            Install Dependencies
          </h3>
          <PackageInstall packages={depsArray} isDev={false} />
        </section>
      )}
    </div>
  );
}
