import {Sidebar} from './components/Sidebar.js';
import {ContentPanel} from './components/ContentPanel.js';

export function App() {
  return (
    <div class="flex h-screen">
      <Sidebar />
      <main class="flex-1 bg-gray-50">
        <ContentPanel />
      </main>
    </div>
  );
}
