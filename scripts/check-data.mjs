import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../db.json',import.meta.url),'utf8'));
const ids=new Set();
for(const p of data.menu){assert(!ids.has(p.id),'ID duplicado');ids.add(p.id);assert(p.price>=0);assert.equal(typeof p.soldOut,'boolean');assert(existsSync(new URL('../public'+p.image,import.meta.url)),`No existe ${p.image}`);}
for(const o of data.orders){assert(['recibido','preparando','listo'].includes(o.status));for(const i of o.items){assert(ids.has(i.menuId));assert(i.qty>0);}}
for(let i=0;i<6;i++)assert(existsSync(new URL(`../public/assets/bean-${i}.webp`,import.meta.url)));
console.log(`${data.menu.length} productos, ${data.orders.length} pedidos y recursos gráficos: OK`);
