<script>
  import { onMount } from 'svelte';
  import hljs from 'highlight.js/lib/core';
  import javascript from 'highlight.js/lib/languages/javascript';
  import css from 'highlight.js/lib/languages/css';
  import html from 'highlight.js/lib/languages/xml'; // HTML = xml in hljs
  import 'highlight.js/styles/github.css';
  import { Copy  } from '@lucide/svelte';

  export let code = '';
  export let language = 'javascript'; // default
  let codeItem;

  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('css', css);
  hljs.registerLanguage('html', html);

  function copyToClipboard() {
    navigator.clipboard.writeText(code).then(() => {
      const original = copyLabel;
      copyLabel = '✅ Copied';
      setTimeout(() => (copyLabel = original), 2000);
    });
  }

  //let copyLabel = '📋 Copy';

  onMount(() => {
    hljs.highlightElement(codeItem);
  });
</script>


<div class="code-snippet">
  <div class="code-toolbar">
    <span class="lang-label">{ language }</span>
    <button class="copy-btn flex" on:click={copyToClipboard}>
      <Copy  color="#ff3e98" />
      Copy
  </button>
  </div>
  <pre><code bind:this={codeItem} class={"language-" + language}>
    { code}
  </code></pre>
</div>

<style>
  .code-snippet {
    position: relative;
    background: #f9f9f9;
    border: 1px solid rgba(0, 0, 0 , 0.15);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .code-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafafa;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #e0e0e0;
    font-family: monospace;
    font-size: 0.75rem;
  }

  .lang-label {
    color: #5d5d5d;
    font-weight: bold;
  }

  .copy-btn {
    background: #f9f9f9;
    color: #5d5d5d;
    border: none;
    border-radius: 4px;
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    background: #333;
  }

  pre {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    font-size: 0.9rem;
  }
</style>