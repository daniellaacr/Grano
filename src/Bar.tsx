import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Clock, Coffee, Package, RefreshCw, RotateCcw, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { api } from './api';
import { usePolling } from './hooks';
import { Brand, Empty, ErrorState, Loader } from './shared';
import { statuses, type Order, type Status, type MenuItem } from './types';
const titles: Record<Status, string> = { recibido: 'Recibidos', preparando: 'Preparando', listo: 'Listos' };
function elapsed(date: string, now: number) { const min = Math.max(0, Math.floor((now - new Date(date).getTime()) / 60000)); return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`; }
function OrderCard({ o, menu, now, busy, advance, first }: {
    o: Order;
    menu: MenuItem[];
    now: number;
    busy: boolean;
    advance: () => void;
    first: boolean;
}) { const time = new Date(o.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }); return <article className={`ticket ${first ? 'priority' : ''}`}><div className="ticket-top"><div><span className="ticket-number">#{o.id}</span>{first && <small className="priority-label">Siguiente pedido</small>}</div><span className="ticket-time"><Clock size={14}/>{elapsed(o.createdAt, now)}</span></div><h3>{o.customer}</h3><p className="ticket-date">Recibido · {time}</p><div className="ticket-items">{o.items.map((x, i) => <div className="ticket-item" key={i}><span className="item-qty">{x.qty}×</span><div><b>{menu.find(m => m.id === x.menuId)?.name || `Producto #${x.menuId}`}</b>{x.notes && <p className="ticket-note">{x.notes}</p>}</div></div>)}</div>{o.status !== 'listo' ? <button className="primary" disabled={busy} onClick={advance}>{busy ? 'Actualizando…' : o.status === 'recibido' ? 'Iniciar preparación' : 'Marcar listo'}<ArrowRight size={18}/></button> : <div className="ready-label"><Check size={17}/> Listo para recoger</div>}</article>; }
export function Bar() {
    const orders = usePolling(api.orders, 3000), menu = usePolling(api.menu, 3500);
    const [now, setNow] = useState(Date.now()), [busy, setBusy] = useState<number[]>([]), [stockBusy, setStockBusy] = useState<number[]>([]), [actionError, setActionError] = useState(''), [stock, setStock] = useState(false), [filter, setFilter] = useState<Status | 'todos'>('todos'), [undo, setUndo] = useState<{
        id: number;
        previous: Status;
        next: Status;
    } | null>(null);
    const busyIds = useRef(new Set<number>()), stockIds = useRef(new Set<number>()), undoTimer = useRef<number>(0);
    useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(id); }, []);
    useEffect(() => () => clearTimeout(undoTimer.current), []);
    async function change(o: Order, next: Status, isUndo = false) { if (busyIds.current.has(o.id))
        return; busyIds.current.add(o.id); setBusy([...busyIds.current]); setActionError(''); try {
        const updated = await api.status(o.id, next);
        orders.update(old => old?.map(x => x.id === o.id ? updated : x) || [updated]);
        if (!isUndo) {
            setUndo({ id: o.id, previous: o.status, next });
            clearTimeout(undoTimer.current);
            undoTimer.current = window.setTimeout(() => setUndo(null), 10000);
        }
        else {
            setUndo(null);
            clearTimeout(undoTimer.current);
        }
    }
    catch (e) {
        setActionError(e instanceof Error ? e.message : 'No se guardó el cambio. Intenta de nuevo.');
    }
    finally {
        busyIds.current.delete(o.id);
        setBusy([...busyIds.current]);
    } }
    async function toggle(p: MenuItem) { if (stockIds.current.has(p.id))
        return; stockIds.current.add(p.id); setStockBusy([...stockIds.current]); setActionError(''); try {
        const updated = await api.availability(p.id, !p.soldOut);
        menu.update(old => old?.map(x => x.id === p.id ? updated : x) || [updated]);
    }
    catch (e) {
        setActionError(e instanceof Error ? e.message : 'No se guardó la disponibilidad.');
    }
    finally {
        stockIds.current.delete(p.id);
        setStockBusy([...stockIds.current]);
    } }
    const all = orders.data || [], products = menu.data || [], sorted = [...all].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id - b.id);
    const undoOrder = all.find(o => o.id === undo?.id && o.status === undo.next);
    if (orders.loading || menu.loading)
        return <Loader />;
    return <div className="bar-page"><header className="bar-header"><Brand /><span className="bar-label">/ Barra</span><div className="bar-header-right"><a href="/">Vista cliente ↗</a><span className="live"><i /> En servicio</span><button className="icon-btn" aria-label="Actualizar pedidos" onClick={() => { void orders.refresh(); void menu.refresh(); }}><RefreshCw size={20}/></button></div></header><main className="bar-main"><div className="bar-intro"><div><span className="eyebrow">OPERACIÓN · GRANO</span><h1>La barra<span>.</span></h1><p>Todo lo que está por prepararse, en un solo lugar.</p></div><div className="bar-actions"><button className={`secondary ${!stock ? 'active' : ''}`} onClick={() => setStock(false)}><Coffee size={19}/> Pedidos</button><button className={`secondary ${stock ? 'active' : ''}`} onClick={() => setStock(true)}><Package size={19}/> Disponibilidad <b>{products.filter(p => p.soldOut).length}</b></button></div></div>{orders.error && <ErrorState message={orders.error} retry={orders.refresh}/>} {menu.error && <ErrorState message={menu.error} retry={menu.refresh}/>} {actionError && <div className="notice error" role="alert">{actionError}<button className="text-btn" onClick={() => setActionError('')}>Cerrar</button></div>}
 {stock ? <section className="inventory"><div className="section-title"><h2>Disponibilidad del menú</h2><span>{products.filter(p => !p.soldOut).length} disponibles</span></div><p className="muted">Los cambios se reflejan en el menú del cliente automáticamente.</p>{!products.length && !menu.error && <Empty title="Sin productos" detail="El catálogo está vacío."/>}<div className="stock-grid">{products.map(p => <article key={p.id} className="stock-card"><img src={p.image} alt=""/><div><h3>{p.name}</h3><small>{p.category} · {p.soldOut ? 'Agotado' : 'Disponible'}</small></div><button className={`toggle ${p.soldOut ? 'off' : ''}`} role="switch" aria-checked={!p.soldOut} aria-label={`Disponibilidad de ${p.name}`} disabled={stockBusy.includes(p.id)} onClick={() => void toggle(p)}><span /></button></article>)}</div></section> : <><div className="bar-stats">{statuses.map((s, i) => <button key={s} className={`stat ${s} ${filter === s ? 'selected-stat' : ''}`} aria-pressed={filter === s} onClick={() => setFilter(f => f === s ? 'todos' : s)}><span>{i === 0 ? <ShoppingBag size={20}/> : i === 1 ? <Coffee size={20}/> : <Check size={20}/>} {titles[s]}</span><strong>{all.filter(o => o.status === s).length.toString().padStart(2, '0')}</strong></button>)}</div><div className="section-title"><h2>Cola de pedidos</h2><button className="text-btn" onClick={() => setFilter('todos')}><SlidersHorizontal size={17}/> {filter === 'todos' ? 'Todos los estados' : 'Ver todos'}</button></div><div className={`kanban ${filter !== 'todos' ? 'filtered' : ''}`}>{statuses.filter(s => filter === 'todos' || filter === s).map(s => { const list = sorted.filter(o => o.status === s); return <section key={s} className={`lane ${s}`}><div className="lane-heading"><span className="state-dot"/><h2>{titles[s]}</h2><b>{list.length}</b></div>{list.length ? list.map((o, i) => <OrderCard key={o.id} o={o} menu={products} now={now} busy={busy.includes(o.id)} first={s === 'recibido' && i === 0} advance={() => void change(o, statuses[statuses.indexOf(s) + 1])}/>) : <Empty title="Todo al día" detail="No hay pedidos en este estado."/>}</section>; })}</div></>}
 </main>{undo && undoOrder && <div className="undo-toast" role="status"><Check size={19}/><span>Pedido #{undo.id} actualizado.</span><button disabled={busy.includes(undo.id)} onClick={() => void change(undoOrder, undo.previous, true)}><RotateCcw size={15}/> Deshacer</button></div>}<footer className="site-footer">grano. <span>Hecho a tu manera.</span><a href="/">Menú ↗</a></footer></div>;
}
