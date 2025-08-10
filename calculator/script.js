(() => {
  const display = document.getElementById('display');
  const buttons = document.querySelectorAll('.btn');

  function safeEval(expr){
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) throw new Error('Invalid');
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    return Function('"use strict";return(' + expr + ')')();
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.value;
      const action = btn.dataset.action;
      if (action === 'clear') { display.value = ''; return; }
      if (action === 'del') { display.value = display.value.slice(0,-1); return; }
      if (action === 'equals') {
        try { display.value = String(safeEval(display.value || '0')); }
        catch { display.value = 'Error'; setTimeout(()=>display.value='',900); }
        return;
      }
      display.value += val ?? '';
    });
  });

  window.addEventListener('keydown', e => {
    if (/^[0-9+\-*/().]$/.test(e.key)) display.value += e.key;
    else if (e.key === 'Enter') document.querySelector('[data-action="equals"]').click();
    else if (e.key === 'Backspace') document.querySelector('[data-action="del"]').click();
    else if (e.key === 'Escape') document.querySelector('[data-action="clear"]').click();
  });
})();
