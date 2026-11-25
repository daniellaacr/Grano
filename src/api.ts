import type { MenuItem, Order, Status } from './types';
async function request<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
    const r = await fetch('/api' + path, { method, headers: data ? { 'Content-Type': 'application/json' } : undefined, body: data ? JSON.stringify(data) : undefined, cache: 'no-store' });
    if (!r.ok)
        throw new Error(`No pudimos conectar (${r.status}).`);
    return r.json() as Promise<T>;
}
export const api = { menu: () => request<MenuItem[]>('/menu'), orders: () => request<Order[]>('/orders'), order: (id: number) => request<Order>(`/orders/${id}`), create: (o: Omit<Order, 'id'>) => request<Order>('/orders', 'POST', o), status: (id: number, status: Status) => request<Order>(`/orders/${id}`, 'PATCH', { status }), availability: (id: number, soldOut: boolean) => request<MenuItem>(`/menu/${id}`, 'PATCH', { soldOut }) };
