import { pooledMap } from 'https://deno.land/std/async/pool.ts'
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { Asset, Release } from './release.ts'
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
      total: a.size
    }

    
    const dir = `dist/release/${a.tag_name}`
    await mkdirIfNotExist(dir)
    const file = await Deno.open(`${dir}/${a.name}`, {create: true, write: true, append: false})
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

pooledMap(3, downloadPromises, promise => {
  return promise().catch(e => {
    console.error(e)
    return Promise.reject(e)
  })
} )

async function assetsNeedDownload() {
  const url = 'https://api.github.com/repos/logseq/logseq/releases?per_page=100'
  const res = await fetch(url);
  const releases: Release[] = await res.json()

  let ret: Asset[] = []
  if (existsSync(ReleaseJson)) {
    const lastRelease: Release[] = JSON.parse(Deno.readTextFileSync(ReleaseJson).toString())
    const lastReleaseAssets = lastRelease.flatMap(r => r.assets)

    ret = releases.flatMap(r => r.assets.map(a => ({...a, tag_name: r.tag_name})))
    .filter(a => lastReleaseAssets.find(
      la => la.name + la.updated_at === a.name + a.updated_at) === undefined
    )
  } else {
    ret = releases.flatMap(r => r.assets.map(a => ({...a, tag_name: r.tag_name})))
  }

  if (ret.length > 0) {
    Deno.writeTextFileSync(ReleaseJson, JSON.stringify(releases, null, 2), { append: false, create: true})
  }

  return ret
}

function mkdirIfNotExist(dir: string) {
  return Deno.mkdir(dir, {recursive: true}).catch(() => {
    console.log('file exist')
  })
}