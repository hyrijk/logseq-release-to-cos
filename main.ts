import { pooledMap } from 'https://deno.land/std/async/pool.ts'
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { Release } from './release.ts'
import { RenderOptions, update } from './progressbar.ts';

const ReleaseJson = 'dist/release.json'
const assets = await assetsNeedDownload()
console.log('assets to download', assets.map(a => a.name))
const downloadPromises = assets.map(a => {

  return async function download() {
    const res = await fetch(a.browser_download_url)
    const bar:RenderOptions = { 
      text: a.name,
      completed: 0,
      total: +res.headers.get('Content-Length')!
    }

    const file = await Deno.open('dist/' + a.name, {create: true, write: true, append: false})
    for await (const chunk of res.body!) {
      await Deno.writeAll(file, chunk) 
      bar.completed += chunk.length
      update(bar)
    }
    bar.completed = bar.total
    update(bar)
    file.close()
  }
})

pooledMap(3, downloadPromises, promise => promise())

async function assetsNeedDownload() {
  const url = 'https://api.github.com/repos/logseq/logseq/releases?per_page=100'
  const res = await fetch(url);
  const releases: Release[] = await res.json()

  let ret = []
  if (existsSync(ReleaseJson)) {
    const lastRelease: Release[] = JSON.parse(Deno.readTextFileSync(ReleaseJson).toString())
    const lastReleaseAssets = lastRelease.flatMap(r => r.assets)

    ret = releases.flatMap(r => r.assets).filter(a => lastReleaseAssets.find(
      la => la.name + la.updated_at === a.name + a.updated_at) === undefined
    )
  } else {
    ret = releases.flatMap(r => r.assets)
  }

  if (ret.length > 0) {
    Deno.writeTextFileSync(ReleaseJson, JSON.stringify(releases, null, 2), { append: false, create: true})
  }

  return ret
}