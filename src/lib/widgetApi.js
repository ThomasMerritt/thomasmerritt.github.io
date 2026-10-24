import { WIDGET_ORIGIN } from './soundcloud';

const COMMANDS = new Set(['play', 'pause', 'toggle']);

// The widget only emits events it has been asked for, and it ignores anything
// sent before its document exists, so binding waits for `ready`.
const BOUND_EVENTS = ['play', 'pause', 'finish'];

function post(iframe, payload) {
    const target = iframe && iframe.contentWindow;
    if (!target) return false;

    target.postMessage(JSON.stringify(payload), WIDGET_ORIGIN);
    return true;
}

/**
 * Sends a play/pause/toggle command to the embedded widget.
 */
export function sendCommand(iframe, method) {
    return COMMANDS.has(method) && post(iframe, { method });
}

/**
 * Subscribes to widget playback state. Calls onStateChange with true when
 * playing and false when paused or finished, and re-binds whenever the widget
 * reports ready so the order of mount versus load cannot matter. Returns an
 * unsubscribe function.
 */
export function subscribeToPlaybackState(iframe, onStateChange) {
    const bind = () => BOUND_EVENTS.forEach((value) => post(iframe, { method: 'addEventListener', value }));

    // Best effort right away; ignored if the widget document is not up yet,
    // which is why `ready` below re-binds. Binding on both covers the case
    // where `ready` fires before this listener is attached.
    bind();

    const onMessage = (event) => {
        // Only accept messages from the widget itself, never arbitrary origins.
        if (event.origin !== WIDGET_ORIGIN) return;
        if (typeof event.data !== 'string') return;

        let payload;
        try {
            payload = JSON.parse(event.data);
        } catch {
            return;
        }

        switch (payload.method) {
            case 'ready':
                bind();
                break;
            case 'play':
                onStateChange(true);
                break;
            case 'pause':
            case 'finish':
                onStateChange(false);
                break;
            default:
                break;
        }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
}
