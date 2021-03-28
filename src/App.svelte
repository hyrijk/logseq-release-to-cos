<script lang="ts">
  import dayjs from "dayjs";
  import "dayjs/locale/zh-cn";
  import relativeTime from "dayjs/plugin/relativeTime";
  import type { Release } from "./releases";
  import marked from "marked";

  dayjs.locale("zh-cn");
  dayjs.extend(relativeTime);

  marked.setOptions({
    breaks: true,
  });

  let releases: Release[] = [];
  getReleases().then((json) => {
    releases = json;
    if (dayjs(releases[0].created_at).isSame(Date.now(), "days")) {
      document.title = document.title + "更新了！";
    } else {
      document.title = document.title + "还没～";
    }
  });

  async function getReleases() {
    const res = await fetch(
      "https://logseq-1251760823.cos.ap-guangzhou.myqcloud.com/release.json"
    );
    return res.json();
  }

  function formatTime(time: string) {
    const day = dayjs(time);
    const now = dayjs();
    if (day.add(1, "month").isAfter(now)) {
      return day.fromNow();
    }
    if (day.get("year") === now.get("year")) {
      return day.format("MM-DD HH:mm");
    }
    return day.format("YYYY-MM-DD HH:mm");
  }
</script>

<main class="px-3">
  {#each releases as release, i}
    <div class="release mb-4 py-md-4">
      <h2>{release.name}</h2>
      <span>
        <svg
          class="octicon octicon-tag"
          viewBox="0 0 16 16"
          version="1.1"
          width="16"
          height="16"
          aria-hidden="true"
          ><path
            fill-rule="evenodd"
            d="M2.5 7.775V2.75a.25.25 0 01.25-.25h5.025a.25.25 0 01.177.073l6.25 6.25a.25.25 0 010 .354l-5.025 5.025a.25.25 0 01-.354 0l-6.25-6.25a.25.25 0 01-.073-.177zm-1.5 0V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zM6 5a1 1 0 100 2 1 1 0 000-2z"
          /></svg
        >
        <span style="max-width: 125px">{release.tag_name}</span>
      </span>
      <span class="color-text-secondary">
        发布于 {formatTime(release.created_at)}
      </span>
      <div class="markdown-body mt-2 mb-2">{@html marked(release.body)}</div>
      <details
        class="details-reset Details-element border-top pt-3 mt-4 mb-2 mb-md-4"
        open={i === 0}
      >
        <summary>
          <div class="d-flex flex-items-center">
            <span class="mr-2 Details-content--closed">
              <svg
                class="octicon octicon-triangle-right"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path
                  d="M6.427 4.427l3.396 3.396a.25.25 0 010 .354l-3.396 3.396A.25.25 0 016 11.396V4.604a.25.25 0 01.427-.177z"
                />
              </svg>
            </span>
            <span class="mr-2 Details-content--open">
              <svg
                class="octicon octicon-triangle-down"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path
                  d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"
                />
              </svg>
            </span>
            <span class="text-bold">下载</span>
            <span title={String(release.assets.length)} class="counter ml-1">
              {release.assets.length}
            </span>
          </div>
        </summary>
        <div class="Box mt-3">
          {#each release.assets as asset}
            <div
              class="Box-body d-flex flex-justify-between flex-items-center py-1 py-md-2 Box-body px-2"
            >
              <a
                href="https://logseq-1251760823.file.myqcloud.com/release/{release.tag_name}/{asset.name}"
                rel="nofollow"
                class="d-flex flex-items-center min-width-0"
              >
                <svg
                  class="octicon octicon-package flex-shrink-0 color-text-secondary"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.878.392a1.75 1.75 0 00-1.756 0l-5.25 3.045A1.75 1.75 0 001 4.951v6.098c0 .624.332 1.2.872 1.514l5.25 3.045a1.75 1.75 0 001.756 0l5.25-3.045c.54-.313.872-.89.872-1.514V4.951c0-.624-.332-1.2-.872-1.514L8.878.392zM7.875 1.69a.25.25 0 01.25 0l4.63 2.685L8 7.133 3.245 4.375l4.63-2.685zM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432L2.5 5.677zm6.25 8.271l4.625-2.683a.25.25 0 00.125-.216V5.677L8.75 8.432v5.516z"
                  />
                </svg>
                <span class="pl-2 flex-auto min-width-0 text-bold">
                  {asset.name}
                </span>
              </a>
              <small class="pl-2 color-text-secondary flex-shrink-0">
                {Math.round(asset.size / 1024 / 1024)}MB
              </small>
            </div>
          {/each}
        </div>
      </details>
    </div>
  {/each}
</main>

<style>
  @media (min-width: 800px) {
    main {
      max-width: 800px;
      margin: 0 auto;
    }
  }

  .color-text-secondary {
    color: #586069;
  }

  .counter {
    display: inline-block;
    min-width: var(--size-2);
    padding: 0 6px;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
    line-height: calc(var(--size-2) - 2px);
    color: var(--color-counter-text);
    text-align: center;
    background-color: var(--color-counter-bg);
    border: var(--border-width) var(--border-style) transparent;
    border-radius: 2em;
  }

  .Details-element:not([open]) > summary .Details-content--open,
  .Details-element[open] > summary .Details-content--closed {
    display: none !important;
  }
</style>
