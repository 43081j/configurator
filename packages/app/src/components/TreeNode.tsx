export interface TreeNodeData {
  name: string;
  path: string;
  children: Map<string, TreeNodeData>;
  isFile: boolean;
}

export interface TreeNodeProps {
  node: TreeNodeData;
  depth: number;
  onFileClick: ((path: string) => void) | undefined;
}

export function TreeNode({node, depth, onFileClick}: TreeNodeProps) {
  const hasChildren = node.children.size > 0;
  const sortedChildren = Array.from(node.children.values()).sort((a, b) => {
    if (a.isFile !== b.isFile) {
      return a.isFile ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      {node.name && (
        <div
          class={`text-sm text-gray-700 flex items-center ${node.isFile ? 'cursor-pointer hover:bg-gray-100 -mx-2 px-2 py-1 rounded' : ''}`}
          style={{paddingLeft: `${depth * 1.25}rem`}}
          onClick={() => node.isFile && onFileClick?.(node.path)}
        >
          <span
            class={`mr-2 ${node.isFile ? 'i-material-symbols-description text-gray-400' : 'i-material-symbols-folder text-blue-500'}`}
          />
          <span class={node.isFile ? 'font-mono' : 'font-mono text-blue-600'}>
            {node.name}
          </span>
        </div>
      )}
      {hasChildren && (
        <>
          {sortedChildren.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </>
      )}
    </>
  );
}
