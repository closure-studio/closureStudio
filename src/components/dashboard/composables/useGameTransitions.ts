export function useGameTransitions() {
  const beforeEnter = (el: Element): void => {
    (el as HTMLElement).style.height = "0";
    (el as HTMLElement).style.opacity = "0";
  };

  const enter = (el: Element, done: () => void): void => {
    (el as HTMLElement).style.transition = "all 0.3s ease";
    (el as HTMLElement).style.height = (el as HTMLElement).scrollHeight + "px";
    (el as HTMLElement).style.opacity = "1";
    setTimeout(done, 300);
  };

  const leave = (el: Element, done: () => void): void => {
    (el as HTMLElement).style.transition = "all 0.2s ease";
    (el as HTMLElement).style.height = (el as HTMLElement).scrollHeight + "px";
    setTimeout(() => {
      (el as HTMLElement).style.height = "0";
      (el as HTMLElement).style.opacity = "0";
      setTimeout(done, 100);
    }, 0);
  };

  return {
    beforeEnter,
    enter,
    leave,
  };
}
