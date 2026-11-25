export type Status = 'recibido' | 'preparando' | 'listo';
export interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    soldOut: boolean;
    image: string;
    description: string;
    customizable: boolean;
}
export interface Options {
    milk: string;
    shots: number;
    ice: string;
    topping: string;
    temperature: string;
}
export interface OrderItem {
    menuId: number;
    qty: number;
    notes: string;
    options?: Options;
    unitPrice?: number;
}
export interface Order {
    id: number;
    customer: string;
    items: OrderItem[];
    status: Status;
    createdAt: string;
}
export interface CartItem extends OrderItem {
    key: string;
    unitPrice: number;
}
export const statuses: Status[] = ['recibido', 'preparando', 'listo'];
export const money = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(n);
export const optionText = (o?: Options) => o ? [o.temperature, o.milk, o.shots > 0 ? `${o.shots} shot(s)` : null, o.temperature === 'Fría' ? o.ice : null, o.topping !== 'Sin topping' ? o.topping : null].filter(Boolean).join(' · ') : '';
