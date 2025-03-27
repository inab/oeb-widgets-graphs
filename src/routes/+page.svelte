<script>
  import Right from "../components/Right.svelte";
  import GraphAnimation from "../components/GraphAnimation.svelte";
  import CodeBlock from "../components/CodeBlock.svelte";

  const npmInstallCode = `npm i @inb/oeb-widgets-graphs`.trim();
</script>
<div class="home-page">
  <div class="home-header">
    <div class="home-header-group">
      <div class="home-header-group-text">
        <div class="home-text">
          <h1 class="poppins-black">OEB Services Chart Collection</h1>
          <p class="poppins-regular">Explore dynamic data insights with this OEB Services web component, powered by Plotly.js for engaging visualizations.</p>
        </div>
        <div class="home-icon">
          <GraphAnimation />
        </div>
        <div class="home-button">
          <a
            class="button__default button__primary button__link button__flex"
            href="/catalog"
            data-sveltekit-preload-data="off"
          >
            <span>See our catalog</span>
            <svelte:component this={Right} />
          </a>
          <a
            class="button__default  button__secondary button__link"
            href="/catalog"
            data-sveltekit-preload-data="off"
          >
            Try on Sandbox
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="home-installation">
    <div class="section-title">
      Installation
    </div>
    <div class="section-content">
      <CodeBlock language="bash" code={npmInstallCode} />
    </div>
  </div>
</div>

<style>
  .home-page {
    position: relative;
    padding-top: 5rem;
  }

  @media screen and (min-width: 56rem) {
    .home-header {
      aspect-ratio: 16 / 9;
      padding: 2rem 0 4rem 0;
      height: 100%;
      max-height: 80vh;
      margin: 0 auto;
    }
  }

  .home-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .home-header-group {
    position: relative;
    z-index: 1;
    margin: 0 auto;
    text-align: center;
    display: grid;
    grid-gap: 2.5rem;
    gap: 2.5rem;
  }

  .home-header-group-text {
    display: grid;
    grid-gap: 1rem;
    gap: 1rem;
    text-align: center;
  }

  .home-text  h1{
    max-width: 12ch;
    text-wrap: pretty;
    margin: 0 auto;
    font-size: 3.75rem;
  }

  .home-text  p{
    max-width: 40ch;
    text-wrap: pretty;
    margin: 0 auto;
    font-size: 1.5rem;
  }

  .home-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    max-height: 100%;
  }

  .home-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  canvas, img, picture, svg, video {
    display: block;
    max-width: 120%;
  }
</style>