<!--
<script>
	import '../app.css';

	let { children } = $props();
</script>

{@render children()}
-->

<script>
	import "../app.css";
  import '../styles/custom.scss';
  export let data;
</script>

<nav class="navbar bg-white shadow px-6 py-3">
  <div class="mx-auto flex items-center justify-between gap-4">

    <!-- Left: Logo + Title -->
    <div class="flex items-center gap-4">
      <a href="/" class="flex items-center gap-2">
        <img
          src="/assets/images/opeb_logo.gif"
          alt="OEB Logo"
          class="logo object-contain"
        />
        <span class="text-lg font-semibold text-gray-800">
          OEB Widgets Graphs Docs
        </span>
      </a>
    </div>

    <!-- Center: Navigation -->
    <div class="hidden md:flex items-center space-x-6 text-sm text-blue-700">
      <a href="/docs" class="hover:underline">Docs</a>
      <a href="/about" class="hover:underline">About</a>
    </div>

    <!-- Right: Version -->
    <div class="text-xs text-gray-600 text-right">
      <a
        href="https://github.com/inab/oeb-widgets-graphs"
        target="_blank"
        class="text-blue-600 hover:underline"
      >
			v1.1.3 GITHUB
      </a>
    </div>

  </div>
</nav>

<main class="container mx-auto px-4 pt-4">
  <slot />
</main>


