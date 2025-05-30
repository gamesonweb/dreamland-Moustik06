import {EventPayload} from "../types/Types.ts";


export class EventBus {
    private static instance: EventBus;
    private listeners: Map<keyof EventPayload, Function[]> = new Map();
    private debugMode: boolean = process.env.NODE_ENV === 'development';

    private constructor() {
        if (this.debugMode) {
            console.log('[EventBus] Initialized');
        }
    }


    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }


    public emit<K extends keyof EventPayload>(
        event: K,
        payload: EventPayload[K]
    ): void {
        if (this.debugMode) {
            console.log(`[EventBus] Emit event: ${String(event)}`, payload);
        }

        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                console.error(`[EventBus] Error in callback for ${String(event)}:`, error);
            }
        });
    }


    public on<K extends keyof EventPayload>(
        event: K,
        callback: (payload: EventPayload[K]) => void
    ): () => void {
        const callbacks = this.listeners.get(event) || [];
        this.listeners.set(event, [...callbacks, callback as Function]);

        if (this.debugMode) {
            console.log(`[EventBus] Added listener for: ${String(event)}, total: ${callbacks.length + 1}`);
        }

        return () => this.off(event, callback);
    }


    public off<K extends keyof EventPayload>(
        event: K,
        callback: (payload: EventPayload[K]) => void
    ): void {
        const callbacks = this.listeners.get(event) || [];
        this.listeners.set(
            event,
            callbacks.filter(cb => cb !== callback)
        );

        if (this.debugMode) {
            console.log(`[EventBus] Removed listener for: ${String(event)}, remaining: ${callbacks.length - 1}`);
        }
    }
}