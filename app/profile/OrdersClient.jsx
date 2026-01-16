"use client";
import React, { useState, useEffect } from 'react';

function formatMoney(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount));
  } catch (e) {
    return `${amount}`;
  }
}

export default function OrdersClient() {
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const perPage = 10;

  useEffect(() => {
    // lazy load when tab selected
    if (activeTab === 'orders' && orders.length === 0) {
      fetchOrders(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchOrders(pageToLoad = 1) {
    setLoading(true);
    try {
      const res = await fetch(`/api/website/order/get?per_page=${perPage}&page=${pageToLoad}`, { cache: 'no-store' });
      if (res.status === 401) {
        setOrders([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      console.log(data);
      const list = Array.isArray(data?.orders) ? data.orders : [];
      if (pageToLoad === 1) setOrders(list);
      else setOrders(prev => [...prev, ...list]);
      setPage(pageToLoad);
      setHasMore(list.length === perPage);
    } catch (e) {
      console.error('fetch orders error', e);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(orderId) {
    setExpanded(prev => (prev === orderId ? null : orderId));
  }

  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: 18 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={() => setActiveTab('profile')} disabled={activeTab === 'profile'}>Profile</button>
        <button onClick={() => setActiveTab('orders')} disabled={activeTab === 'orders'}>Orders</button>
      </div>

      {activeTab !== 'orders' ? (
        <div style={{ marginTop: 12 }}>
          <em>Profile tab (unchanged)</em>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          {loading && orders.length === 0 ? (
            <div>Loading orders...</div>
          ) : null}

          {!loading && orders.length === 0 ? (
            <div>You have no orders yet.</div>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => (
              <div key={order.id} style={{ border: '1px solid #ddd', padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div><strong>Order #{order.id}</strong></div>
                    <div style={{ fontSize: 12, color: '#666' }}>{new Date(order.date_created || order.date_created_gmt || order.created_at).toLocaleString()}</div>
                    <div style={{ fontSize: 13 }}>{order.status} • {order.line_items ? order.line_items.length : 0} items</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold' }}>{formatMoney(order.total, order.currency || 'USD')}</div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => toggleExpand(order.id)}>View details</button>
                    </div>
                  </div>
                </div>

                {expanded === order.id ? (
                  <div style={{ marginTop: 12, borderTop: '1px dashed #eee', paddingTop: 12 }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Items</strong>
                      <ul>
                        {(order.line_items || []).map(item => (
                          <li key={item.id || `${item.product_id}-${item.name}`}>{item.name} × {item.quantity} — {formatMoney(item.price || item.total || 0, order.currency || 'USD')}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ display: 'flex', gap: 24 }}>
                      <div style={{ minWidth: 260 }}>
                        <strong>Shipping</strong>
                        <div>{order.shipping?.first_name} {order.shipping?.last_name}</div>
                        <div>{order.shipping?.address_1} {order.shipping?.address_2}</div>
                        <div>{order.shipping?.city} {order.shipping?.postcode}</div>
                        <div>{order.shipping?.state} {order.shipping?.country}</div>
                      </div>

                      <div style={{ minWidth: 260 }}>
                        <strong>Billing</strong>
                        <div>{order.billing?.first_name} {order.billing?.last_name}</div>
                        <div>{order.billing?.address_1} {order.billing?.address_2}</div>
                        <div>{order.billing?.city} {order.billing?.postcode}</div>
                        <div>{order.billing?.email} {order.billing?.phone}</div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <strong>Totals</strong>
                        <div>Subtotal: {formatMoney(order.subtotal || 0, order.currency || 'USD')}</div>
                        <div>Shipping: {formatMoney(order.shipping_total || order.shipping?.total || 0, order.currency || 'USD')}</div>
                        <div>Tax: {formatMoney(order.total_tax || 0, order.currency || 'USD')}</div>
                        <div style={{ fontWeight: 'bold', marginTop: 6 }}>Total: {formatMoney(order.total || 0, order.currency || 'USD')}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            {hasMore ? (
              <button onClick={() => fetchOrders(page + 1)} disabled={loading}>{loading ? 'Loading...' : 'Load more'}</button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
