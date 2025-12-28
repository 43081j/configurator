import {Sidebar} from './components/Sidebar.js';
import {ContentPanel} from './components/ContentPanel.js';

export function App() {
  return (
    <div class="relative md:flex h-screen">
      <Sidebar />
      <main class="flex-1 bg-gray-50 w-full md:w-auto h-screen overflow-hidden">
        <ContentPanel />
      </main>
    </div>
  );
}
