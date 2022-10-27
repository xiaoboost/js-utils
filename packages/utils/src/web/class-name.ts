export function addClassName(el: HTMLElement, className: string) {
  const classNameTrim = className.trim();
  const oldClassNames = (el.getAttribute('class') ?? '').split(/\s+/);

  if (oldClassNames.includes(classNameTrim)) {
    return;
  }

  const newCLassNames = oldClassNames.concat(className.trim()).join(' ');

  el.setAttribute('class', newCLassNames);
}

export function removeClassName(el: HTMLElement, className: string) {
  const classNameTrim = className.trim();
  const oldClassNames = (el.getAttribute('class') ?? '').split(/\s+/);

  if (!oldClassNames.includes(classNameTrim)) {
    return;
  }

  const newCLassNames = oldClassNames.filter((name) => name !== classNameTrim).join(' ');

  el.setAttribute('class', newCLassNames);
}
