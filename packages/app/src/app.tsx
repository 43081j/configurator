import {Sidebar} from './components/Sidebar.js';

export function App() {
  return (
    <div class="flex h-screen">
      <Sidebar />
      <main class="flex-1 p-8 bg-gray-50">
        <div class="max-w-4xl">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">test</h2>
        </div>
      </main>
    </div>
  );
}
