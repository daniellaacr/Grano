import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Clock, Coffee, Menu, Minus, Plus, Search, ShoppingBag, Store, X } from 'lucide-react';
import { api } from './api';
import { usePolling, readStored } from './hooks';
import { Brand, Empty, ErrorState, Loader } from './shared';
import { Customizer, priceFor } from './Customizer';
import { money, optionText, statuses, type MenuItem, type Options, type Order, type CartItem } from './types';
const categories = [['Todos', ''], ['Café', 'café'], ['Té', 'té'], ['Panadería', 'panadería']];
function ProductCard({ p, add, custom }: {
    p: MenuItem;
    add: () => void;
    custom: () => void;
}) { return <article className={`product ${p.soldOut ? 'sold' : ''}`}><button className="product-art" onClick={p.customizable ? custom : add} disabled={p.soldOut} aria-label={p.customizable ? `Personalizar ${p.name}` : `Agregar ${p.name}`}><img src={p.image} alt={p.name} draggable={false}/></button>{p.soldOut && <span className="sold-tag">Agotado</span>}<div className="product-info"><span className="category-label">{p.category}</span><h3>{p.name}</h3><p>{p.description}</p><div className="product-bottom"><strong>{money(p.price)}</strong><button className="add" onClick={add} disabled={p.soldOut} aria-label={`Agregar ${p.name}`}><Plus size={23}/></button></div>{p.customizable && !p.soldOut && <button className="custom-link" onClick={custom}>Personalizar <ArrowRight size={13}/></button>}</div></article>; }
function Tracking({ id, back, menu }: {
    id: number;
    back: () => void;
    menu: MenuItem[];
}) { const get = useCallback(() => api.order(id), [id]); const { data: o, error, loading, refresh } = usePolling(get, 2500); if (loading)
    return <Loader />; if (!o)
    return <main className="tracking"><ErrorState message={error || 'No encontramos tu pedido.'} retry={refresh}/><button className="text-btn" onClick={back}>Volver al menú</button></main>; const step = statuses.indexOf(o.status); return <main className="tracking"><button className="text-btn" onClick={back}><ArrowLeft size={18}/> Volver al menú</button><div className="tracking-hero"><span className="eyebrow">PEDIDO #{o.id}</span><img src={menu.find(p => p.id === o.items[0]?.menuId)?.image || "/assets/bean-0.webp"} alt=""/><h1>{['¡Recibimos tu pedido!', 'Estamos preparando tu café.', '¡Tu café está listo!'][step]}</h1><p>{o.customer}, {step === 2 ? 'puedes pasar a recogerlo en barra.' : 'consulta aquí el progreso de tu pedido.'}</p></div>{error && <ErrorState message="No pudimos actualizar el estado." retry={refresh}/>}<ol className="timeline">{['Pedido recibido', 'Preparando tu café', 'Listo para recoger'].map((s, i) => <li key={s} className={i <= step ? 'complete' : ''} aria-current={i === step ? 'step' : undefined}><span>{i <= step ? <Check size={20}/> : i === 1 ? <Coffee size={20}/> : <ShoppingBag size={20}/>}</span><div><b>{s}</b>{i === step && <small>Estado actual</small>}</div></li>)}</ol><p className="muted center"><Clock size={15}/> Actualización automática</p></main>; }
export function Customer() {
    const { data: menu, error, loading, refresh, update } = usePolling(api.menu, 3000);
    const [cart, setCart] = useState<CartItem[]>(() => readStored('grano-cart', [])), [category, setCategory] = useState(''), [search, setSearch] = useState(''), [selected, setSelected] = useState<number | null>(null), [cartOpen, setCartOpen] = useState(false), [customer, setCustomer] = useState(''), [note, setNote] = useState(''), [sending, setSending] = useState(false), [submitError, setSubmitError] = useState(''), [toast, setToast] = useState(''), [orderId, setOrderId] = useState<number | null>(() => readStored('grano-order', null)), [tracking, setTracking] = useState(false), [nav, setNav] = useState(false);
    const cartDialog = useRef<HTMLDialogElement>(null);
    const featuredRef = useRef<HTMLDivElement>(null);
    const showFeatured = !category && !search && !!menu?.some(p => p.id === 8);
    useEffect(() => { const el = featuredRef.current; const card = el?.children[1] as HTMLElement | undefined; if (el && card && window.matchMedia("(max-width: 760px)").matches)
        el.scrollLeft = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2; }, [showFeatured, loading, tracking]);
    const toastTimer = useRef<number>(0);
    const locked = useRef(false);
    useEffect(() => { localStorage.setItem('grano-cart', JSON.stringify(cart)); }, [cart]);
    useEffect(() => { localStorage.setItem('grano-order', JSON.stringify(orderId)); }, [orderId]);
    useEffect(() => () => clearTimeout(toastTimer.current), []);
    useEffect(() => { if (cartOpen)
        cartDialog.current?.showModal();
    else
        cartDialog.current?.close(); }, [cartOpen]);
    const notify = (text: string) => { setToast(text); clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToast(''), 2600); };
    const add = (p: MenuItem, qty = 1, notes = '', options?: Options) => { if (p.soldOut)
        return; const key = JSON.stringify([p.id, notes, options]); setCart(c => { const found = c.find(x => x.key === key); return found ? c.map(x => x.key === key ? { ...x, qty: x.qty + qty } : x) : [...c, { key, menuId: p.id, qty, notes, options, unitPrice: options ? priceFor(p, options) : p.price }]; }); setSelected(null); notify(`${p.name} agregado a tu pedido`); };
    const changeQty = (key: string, amount: number) => setCart(c => c.map(x => x.key === key ? { ...x, qty: x.qty + amount } : x).filter(x => x.qty > 0));
    const total = cart.reduce((s, x) => s + x.qty * x.unitPrice, 0), count = cart.reduce((s, x) => s + x.qty, 0), unavailable = cart.filter(x => !menu?.some(p => p.id === x.menuId && !p.soldOut));
    async function submit(e: React.FormEvent) { e.preventDefault(); if (locked.current || !customer.trim() || !cart.length || unavailable.length)
        return; locked.current = true; setSending(true); setSubmitError(''); try {
        const fresh = await api.menu();
        update(() => fresh);
        if (cart.some(x => !fresh.some(p => p.id === x.menuId && !p.soldOut))) {
            setSubmitError('Un producto se agotó. Retíralo para continuar.');
            return;
        }
        const items = cart.map(({ key, ...x }) => ({ ...x, notes: [optionText(x.options), x.notes, note.trim() ? `Pedido: ${note.trim()}` : ''].filter(Boolean).join(' · ') }));
        const order: Order = await api.create({ customer: customer.trim(), items, status: 'recibido', createdAt: new Date().toISOString() });
        setOrderId(order.id);
        setTracking(true);
        setCartOpen(false);
        setCart([]);
        setNote('');
    }
    catch (e) {
        setSubmitError(e instanceof Error ? e.message : 'No se pudo enviar tu pedido.');
    }
    finally {
        locked.current = false;
        setSending(false);
    } }
    const cartContents = (mobile = false) => <><div className="cart-heading"><div><span className="eyebrow">CASI ESTÁ LISTO</span><h2>Tu pedido<span>.</span></h2></div>{mobile && <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Cerrar pedido"><X /></button>}<ShoppingBag size={25} className="cart-deco"/></div>{!cart.length ? <Empty title="Tu bolsa está vacía" detail="Algo rico te espera en el menú."/> : <><div className="cart-lines">{cart.map(x => { const p = menu?.find(p => p.id === x.menuId); const missing = !p || p.soldOut; return <div className="cart-line" key={x.key}><img src={p?.image || '/assets/bean-0.webp'} alt=""/><div><b>{p?.name || 'Producto no disponible'}</b>{x.options && <small>{optionText(x.options)}</small>}{x.notes && <small>{x.notes}</small>}{missing && <small className="danger-text">Se agotó. Retíralo del pedido.</small>}<div className="quantity"><button type="button" aria-label={`Quitar ${p?.name || 'producto'}`} onClick={() => changeQty(x.key, -1)}><Minus size={15}/></button><span>{x.qty}</span><button type="button" disabled={missing} aria-label={`Agregar ${p?.name || 'producto'}`} onClick={() => changeQty(x.key, 1)}><Plus size={15}/></button></div></div><strong>{money(x.qty * x.unitPrice)}</strong></div>; })}</div><form className="checkout" onSubmit={submit}><div className="pickup"><Store size={22}/><div><b>Recoger en barra</b><small>Sin envíos ni pagos en línea.</small></div></div><label className="field">¿A nombre de quién?<input required maxLength={100} value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Tu nombre"/></label><label className="field">Nota para barra (opcional)<textarea maxLength={250} value={note} onChange={e => setNote(e.target.value)} placeholder="Algo que debamos saber…"/></label>{submitError && <p className="danger-text" role="alert">{submitError}</p>}{unavailable.length > 0 && <p className="danger-text" role="alert">Hay productos agotados en tu bolsa.</p>}<div className="total"><span>Total</span><strong>{money(total)}</strong></div><button className="primary" disabled={sending || !customer.trim() || unavailable.length > 0}>{sending ? 'Enviando…' : 'Confirmar pedido'}<ArrowRight size={19}/></button></form></>}</>;
    if (loading)
        return <Loader />;
    const products = (menu || []).filter(p => (!category || p.category === category) && (`${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())));
    const featured = [1, 8, 5].map(id => products.find(p => p.id === id)).filter((p): p is MenuItem => !!p);
    const selectedProduct = menu?.find(p => p.id === selected);
    return <><header className="site-header"><div className="header-inner"><button className="icon-btn" aria-label="Abrir navegación" aria-expanded={nav} onClick={() => setNav(v => !v)}><Menu /></button><Brand /><button className="icon-btn bag" aria-label={`Mi pedido, ${count} productos`} onClick={() => { if (tracking)
        setTracking(false); setCartOpen(true); }}><ShoppingBag />{count > 0 && <span>{count}</span>}</button>{nav && <nav className="nav-pop"><a href="/">Menú</a><a href="/barra">Vista de barra ↗</a>{orderId && <button onClick={() => { setTracking(true); setNav(false); }}>Ver último pedido</button>}</nav>}</div></header>{tracking && orderId ? <Tracking id={orderId} back={() => setTracking(false)} menu={menu || []}/> : <main className="customer-layout"><section className="catalog"><div className="intro"><span className="eyebrow">UN BUEN DÍA EMPIEZA AQUÍ</span><h1>¿Qué se te antoja <em>hoy?</em></h1></div>{orderId && <button className="order-link" onClick={() => setTracking(true)}><Clock size={19}/> Ver mi pedido #{orderId}<ArrowRight size={17}/></button>}<div className="filters"><div className="categories" aria-label="Categorías">{categories.map(([name, value]) => <button key={name} className={category === value ? 'selected' : ''} aria-pressed={category === value} onClick={() => setCategory(value)}>{name}</button>)}</div><label className="search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Busca tu favorito" aria-label="Buscar productos"/>{search && <button onClick={() => setSearch('')} aria-label="Limpiar búsqueda"><X size={15}/></button>}</label></div>{error && <ErrorState message={error} retry={refresh}/>} {!category && !search && featured.length > 0 && <><div className="section-title"><h2>Los favoritos</h2><a href="#catalogo">Ver todo <ArrowRight size={15}/></a></div><div className="featured" ref={featuredRef}>{featured.map(p => <ProductCard key={p.id} p={p} add={() => add(p)} custom={() => setSelected(p.id)}/>)}</div></>}<div className="section-title" id="catalogo"><h2>Nuestro menú</h2><span>{products.length} opciones</span></div>{products.length ? <div className="product-grid">{products.map(p => <ProductCard key={p.id} p={p} add={() => add(p)} custom={() => setSelected(p.id)}/>)}</div> : !error && <Empty title="No encontramos productos" detail="Prueba otra búsqueda o categoría."/>}</section><aside className="desktop-cart">{cartContents()}</aside></main>}{!tracking && <button className="mobile-cart" onClick={() => setCartOpen(true)}><ShoppingBag size={22}/><span><b>Mi pedido</b><small>{count} productos</small></span><strong>{money(total)}</strong><ArrowRight size={20}/></button>}<dialog ref={cartDialog} className="cart-dialog" aria-label="Tu pedido" onCancel={e => { e.preventDefault(); setCartOpen(false); }}>{cartOpen && cartContents(true)}</dialog>{selectedProduct && <Customizer product={selectedProduct} onClose={() => setSelected(null)} onAdd={add}/>}<div className={`toast ${toast ? 'visible' : ''}`} role="status">{toast && <><Check size={17}/>{toast}</>}</div><footer className="site-footer">grano. <span>Todo empieza con un grano.</span><a href="/barra">Barra ↗</a></footer></>;
}
