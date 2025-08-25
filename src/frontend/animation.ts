import { Easing } from "@tweenjs/tween.js"

type ExtractPropertiesOfType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

export class Animation {
    private _updateCallbacks: (() => void)[] = []

    update() {
        for (const callback of this._updateCallbacks) {
            callback()
        }
    }

    onUpdate(callback: () => void) {
        this._updateCallbacks.push(callback)
    }
}

export function animate<T extends Record<string, any>>(source: T, target: Partial<ExtractPropertiesOfType<T, number>>, duration: number): Animation {
    const startTime = Date.now()
    const keys = Object.keys(target) as (keyof ExtractPropertiesOfType<T, number>)[]
    const startValue = Object.fromEntries(keys.map((key) => [key, source[key]])) as unknown as Record<keyof T, number>

    const animation = new Animation()
    const handler = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1)
        const progressInterpolated = Easing.Quadratic.InOut(progress)
        for (const key of keys) {
            source[key] = startValue[key] + (target[key]! - startValue[key]) * progressInterpolated as T[keyof ExtractPropertiesOfType<T, number>]
        }
        animation.update()
        if (progress < 1)
            requestAnimationFrame(handler)
    }
    requestAnimationFrame(handler)
    return animation
}