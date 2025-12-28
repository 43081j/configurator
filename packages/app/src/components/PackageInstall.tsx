import {useState} from 'preact/hooks';

type PackageManager = 'npm' | 'pnpm' | 'yarn';

interface PackageInstallProps {
  packages: string[];
  isDev: boolean;
}

export function PackageInstall({packages, isDev}: PackageInstallProps) {
  const [activeManager, setActiveManager] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState(false);

  const getInstallCommand = (manager: PackageManager): string => {
    const pkgs = packages.join(' ');

    switch (manager) {
      case 'npm':
        return `npm i ${isDev ? '-D' : '-S'} ${pkgs}`;
      case 'pnpm':
        return `pnpm add ${isDev ? '-D' : ''} ${pkgs}`;
      case 'yarn':
        return `yarn add ${isDev ? '-D' : ''} ${pkgs}`;
    }
  };

  const copyToClipboard = async () => {
    const command = getInstallCommand(activeManager);
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const managers: PackageManager[] = ['npm', 'pnpm', 'yarn'];

  return (
    <div>
      <div class="flex border-b border-gray-700 mb-2">
        {managers.map((manager) => (
          <button
            key={manager}
            onClick={() => setActiveManager(manager)}
            class={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeManager === manager
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {manager}
          </button>
        ))}
      </div>

      <div class="relative">
        <pre class="font-mono text-sm bg-gray-900 text-gray-100 p-4 pr-12 rounded-lg overflow-auto">
          <code>{getInstallCommand(activeManager)}</code>
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
    </div>
  );
}
