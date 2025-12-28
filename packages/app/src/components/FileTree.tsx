import type {FileInfo} from '@43081j/configurator-core';
import {TreeNode, type TreeNodeData} from './TreeNode.js';

function buildTree(files: FileInfo[]): TreeNodeData {
  const root: TreeNodeData = {
    name: '',
    path: '',
    children: new Map<string, TreeNodeData>(),
    isFile: false
  };

  for (const file of files) {
    const parts = file.name.split('/');
    let currentNode = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isLastPart = i === parts.length - 1;

      let child = currentNode.children.get(part);

      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          children: new Map(),
          isFile: isLastPart
        };
        currentNode.children.set(part, child);
      }

      currentNode = child;
    }
  }

  return root;
}

export interface FileTreeProps {
  files: FileInfo[];
  onFileClick?: (path: string) => void;
}

export function FileTree({files, onFileClick}: FileTreeProps) {
  const tree = buildTree(files);
  const rootChildren = Array.from(tree.children.values()).sort((a, b) => {
    if (a.isFile !== b.isFile) {
      return a.isFile ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div class="space-y-0.5 bg-gray-50 border border-gray-200 rounded-lg p-4">
      {rootChildren.map((child) => (
        <TreeNode
          key={child.path}
          node={child}
          depth={0}
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
}
