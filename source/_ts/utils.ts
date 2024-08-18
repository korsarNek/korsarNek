import { Vector3 } from "three";
import { Box3 } from "three";

// Copied over from Fluid
export function isRunningOnBrowser(): boolean {
    return typeof window !== 'undefined';
}

// Copied over from Fluid
export function isBot(): boolean {
    return (isRunningOnBrowser() && !('onscroll' in window))
        || (typeof navigator !== 'undefined' && /(gle|ing|ro|msn)bot|crawl|spider|yand|duckgo/i.test(navigator.userAgent));
}

export function getCorners(box: Box3): Vector3[] {
    const points = [
        new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(),
    ];

    points[ 0 ].set( box.min.x, box.min.y, box.min.z ); // 000
    points[ 1 ].set( box.min.x, box.min.y, box.max.z ); // 001
    points[ 2 ].set( box.min.x, box.max.y, box.min.z ); // 010
    points[ 3 ].set( box.min.x, box.max.y, box.max.z ); // 011
    points[ 4 ].set( box.max.x, box.min.y, box.min.z ); // 100
    points[ 5 ].set( box.max.x, box.min.y, box.max.z ); // 101
    points[ 6 ].set( box.max.x, box.max.y, box.min.z ); // 110
    points[ 7 ].set( box.max.x, box.max.y, box.max.z ); // 111
    
    return points;
}

export function* skip<T>(array: T[], count: number) {
    for (let i = count; i < array.length; i++) {
        yield array[i];
    }
}
