import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type IconName = 'search' | 'bag' | 'user' | 'arrow' | 'check' | 'clock' | 'pin' | 'shield' | 'menu' | 'close' | 'minus' | 'plus' | 'heart' | 'bolt' | 'diamond' | 'home' | 'ring'

const Icon = ({ name, size = 20 }: { name: IconName; size?: number }) => {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bag: <><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
    shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    minus: <path d="M5 12h14"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5a5.5 5.5 0 0 0 1.1-8.9Z"/>,
    bolt: <path d="M13 3 6 13h6l-1 8 7-10h-6l1-8Z"/>,
    diamond: <path d="M12 3 21 12l-9 9-9-9 9-9Z"/>,
    home: <><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10.5V20h12v-9.5"/></>,
    ring: <circle cx="12" cy="12" r="7.5"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const products = [
  { id: 1, name: 'Шуруповёрт Makita', category: 'Инструменты', price: 590, week: 2990, image: 'https://images.unsplash.com/photo-1770763233593-74dfd0da7bf0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', tag: 'Хит' },
  { id: 2, name: 'Перфоратор Bosch', category: 'Инструменты', price: 790, week: 3990, image: 'https://images.unsplash.com/photo-1683115099247-7e33663f91cc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', tag: '–15%' },
  { id: 3, name: 'Набор ручных инструментов', category: 'Ремонт', price: 390, week: 1890, image: 'https://images.unsplash.com/photo-1675428133635-7f363d150e18?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', tag: 'Новинка' },
  { id: 4, name: 'Дрель ударная DeWalt', category: 'Инструменты', price: 690, week: 3490, image: 'https://images.unsplash.com/photo-1776711763505-4105861e0d41?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', tag: 'Хит' },
]

type Account = { name: string; email: string; phone: string; password: string }

const pickupPoints = [
  { id: 'sadovaya', name: 'БЕРИ на Садовой', address: 'Садовая ул., 18', hours: 'ежедневно 08:00–22:00', lat: 55.7658, lng: 37.6054 },
  { id: 'arbat', name: 'БЕРИ на Арбате', address: 'ул. Арбат, 24', hours: 'ежедневно 09:00–21:00', lat: 55.7496, lng: 37.5914 },
  { id: 'tverskaya', name: 'БЕРИ на Тверской', address: 'Тверская ул., 12', hours: 'ежедневно 10:00–22:00', lat: 55.7644, lng: 37.6056 },
  { id: 'patriki', name: 'БЕРИ в Патриарших', address: 'Малая Бронная ул., 15', hours: 'ежедневно 08:00–22:00', lat: 55.7622, lng: 37.5951 },
]

const categories = [
  { icon: 'bolt' as const, name: 'Инструменты для ремонта', count: 124, tone: 'yellow' },
  { icon: 'diamond' as const, name: 'Техника для уборки', count: 38, tone: 'blue' },
  { icon: 'home' as const, name: 'Бытовая техника', count: 76, tone: 'pink' },
  { icon: 'ring' as const, name: 'Спорт и активный отдых', count: 54, tone: 'green' },
]

function App() {
  const [page, setPage] = useState('home')
  const [selected, setSelected] = useState(products[0])
  const [cart, setCart] = useState<typeof products>([])
  const [days, setDays] = useState(2)
  const [menu, setMenu] = useState(false)
  const [orderDone, setOrderDone] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [user, setUser] = useState<Account | null>(null)

  const go = (next: string) => { setPage(next); setMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openProduct = (p: typeof products[0]) => { setSelected(p); go('product') }
  const add = (p = selected) => { if (!cart.find(x => x.id === p.id)) setCart([...cart, p]); go('cart') }

  useEffect(() => {
    const onHash = () => {
      const p = location.hash.replace('#/', '')
      if (p) setPage(p)
    }
    window.addEventListener('hashchange', onHash)
    onHash()
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (p: string) => { location.hash = `/${p}`; go(p) }
  const total = useMemo(() => cart.reduce((sum, p) => sum + p.price * days, 0), [cart, days])

  return <div className="app">
    <header className="header">
      <button className="logo" onClick={() => navigate('home')} aria-label="На главную">
        <span className="logoMark"><i></i><i></i><i></i></span>БЕРИ
      </button>
      <nav className={menu ? 'nav open' : 'nav'}>
        <button onClick={() => navigate('catalog')}>Каталог</button>
        <button onClick={() => navigate('how')}>Как это работает</button>
        <button onClick={() => navigate('delivery')}>Доставка и оплата</button>
        <button className="navAuth" onClick={() => navigate(user ? 'profile' : 'login')}>{user ? 'Профиль' : 'Войти'}</button>
      </nav>
      <div className="headerActions">
        <button className="iconBtn searchBtn" aria-label="Поиск"><Icon name="search"/></button>
        <button className="cartBtn" onClick={() => navigate('cart')}><Icon name="bag"/><span>Корзина</span>{cart.length > 0 && <b>{cart.length}</b>}</button>
        <button className="profileBtn" aria-label={user ? 'Профиль' : 'Войти'} onClick={() => navigate(user ? 'profile' : 'login')}><Icon name="user"/></button>
        <button className="menuBtn" onClick={() => setMenu(!menu)} aria-label="Меню"><Icon name={menu ? 'close' : 'menu'}/></button>
      </div>
    </header>

    <main>
      {page === 'home' && <Home onCatalog={() => navigate('catalog')}/>}
      {page === 'catalog' && <Catalog onProduct={openProduct}/>}
      {page === 'product' && <Product product={selected} days={days} setDays={setDays} onAdd={() => add()}/>}
      {page === 'cart' && <Cart cart={cart} days={days} setDays={setDays} total={total} remove={(id) => setCart(cart.filter(p => p.id !== id))} checkout={() => navigate('checkout')} catalog={() => navigate('catalog')}/>}
      {page === 'checkout' && <Checkout total={total} done={() => { setOrderDone(true); setCart([]) }}/>}
      {page === 'register' && <Auth mode="register" account={account} onDone={(next) => { setAccount(next); setUser(next); navigate('profile') }} onSwitch={() => navigate('login')}/>}
      {(page === 'login' || (page === 'profile' && !user)) && <Auth mode="login" account={account} onDone={(next) => { setUser(next); navigate('profile') }} onSwitch={() => navigate('register')}/>}
      {page === 'profile' && user && <Profile user={user} onCatalog={() => navigate('catalog')} onProduct={openProduct} onLogout={() => { setUser(null); navigate('login') }}/>}
      {page === 'how' && <InfoPage type="how" onCatalog={() => navigate('catalog')}/>}
      {page === 'delivery' && <InfoPage type="delivery" onCatalog={() => navigate('catalog')}/>}
      {orderDone && <div className="modalBackdrop"><div className="modal"><span className="successIcon"><Icon name="check" size={34}/></span><h2>Заказ оформлен</h2><p>Мы уже готовим вещи. Подтверждение и детали заказа отправили вам на телефон.</p><button className="primary" onClick={() => { setOrderDone(false); navigate('home') }}>На главную</button></div></div>}
    </main>
    <Footer onNavigate={navigate}/>
  </div>
}

function Home({ onCatalog }: { onCatalog: () => void }) {
  return <>
    <section className="hero">
      <div className="heroCopy">
        <span className="eyebrow">Аренда инструментов</span>
        <h1>Берите нужное.<br/>Не покупайте лишнее.</h1>
        <p>Инструменты и техника для ваших задач — от одного дня. С доставкой или самовывозом рядом с домом.</p>
        <div className="heroActions"><button className="primary" onClick={onCatalog}>Выбрать вещь <Icon name="arrow"/></button><span><b>4,9</b> оценка сервиса<br/><small>по 1 200+ отзывам</small></span></div>
      </div>
      <div className="heroVisual">
        <div className="figmaCross"><i></i><i></i></div>
        <div className="imageFrame"><img src={products[0].image} alt="Аккумуляторная дрель"/></div>
        <div className="floating priceFloat"><small>от</small><strong>590 ₽</strong><small>в сутки</small></div>
        <div className="floating available"><span></span>В наличии</div>
        <div className="cursor">БЕРИ</div>
      </div>
    </section>
    <section className="section categories">
      <div className="categoriesPanel">
        <div className="sectionHead">
          <div><span className="eyebrow">Категории</span><h2>Что вам нужно?</h2></div>
          <button className="catalogArrow" onClick={onCatalog} aria-label="Весь каталог"><Icon name="arrow"/></button>
        </div>
        <div className="categoryGrid">{categories.map(c => <button key={c.name} className={`categoryCard ${c.tone}`} onClick={onCatalog}><span className="catIcon"><Icon name={c.icon} size={26}/></span><strong>{c.name}</strong><small>{c.count} вещей</small><i><Icon name="arrow" size={16}/></i></button>)}</div>
      </div>
    </section>
    <section className="section steps">
      <span className="eyebrow">Всё просто</span><h2>От задачи до результата<br/>за три шага</h2>
      <div className="stepGrid">{[
        ['01', 'Выберите', 'Найдите нужную вещь и удобные даты аренды.'],
        ['02', 'Получите', 'Заберите в пункте рядом или закажите доставку.'],
        ['03', 'Верните', 'Верните вещь после использования. Всё просто.'],
      ].map((s, i) => <div className="step" key={s[0]}><span>{s[0]}</span><div className={`stepIcon s${i}`}><Icon name={i === 0 ? 'search' : i === 1 ? 'bag' : 'check'} size={28}/></div><h3>{s[1]}</h3><p>{s[2]}</p></div>)}</div>
    </section>
  </>
}

function ProductCard({ product, onClick }: { product: typeof products[0]; onClick: () => void }) {
  return <article className="productCard" onClick={onClick}><div className="productImage"><img src={product.image} alt={product.name}/><span>{product.tag}</span><button aria-label="В избранное" onClick={e => e.stopPropagation()}><Icon name="heart"/></button></div><small>{product.category}</small><h3>{product.name}</h3><div><strong>{product.price} ₽</strong><span>/ сутки</span></div></article>
}

function Catalog({ onProduct }: { onProduct: (p: typeof products[0]) => void }) {
  const [filter, setFilter] = useState('Все вещи')
  const tabs = ['Все', 'Для ремонта', 'Для уборки', 'Бытовая техника', 'Спорт и активный отдых']
  return <div className="page section"><div className="crumbs">Главная <span>/</span> Каталог</div><div className="catalogTitle"><div><span className="eyebrow">185 вещей в наличии</span><h1>Каталог аренды</h1></div><label className="searchField"><Icon name="search"/><input placeholder="Что вы ищете?"/></label></div><div className="filterTabs">{tabs.map(t => <button className={filter === t ? 'active' : ''} onClick={() => setFilter(t)} key={t}>{t}</button>)}</div><div className="catalogLayout"><aside><b>Срок аренды</b><label>От <input type="date"/></label><label>До <input type="date"/></label><b>Цена в сутки</b><div className="range"><span>200 ₽</span><span>2 500 ₽</span></div><input type="range" min="200" max="2500"/><label className="checkbox"><input type="checkbox"/> Только в наличии</label></aside><div className="productGrid catalogProducts">{products.concat(products.slice(0, 2)).map((p, i) => <ProductCard key={`${p.id}-${i}`} product={{...p, id: p.id + i * 10}} onClick={() => onProduct(p)}/>)}</div></div></div>
}

function Product({ product, days, setDays, onAdd }: { product: typeof products[0]; days: number; setDays: (n: number) => void; onAdd: () => void }) {
  return <div className="page section"><div className="crumbs">Каталог <span>/</span> Инструменты <span>/</span> {product.name}</div><div className="productDetail"><div className="detailImage"><img src={product.image} alt={product.name}/></div><div className="detailInfo"><span className="stock"><i></i> В наличии</span><h1>{product.name}</h1><p className="sku">Аккумуляторный инструмент · комплект с кейсом</p><div className="rating"><b>4,9</b> ★★★★★ <span>46 отзывов</span></div><div className="tariffs"><button className="active"><small>Посуточно</small><strong>{product.price} ₽</strong><span>за сутки</span></button><button><small>На неделю</small><strong>{product.week} ₽</strong><span>выгоднее на 28%</span></button></div><div className="dateCard"><div><small>Начало аренды</small><b>14 июня, пт</b></div><div><small>Вернуть</small><b>{13 + days} июня</b></div></div><div className="quantity"><span>Срок аренды</span><div><button onClick={() => setDays(Math.max(1, days - 1))}><Icon name="minus"/></button><b>{days} дня</b><button onClick={() => setDays(days + 1)}><Icon name="plus"/></button></div></div><div className="detailTotal"><span>Итого за {days} дня</span><strong>{product.price * days} ₽</strong></div><button className="primary wide" onClick={onAdd}>Добавить в корзину <Icon name="bag"/></button><p className="deposit"><Icon name="shield"/> Залог 5 000 ₽ вернётся сразу после возврата</p></div></div><div className="features"><div><Icon name="shield"/><b>Проверено</b><span>Техника проходит диагностику</span></div><div><Icon name="clock"/><b>Отмена бесплатно</b><span>Не позднее чем за 24 часа</span></div><div><Icon name="pin"/><b>Пункт рядом</b><span>Более 40 точек в городе</span></div></div></div>
}

function Cart({ cart, days, setDays, total, remove, checkout, catalog }: { cart: typeof products; days: number; setDays: (n:number)=>void; total:number; remove:(id:number)=>void; checkout:()=>void; catalog:()=>void }) {
  if (!cart.length) return <div className="empty page"><span><Icon name="bag" size={36}/></span><h1>Корзина пока пуста</h1><p>Добавьте нужные вещи — мы сохраним выбранные даты и тариф.</p><button className="primary" onClick={catalog}>Перейти в каталог</button></div>
  return <div className="page section cartPage"><div><div className="crumbs">Главная <span>/</span> Корзина</div><h1>Корзина</h1>{cart.map(p => <article className="cartItem" key={p.id}><img src={p.image} alt={p.name}/><div><small>{p.category}</small><h3>{p.name}</h3><button className="remove" onClick={() => remove(p.id)}>Удалить</button></div><div className="counter"><button onClick={() => setDays(Math.max(1, days - 1))}><Icon name="minus"/></button><b>{days} дн.</b><button onClick={() => setDays(days + 1)}><Icon name="plus"/></button></div><strong>{p.price * days} ₽</strong></article>)}</div><aside className="summary"><h2>Ваш заказ</h2><p><span>Аренда на {days} дня</span><b>{total} ₽</b></p><p><span>Сервисный сбор</span><b>0 ₽</b></p><p><span>Залог <i title="Возвратный залог">?</i></span><b>5 000 ₽</b></p><div><span>К оплате сейчас</span><strong>{total + 5000} ₽</strong></div><small>Залог вернётся после сдачи вещей</small><button className="primary wide" onClick={checkout}>Продолжить <Icon name="arrow"/></button></aside></div>
}

function pinIcon(active: boolean) {
  return L.divIcon({
    className: 'mapPinWrap',
    html: `<span class="mapPin${active ? ' active' : ''}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 26],
  })
}

function PlacePicker({ mode, onChange }: { mode: 'pickup' | 'delivery'; onChange: (place: { title: string; text: string }) => void }) {
  const mapNode = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const deliveryMarker = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const [selectedId, setSelectedId] = useState(pickupPoints[0].id)
  const [query, setQuery] = useState('Садовая ул., 18, Москва')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const node = mapNode.current
    if (!node) return
    const map = L.map(node, { scrollWheelZoom: false }).setView([55.758, 37.6], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    mapRef.current = map

    const placeDelivery = async (lat: number, lng: number) => {
      if (!deliveryMarker.current) deliveryMarker.current = L.marker([lat, lng], { icon: pinIcon(true) }).addTo(map)
      else deliveryMarker.current.setLatLng([lat, lng])
      map.flyTo([lat, lng], 16)
      setStatus('Определяем адрес…')
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru`)
        const data = await response.json()
        const text = (data.display_name as string | undefined) || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        setQuery(text)
        setStatus('')
        onChangeRef.current({ title: 'Адрес доставки', text })
      } catch {
        const text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        setQuery(text)
        setStatus('Адрес отмечен на карте')
        onChangeRef.current({ title: 'Адрес доставки', text })
      }
    }

    if (mode === 'pickup') {
      pickupPoints.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], { icon: pinIcon(point.id === pickupPoints[0].id) }).addTo(map)
        marker.on('click', () => {
          setSelectedId(point.id)
          onChangeRef.current({ title: point.name, text: `${point.address} · ${point.hours}` })
          map.flyTo([point.lat, point.lng], 15)
        })
        markersRef.current[point.id] = marker
      })
      const first = pickupPoints[0]
      onChangeRef.current({ title: first.name, text: `${first.address} · ${first.hours}` })
    } else {
      const first = pickupPoints[0]
      deliveryMarker.current = L.marker([first.lat, first.lng], { icon: pinIcon(true) }).addTo(map)
      map.on('click', (event) => { void placeDelivery(event.latlng.lat, event.latlng.lng) })
      onChangeRef.current({ title: 'Адрес доставки', text: `${first.address}, Москва` })
    }

    const timer = window.setTimeout(() => map.invalidateSize(), 80)
    return () => {
      window.clearTimeout(timer)
      map.remove()
      mapRef.current = null
      markersRef.current = {}
      deliveryMarker.current = null
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'pickup') return
    Object.entries(markersRef.current).forEach(([id, marker]) => marker.setIcon(pinIcon(id === selectedId)))
  }, [selectedId, mode])

  const searchAddress = async (event: React.FormEvent) => {
    event.preventDefault()
    const map = mapRef.current
    if (!map || !query.trim()) return
    setStatus('Ищем адрес…')
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1&accept-language=ru`)
      const data = await response.json()
      const hit = data[0] as { lat: string; lon: string; display_name: string } | undefined
      if (!hit) return setStatus('Адрес не найден')
      const lat = Number(hit.lat)
      const lng = Number(hit.lon)
      if (!deliveryMarker.current) deliveryMarker.current = L.marker([lat, lng], { icon: pinIcon(true) }).addTo(map)
      else deliveryMarker.current.setLatLng([lat, lng])
      map.flyTo([lat, lng], 16)
      setQuery(hit.display_name)
      setStatus('')
      onChangeRef.current({ title: 'Адрес доставки', text: hit.display_name })
    } catch {
      setStatus('Не удалось найти адрес')
    }
  }

  return <div className="placePicker">
    {mode === 'delivery' && <form className="addressSearch" onSubmit={searchAddress}><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Улица, дом" aria-label="Адрес доставки"/><button type="submit">Найти</button></form>}
    <div className="mapCanvas" ref={mapNode} role="application" aria-label={mode === 'pickup' ? 'Карта пунктов выдачи' : 'Карта адреса доставки'}/>
    {status && <p className="mapStatus">{status}</p>}
    {mode === 'pickup' && <div className="pointList">{pickupPoints.map((point) => <button key={point.id} type="button" className={selectedId === point.id ? 'active' : ''} onClick={() => { setSelectedId(point.id); mapRef.current?.flyTo([point.lat, point.lng], 15); onChange({ title: point.name, text: `${point.address} · ${point.hours}` }) }}><b>{point.name}</b><small>{point.address} · {point.hours}</small></button>)}</div>}
    {mode === 'delivery' && <p className="mapHint">Нажмите на карту, чтобы поставить точку доставки.</p>}
  </div>
}

function Checkout({ total, done }: { total: number; done: () => void }) {
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup')
  const [place, setPlace] = useState({ title: pickupPoints[0].name, text: `${pickupPoints[0].address} · ${pickupPoints[0].hours}` })
  const deliveryFee = method === 'delivery' ? 490 : 0
  const pay = total + 5000 + deliveryFee
  return <div className="page section checkout"><div className="checkoutForm"><div className="crumbs">Корзина <span>/</span> Оформление</div><h1>Оформление аренды</h1><h3><span>1</span>Как получить?</h3><div className="methodGrid"><button className={method === 'pickup' ? 'active' : ''} onClick={() => setMethod('pickup')}><Icon name="pin"/><b>Самовывоз</b><small>Бесплатно · от 15 минут</small></button><button className={method === 'delivery' ? 'active' : ''} onClick={() => setMethod('delivery')}><Icon name="arrow"/><b>Доставка</b><small>490 ₽ · за 2 часа</small></button></div><div className="pickup"><span><Icon name="pin"/></span><div><b>{place.title}</b><p>{place.text}</p></div></div><PlacePicker key={method} mode={method} onChange={setPlace}/><h3><span>2</span>Оплата</h3><label className="payment"><input type="radio" defaultChecked/><span>•••• 4589</span><b>Банковская карта</b><small>Оплата защищена</small></label></div><aside className="summary"><h2>Итого</h2><p><span>Аренда</span><b>{total} ₽</b></p><p><span>{method === 'pickup' ? 'Самовывоз' : 'Доставка'}</span><b>{deliveryFee} ₽</b></p><p><span>Залог</span><b>5 000 ₽</b></p><div><span>К оплате</span><strong>{pay} ₽</strong></div><button className="primary wide" onClick={done}>Оплатить {pay} ₽</button><small className="legal">Нажимая кнопку, вы соглашаетесь с условиями аренды</small></aside></div>
}

function Auth({ mode, account, onDone, onSwitch }: { mode: 'login' | 'register'; account: Account | null; onDone: (account: Account) => void; onSwitch: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const isLogin = mode === 'login'
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value })
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const email = form.email.trim()
    if (!isLogin && form.name.trim().length < 2) return setError('Укажите имя')
    if (!email.includes('@')) return setError('Укажите почту')
    if (form.password.length < 4) return setError('Пароль — минимум 4 символа')
    if (isLogin) {
      if (!account || account.email.toLowerCase() !== email.toLowerCase() || account.password !== form.password) return setError('Неверная почта или пароль')
      onDone(account)
      return
    }
    onDone({ name: form.name.trim(), email, phone: form.phone.trim(), password: form.password })
  }
  return <div className="authPage"><form className="authCard" onSubmit={submit}><span className="eyebrow">{isLogin ? 'С возвращением' : 'Новый аккаунт'}</span><h1>{isLogin ? 'Вход' : 'Регистрация'}</h1><p>{isLogin ? 'Войдите, чтобы видеть аренды и избранное.' : 'Создайте аккаунт — это займёт меньше минуты.'}</p>{!isLogin && <label>Имя<input value={form.name} onChange={set('name')} placeholder="Алексей" autoComplete="name"/></label>}{!isLogin && <label>Телефон<input value={form.phone} onChange={set('phone')} placeholder="+7 999 000-00-00" autoComplete="tel"/></label>}<label>Почта<input type="email" value={form.email} onChange={set('email')} placeholder="you@mail.ru" autoComplete="email"/></label><label>Пароль<input type="password" value={form.password} onChange={set('password')} placeholder="Минимум 4 символа" autoComplete={isLogin ? 'current-password' : 'new-password'}/></label>{error && <p className="authError">{error}</p>}<button className="primary wide" type="submit">{isLogin ? 'Войти' : 'Создать аккаунт'}</button><p className="authSwitch">{isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'} <button type="button" onClick={onSwitch}>{isLogin ? 'Зарегистрироваться' : 'Войти'}</button></p></form></div>
}

function Profile({ user, onCatalog, onProduct, onLogout }: { user: Account; onCatalog: () => void; onProduct: (p: typeof products[0]) => void; onLogout: () => void }) {
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'Я'
  const [firstName, ...restName] = user.name.split(/\s+/)
  const [tab, setTab] = useState('rentals')
  const [saved, setSaved] = useState(false)
  const tabs = [['rentals','Мои аренды'],['favorites','Избранное'],['settings','Настройки'],['payments','Оплата'],['support','Поддержка']]
  return <div className="profilePage section">
    <aside className="profileSide"><div className="avatar">{initials}</div><b>{user.name}</b><small>{user.email}</small><nav>{tabs.map(([id,label]) => <button className={tab === id ? 'active' : ''} onClick={() => {setTab(id);setSaved(false)}} key={id}>{label}{id === 'rentals' && <i>1</i>}</button>)}</nav><button className="logout" onClick={onLogout}>Выйти из аккаунта</button></aside>
    <div className="profileContent">
      <div className="profileHeading"><div><span className="eyebrow">Личный кабинет</span><h1>{tab === 'rentals' ? 'Мои аренды' : tab === 'favorites' ? 'Избранное' : tab === 'settings' ? 'Настройки профиля' : tab === 'payments' ? 'Способы оплаты' : 'Помощь'}</h1></div>{tab === 'rentals' && <button className="primary" onClick={onCatalog}>Новая аренда <Icon name="plus"/></button>}</div>
      {tab === 'rentals' && <><div className="accountTabs"><button className="active">Активные <span>1</span></button><button>Предстоящие</button><button>Завершённые</button></div><article className="rentalCard"><div className="rentalTop"><span><i></i> Сейчас у вас</span><small>Заказ № 20481</small></div><div className="rentalBody"><img src={products[0].image} alt={products[0].name}/><div><small>Инструменты</small><h3>{products[0].name}</h3><p>Аренда до 16 июня, 20:00</p></div><div><small>Вернуть через</small><strong>1 день 8 ч</strong></div></div><div className="rentalFooter"><span><Icon name="pin"/><b>Садовая ул., 18</b></span><button>Продлить аренду</button><button>Детали заказа</button></div></article><div className="profileQuick"><div><Icon name="clock"/><span><b>История заказов</b><small>6 завершённых аренд</small></span></div><div><Icon name="shield"/><span><b>Уровень «Надёжный»</b><small>Следующая аренда без залога</small></span></div></div></>}
      {tab === 'favorites' && <><p className="profileIntro">Сохранённые вещи — мы сообщим, если цена снизится.</p><div className="productGrid profileProducts">{products.slice(0,3).map(p => <ProductCard key={p.id} product={p} onClick={() => onProduct(p)}/>)}</div></>}
      {tab === 'settings' && <div className="settingsCard"><div className="settingsAvatar"><div className="avatar">{initials}</div><span><b>Фотография профиля</b><small>JPG или PNG, не более 5 МБ</small></span><button>Изменить</button></div><div className="settingsFields"><label>Имя<input defaultValue={firstName || user.name}/></label><label>Фамилия<input defaultValue={restName.join(' ')}/></label><label>Телефон<input defaultValue={user.phone}/></label><label>Электронная почта<input defaultValue={user.email}/></label></div><label className="notifyCheck"><input type="checkbox" defaultChecked/> Получать напоминания о возврате</label><button className="primary" onClick={() => setSaved(true)}>{saved ? 'Изменения сохранены' : 'Сохранить'}{saved && <Icon name="check"/>}</button></div>}
      {tab === 'payments' && <><p className="profileIntro">Карты для быстрой и безопасной оплаты аренды.</p><div className="bankCard"><b>БЕРИ</b><strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 4589</strong><span>АЛЕКСЕЙ ИВАНОВ <small>08/28</small></span></div><div className="paymentRow"><span><b>Основная карта</b><small>Для оплаты, залогов и возвратов</small></span><button>Удалить</button></div><button className="addCard"><Icon name="plus"/> Добавить карту</button></>}
      {tab === 'support' && <><p className="profileIntro">Большинство вопросов решаем за несколько минут.</p><div className="supportGrid">{[['clock','Продлить аренду','Изменить дату возврата'],['shield','Проблема с вещью','Сообщить о неисправности'],['pin','Пункты возврата','Адреса и часы работы'],['user','Написать в чат','Ответим за 3 минуты']].map(([icon,title,text]) => <button key={title}><span><Icon name={icon as IconName}/></span><b>{title}</b><small>{text}</small></button>)}</div><div className="supportLine"><span><i></i><b>Служба заботы онлайн</b><small>Ежедневно 08:00–23:00</small></span><button className="primary">Открыть чат <Icon name="arrow"/></button></div></>}
    </div>
  </div>
}

function InfoPage({ type, onCatalog }: { type: 'how'|'delivery'; onCatalog:()=>void }) {
  const isHow = type === 'how'
  return <div className="infoPage"><section><span className="eyebrow">{isHow ? 'Просто и прозрачно' : 'Получайте как удобно'}</span><h1>{isHow ? 'Пользуйтесь вещами, не владея ими' : 'Доставка и самовывоз'}</h1><p>{isHow ? 'БЕРИ помогает решать бытовые задачи без лишних покупок. Вы платите только за время, когда вещь действительно нужна.' : 'Заберите заказ рядом с домом или доверьте дорогу нам. Все условия известны заранее.'}</p><button className="primary" onClick={onCatalog}>Выбрать вещь <Icon name="arrow"/></button></section><div className="infoCards">{(isHow ? [['01','Выбираете вещь','Каталог с честными фото, характеристиками и прозрачными тарифами.'],['02','Бронируете даты','Стоимость рассчитывается сразу. Никаких скрытых платежей.'],['03','Пользуетесь','Все вещи чистые, исправные и полностью готовы к работе.'],['04','Возвращаете','Привезите в пункт или вызовите курьера — залог вернётся сразу.']] : [['01','Самовывоз','Более 40 пунктов. Бронь будет ждать вас к выбранному времени.'],['02','Курьером','Доставим в пределах города за два часа или к точному времени.'],['03','Оплата','Картой онлайн. Залог блокируется и возвращается после сдачи.'],['04','Возврат','Верните туда же или закажите курьера в личном кабинете.']]).map(c => <article key={c[0]}><span>{c[0]}</span><h3>{c[1]}</h3><p>{c[2]}</p></article>)}</div></div>
}

function Footer({ onNavigate }: { onNavigate:(p:string)=>void }) {
  return <footer><button className="logo light" onClick={() => onNavigate('home')}><span className="logoMark"><i></i><i></i><i></i></span>БЕРИ</button><p>Вещи для жизни. Без лишних покупок.</p><div><button onClick={() => onNavigate('catalog')}>Каталог</button><button onClick={() => onNavigate('how')}>Как это работает</button><button onClick={() => onNavigate('delivery')}>Доставка</button></div><small>© 2025 БЕРИ · Сервис аренды вещей</small></footer>
}

export default App
