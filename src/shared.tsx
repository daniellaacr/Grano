import { AlertCircle, ArrowRight, Coffee, RefreshCw } from 'lucide-react';
export function Brand() { return <a className="brand" href="/" aria-label="Grano, inicio"><span>grano<b>.</b></span><small>SPECIALTY COFFEE</small></a>; }
export function Loader() { return <div className="loader" role="status" aria-label="Cargando Grano"><div className="rain" aria-hidden="true">{Array.from({ length: 42 }, (_, i) => <img key={i} src={`/assets/bean-${i % 6}.webp`} style={{ left: `${(i * 37.13) % 100}%`, width: `${29 + i % 4 * 4}px`, animationDelay: `-${(i * .193) % 2.5}s`, animationDuration: `${1.9 + (i % 5) * .17}s`, rotate: `${(i * 49) % 180}deg` }} alt=""/>)}</div><div className="load-brand"><Brand /><p>Preparando algo bueno…</p></div></div>; }
export function ErrorState({ message, retry }: {
    message: string;
    retry: () => void;
}) { return <div className="notice error" role="alert"><AlertCircle size={19}/><span>{message}</span><button className="text-btn" onClick={retry}><RefreshCw size={15}/> Reintentar</button></div>; }
export function Empty({ title, detail }: {
    title: string;
    detail: string;
}) { return <div className="empty"><Coffee size={32} strokeWidth={1.4}/><h3>{title}</h3><p>{detail}</p></div>; }
export function NextButton({ children, onClick, disabled = false }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}) { return <button className="primary" disabled={disabled} onClick={onClick}>{children}<ArrowRight size={19}/></button>; }
