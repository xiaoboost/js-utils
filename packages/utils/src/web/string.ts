import { isIOS } from './env';

/** 复制文本到剪贴板 */
export function copy(text: string) {
  const input = document.createElement('textarea');

  input.value = text;

  input.style.fontSize = '12pt';
  input.style.position = 'fixed';
  input.style.top = '0';
  input.style.left = '-9999px';
  input.style.width = '2em';
  input.style.height = '2em';
  input.style.margin = '0';
  input.style.padding = '0';
  input.style.border = 'none';
  input.style.outline = 'none';
  input.style.boxShadow = 'none';
  input.style.background = 'transparent';

  input.setAttribute('readonly', '');

  document.body.appendChild(input);

  if (isIOS) {
    input.contentEditable = 'true';
    input.readOnly = false;

    const range = document.createRange();
    range.selectNodeContents(input);

    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    input.setSelectionRange(0, 999999);
  } else {
    input.select();
  }

  const ret = document.execCommand('copy');

  input.blur();
  document.body.removeChild(input);

  return ret;
}
