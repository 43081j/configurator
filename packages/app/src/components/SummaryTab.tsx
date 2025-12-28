import type {FileInfo} from '@43081j/configurator-core';
import {PackageInstall} from './PackageInstall.js';

export interface SummaryTabProps {
  files: FileInfo[];
  dependencies: Map<string, string>;
  devDependencies: Map<string, string>;
}

export function SummaryTab({
  files,
  dependencies,
  devDependencies
}: SummaryTabProps) {
  const depsArray = Array.from(dependencies.entries()).map(
    ([name, version]) => `${name}@${version}`
  );
  const devDepsArray = Array.from(devDependencies.entries()).map(
    ([name, version]) => `${name}@${version}`
  );

  return (
    <div class="space-y-6">
      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          Generated Files
        </h3>
        {files.length === 0 ? (
          <p class="text-gray-500 text-sm">No files generated</p>
        ) : (
          <ul class="list-disc list-inside space-y-1">
            {files.map((file) => (
              <li key={file.name} class="text-sm text-gray-700">
                <span class="font-mono">{file.name}</span>
              </li>
            ))}
          </ul>
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
