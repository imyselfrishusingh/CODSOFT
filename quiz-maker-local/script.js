const PRODUCTS_KEY = 'mini_products_v1';
const CART_KEY = 'mini_cart_v1';
const ORDERS_KEY = 'mini_orders_v1';

function sampleProducts(){
  return [
    {id:'p1',title:'Classic T-Shirt',price:499,desc:'Comfort cotton tee'},
    {id:'p2',title:'Wireless Earbuds',price:1499,desc:'Bluetooth earbuds'},
    {id:'p3',title:'Water Bottle',price:299,desc:'1L steel bottle'}
  ];
}
function loadProducts(){ return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || JSON.stringify(sampleProducts())); }
function loadCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCart(); }

function renderProducts(){
  const products = loadProducts();
  const el = document.getElementById('products'); el.innerHTML='';
  products.forEach(p => {
    const d = document.createElement('div'); d.className='product';
    d.innerHTML = `<h3>${p.title}</h3><p>${p.desc}</p><p>₹${p.price}</p>`;
    const b = document.createElement('button'); b.className='btn'; b.textContent='Add';
    b.onclick = () => {
      const cart = loadCart();
      const found = cart.find(x=>x.id===p.id);
      if(found) found.qty++;
      else cart.push({id:p.id, title:p.title, price:p.price, qty:1});
      saveCart(cart);
    };
    d.appendChild(b); el.appendChild(d);
  });
}

function renderCart(){
  const cart = loadCart();
  document.getElementById('count').textContent = cart.reduce((s,i)=>s+i.qty,0);
  const items = document.getElementById('cart-items'); items.innerHTML='';
  cart.forEach((it, idx) => {
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `<strong>${it.title}</strong><p>₹${it.price} x ${it.qty}</p>`;
    const inc = document.createElement('button'); inc.className='btn'; inc.textContent='+';
    inc.onclick = () => { it.qty++; saveCart(cart); };
    const dec = document.createElement('button'); dec.className='btn'; dec.textContent='-';
    dec.onclick = () => { it.qty = Math.max(0,it.qty-1); const nc = cart.filter(x=>x.qty>0); saveCart(nc); };
    div.appendChild(inc); div.appendChild(dec);
    items.appendChild(div);
  });
  const total = cart.reduce((s,i)=>s + i.price*i.qty,0);
  document.getElementById('total').textContent = `Total: ₹${total}`;
}

function placeOrder(){
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const cart = loadCart();
  if(!name || !email){ alert('Enter name and email'); return; }
  if(cart.length===0){ alert('Cart empty'); return; }
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  const orderId = 'ORD' + Date.now();
  orders.push({ id: orderId, name, email, items: cart, total: cart.reduce((s,i)=>s+i.price*i.qty,0), at: new Date().toISOString() });
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  localStorage.removeItem(CART_KEY);
  renderCart();
  document.getElementById('order-msg').textContent = `Order placed. ID: ${orderId}`;
  document.getElementById('name').value=''; document.getElementById('email').value='';
}

window.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();
  document.getElementById('place').addEventListener('click', placeOrder);
});
