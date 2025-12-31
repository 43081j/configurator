import {createTar, type TarFileInput} from 'nanotar';
import type {FileInfo} from '@43081j/configurator-core';

/**
 * Exports files as a tar archive and triggers a download
 */
export function exportFilesAsTar(
  files: FileInfo[],
  filename = 'config-files.tar'
): void {
  if (files.length === 0) {
    return;
  }

  const tarFiles = files.map<TarFileInput>((file) => ({
    name: file.name,
    data:
      typeof file.contents === 'string'
        ? file.contents
        : JSON.stringify(file.contents, null, 2)
  }));

  const tarData = createTar(tarFiles);

  const blob = new Blob([tarData], {type: 'application/x-tar'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
