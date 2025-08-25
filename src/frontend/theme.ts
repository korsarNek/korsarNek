export type Theme = 'dark' | 'light'

export function currentTheme(): Theme {
    var bodyStyles = window.getComputedStyle(document.body);
    return bodyStyles.getPropertyValue('--color-mode') as Theme;
}

export class ThemeChangeEvent extends Event {
    constructor(public readonly theme: Theme) {
        super('theme-change')
    }
}

document.querySelector('#color-toggle-btn')?.addEventListener('click', () => {
    window.dispatchEvent(new ThemeChangeEvent(currentTheme()))
})