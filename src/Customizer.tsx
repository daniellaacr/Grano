import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Check, Minus, Plus, X } from 'lucide-react';
import { money, optionText, type MenuItem, type Options } from './types';
export const initialOptions = (p: MenuItem): Options => ({ milk: p.id === 3 || p.id === 4 ? 'Sin leche' : p.id === 2 ? 'Avena' : 'Entera', shots: p.category === 'té' ? 0 : p.id === 3 ? 2 : 1, ice: p.id === 3 || p.id === 1 ? 'Sin hielo' : 'Normal', topping: 'Sin topping', temperature: p.id === 1 || p.id === 3 ? 'Caliente' : 'Fría' });
export function priceFor(p: MenuItem, o: Options) { return p.price + (o.milk === 'Avena' && p.id !== 2 ? 8 : 0) + (o.shots > (p.id === 3 ? 2 : 1) ? 12 : 0) + (o.topping !== 'Sin topping' ? 10 : 0); }
function Cup({ options, product }: {
    options: Options;
    product: MenuItem;
}) {
    const id = useId().replace(/:/g, '');
    const [pour, setPour] = useState(0);
    const [pourColor, setPourColor] = useState("#f6e7ce");
    const prev = useRef(options);
    useEffect(() => { if (prev.current.milk !== options.milk || prev.current.shots !== options.shots || prev.current.topping !== options.topping) {
        setPourColor(prev.current.milk !== options.milk ? "#f6e7ce" : prev.current.shots !== options.shots ? "#67351e" : options.topping === "Chocolate" ? "#49261b" : "#b66b26");
        setPour(x => x + 1);
    } prev.current = options; }, [options]);
    const tea = product.category === 'té', base = product.id === 5 ? '#60772c' : tea ? '#a36b3f' : '#67351e', milk = options.milk === 'Sin leche' ? 0 : options.milk === 'Extra' ? 125 : 92, coffee = tea ? 70 : product.id === 4 ? 134 : options.shots * 38, top = Math.max(46, 267 - milk - coffee), hasIce = options.temperature === 'Fría' && options.ice !== 'Sin hielo';
    return <svg className="cup" viewBox="0 0 250 320" role="img" aria-label={`Vista ilustrativa: ${optionText(options)}`}><defs><clipPath id={`${id}clip`}><path d="M30 48L49 269Q54 289 125 289Q196 289 201 269L220 48Z"/></clipPath><linearGradient id={`${id}coffee`}><stop stopColor="#392216"/><stop offset=".32" stopColor={base}/><stop offset=".7" stopColor={base}/><stop offset="1" stopColor="#49301d"/></linearGradient><linearGradient id={`${id}milk`}><stop stopColor="#bca58c"/><stop offset=".25" stopColor="#fff4df"/><stop offset=".72" stopColor="#f7e8cf"/><stop offset="1" stopColor="#c0a78e"/></linearGradient><linearGradient id={`${id}glass`}><stop stopColor="#fff" stopOpacity=".6"/><stop offset=".18" stopColor="#fff" stopOpacity=".06"/><stop offset=".77" stopColor="#fff" stopOpacity=".03"/><stop offset=".92" stopColor="#fff" stopOpacity=".5"/><stop offset="1" stopColor="#fff" stopOpacity=".1"/></linearGradient><linearGradient id={`${id}mix`} x2=".3" y2="1"><stop stopColor={base}/><stop offset="1" stopColor={base} stopOpacity="0"/></linearGradient></defs><ellipse cx="125" cy="300" rx="84" ry="10" fill="#79512c" opacity=".16"/><path d="M27 44L47 270Q52 293 125 293Q198 293 203 270L223 44Z" fill="#fff" fillOpacity=".24" stroke="#bca78e" strokeWidth="1.5"/><g clipPath={`url(#${id}clip)`}><g className="liquid" style={{ transform: `translateY(${top}px)` }}><path d="M0 0Q50 -8 100 0T250 0V330H0Z" fill={`url(#${id}coffee)`}/></g><g className="liquid" style={{ transform: `translateY(${270 - milk}px)`, opacity: milk ? 1 : 0 }}><path d="M0 0Q50 -8 100 0T250 0V330H0Z" fill={`url(#${id}milk)`}/><path className="swirl" d="M0 -10H250V25Q205 5 183 55T137 42Q107 6 86 55T35 35Q20 5 0 28Z" fill={`url(#${id}mix)`} opacity=".85"/></g><g className="liquid" style={{ transform: `translateY(${top - 15}px)`, opacity: hasIce ? 1 : 0 }}><g key={`${options.ice}-${options.temperature}`} className="ice">{(options.ice === 'Extra' ? [35, 73, 115, 154, 187] : [48, 104, 163]).map((x, i) => <rect key={i} x={x} y={i % 2 * 13} width="41" height="36" rx="8" fill="#fff9e8" fillOpacity=".35" stroke="#fff" strokeOpacity=".65" transform={`rotate(${i % 2 ? 20 : -18} ${x + 20} 20)`}/>)}</g></g>{product.id === 4 && <g className="liquid" style={{ transform: `translateY(${top - 5}px)` }}><path d="M0 0Q55 -10 110 0T250 0V27H0Z" fill="#edd6b2" opacity=".94"/></g>}<g className="liquid" opacity={options.topping === 'Sin topping' ? 0 : 1} fill="none" stroke={options.topping === 'Chocolate' ? '#49261b' : '#b66b26'} strokeWidth="6" strokeLinecap="round"><path d="M40 58Q80 93 59 132T67 202M171 52Q205 89 182 126T190 212M100 55Q139 85 111 125"/></g><path d="M27 44L47 270Q52 293 125 293Q198 293 203 270L223 44Z" fill={`url(#${id}glass)`}/><path d="M44 66L60 260M207 66L190 260" stroke="#fff" strokeOpacity=".48" strokeWidth="4" strokeLinecap="round"/>{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <circle key={i} cx={55 + (i * 53) % 140} cy={89 + (i * 37) % 164} r={1.4 + i % 3 * .5} fill="#fff" opacity=".55"/>)}</g><ellipse cx="125" cy="44" rx="99" ry="15" fill="#fff" fillOpacity=".16" stroke="#bba48b" strokeWidth="2"/><ellipse cx="125" cy="40" rx="99" ry="15" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="3"/>{pour > 0 && <path key={pour} className="pour" d={`M125 -10Q130 20 125 50L125 ${top + 10}`} stroke={pourColor} strokeWidth="10" strokeLinecap="round" fill="none"/>}<text x="125" y="201" textAnchor="middle" fill="#3c2418" fontFamily="Georgia,serif" fontWeight="bold" fontSize="31">grano.</text></svg>;
}
function Choices<T extends string | number>({ label, values, value, onChange }: {
    label: string;
    values: T[];
    value: T;
    onChange: (v: T) => void;
}) { return <fieldset className="choices"><legend>{label}</legend><div>{values.map(v => <button type="button" key={v} className={v === value ? 'selected' : ''} aria-pressed={v === value} onClick={() => onChange(v)}>{v}{v === value && <Check size={13}/>}</button>)}</div></fieldset>; }
export function Customizer({ product, onClose, onAdd }: {
    product: MenuItem;
    onClose: () => void;
    onAdd: (p: MenuItem, q: number, notes: string, o: Options) => void;
}) {
    const [options, setOptions] = useState(() => initialOptions(product)), [qty, setQty] = useState(1), [notes, setNotes] = useState('');
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => { dialog.current?.showModal(); }, []);
    const change = <K extends keyof Options>(k: K, v: Options[K]) => setOptions(o => ({ ...o, [k]: v }));
    return (
        <dialog ref={dialog} className="custom-dialog" aria-labelledby="custom-title" onCancel={e => { e.preventDefault(); onClose(); }}>
            <div className="dialog-header">
                <span className="eyebrow">PERSONALIZAR BEBIDA</span>
                <button className="icon-btn" onClick={onClose} aria-label="Cerrar personalizador"><X /></button>
            </div>
            <div className="custom-body">
                <section className="custom-hero" aria-label="Vista previa de la bebida">
                    <div className="custom-preview-copy">
                        <h2 id="custom-title">{product.name}</h2>
                        <p>{product.description}</p>
                        <span className="live"><i /> Vista en tiempo real</span>
                    </div>
                    <Cup options={options} product={product}/>
                </section>
                <section className="custom-options" aria-label="Opciones de personalización" tabIndex={0}>
                    <Choices label="Temperatura" values={['Caliente', 'Fría']} value={options.temperature} onChange={v => change('temperature', v)}/>
                    <Choices label="Leche" values={['Sin leche', 'Entera', 'Avena', 'Extra']} value={options.milk} onChange={v => change('milk', v)}/>
                    {product.category === 'café' && <Choices label="Shots de espresso" values={[1, 2, 3]} value={options.shots} onChange={v => change('shots', v)}/>}
                    {options.temperature === 'Fría' && <Choices label="Hielo" values={['Sin hielo', 'Normal', 'Extra']} value={options.ice} onChange={v => change('ice', v)}/>}
                    <Choices label="Topping" values={['Sin topping', 'Caramelo', 'Chocolate']} value={options.topping} onChange={v => change('topping', v)}/>
                    <label className="field">Notas (opcional)<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej. Extra caliente" maxLength={250}/></label>
                </section>
            </div>
            <div className="dialog-footer">
                <div className="quantity"><button aria-label="Quitar uno" disabled={qty === 1} onClick={() => setQty(q => q - 1)}><Minus size={16}/></button><b>{qty}</b><button aria-label="Agregar uno" onClick={() => setQty(q => q + 1)}><Plus size={16}/></button></div>
                <button className="primary" disabled={product.soldOut} onClick={() => onAdd(product, qty, notes, options)}>{product.soldOut ? 'Agotado' : `Agregar · ${money(priceFor(product, options) * qty)}`}<ArrowRight size={18}/></button>
            </div>
        </dialog>
    );
}
