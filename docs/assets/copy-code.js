for (const code of document.querySelectorAll('pre > code')) {
  const pre = code.parentElement;
  const wrapper = document.createElement('div');
  wrapper.className = 'copy-code-block';
  const frame = document.createElement('div');
  frame.className = 'copy-code-frame';
  const status = document.createElement('span');
  status.className = 'copy-code-status';
  status.setAttribute('role', 'status');
  const updateLayout = () => {
    frame.classList.toggle('copy-code-single-line', !code.textContent.trim().includes('\n'));
  };
  new MutationObserver(() => {
    status.textContent = '';
    updateLayout();
  })
    .observe(code, { childList: true, characterData: true, subtree: true });
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy-code-button';
  button.setAttribute('aria-label', 'Copy code');
  button.title = 'Copy code';
  button.innerHTML = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>';
  button.addEventListener('click', async () => {
    if (code.dataset.copyReady === 'false') {
      status.textContent = 'Example data is not ready to copy.';
      return;
    }
    button.disabled = true;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = 'Copied!';
    } catch (error) {
      console.error('Could not copy code:', error);
      status.textContent = 'Copy failed. Select and copy the code instead.';
    } finally {
      button.disabled = false;
    }
  });
  pre.before(wrapper);
  frame.append(pre, button);
  wrapper.append(frame, status);
  updateLayout();
}
