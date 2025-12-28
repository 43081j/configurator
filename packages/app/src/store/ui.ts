import {signal} from '@preact/signals';

export const activeTab = signal<string>('summary');
export const sidebarOpen = signal<boolean>(false);
