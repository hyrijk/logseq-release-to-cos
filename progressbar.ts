import { MultiProgressBar } from 'https://deno.land/x/progress@v1.2.3/mod.ts';

const bar = new MultiProgressBar({
  title: 'downloading',
  complete: '=',
  incomplete: '-',
  display: '[:bar] :text :percent :time :completed/:total'
})

export interface RenderOptions {
  completed: number;
  text: string;
  total: number;
}

const bars: RenderOptions[] = []

export function update(options: RenderOptions) {
  const index = bars.findIndex(b => b === options) 
  if (index !== -1) {
    bars.splice(index, 1, options)
  } else {
    bars.push(options)
  }
  bar.render(bars)
}