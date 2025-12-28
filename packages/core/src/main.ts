import {processor as oxlintProcessor} from './processors/oxlint.js';
import type {Context, Processor} from './types.js';

export * from './types.js';

const processors = new Set<Processor>([oxlintProcessor]);

export async function execute(context: Context): Promise<void> {
  for (const processor of processors) {
    await processor(context);
  }
}
