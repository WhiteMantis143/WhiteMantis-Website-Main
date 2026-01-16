"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./GridFilter.module.css";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "../../../../_components/Whishlist";
import { useCart } from "../../../../_context/CartContext";

const GridFilter = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState([]);
  const [openPanels, setOpenPanels] = useState(() => []);
  const [selected, setSelected] = useState(() => ({}));
  // parentCategoryId: undefined = not yet resolved, -1 = resolved but no parent found, >0 = valid parent id
  const [parentCategoryId, setParentCategoryId] = useState(undefined);
  const { addItem } = useCart();

  const DEFAULT_PARENT_SLUG = "merchandise-and-equipments";

  // mounted ref and per-page
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const PER_PAGE = 9;

  const loadProducts = useCallback(async (categoryId = null, selectedIds = [], pageToLoad = 1, append = false) => {
    setLoadingProducts(true);
    try {
      // Request exactly PER_PAGE items and use headers (when available) to determine
      // whether more items exist. Previously we requested PER_PAGE+1 and sliced which
      // caused one item per page to be dropped.
      const fetchPerPage = PER_PAGE;
      let url = `/api/website/products/list-all?per_page=${fetchPerPage}&page=${pageToLoad}`;
      if (categoryId) url = `/api/website/products/filter?category=${encodeURIComponent(categoryId)}&per_page=${fetchPerPage}&page=${pageToLoad}`;
      if (selectedIds && selectedIds.length) url = `/api/website/products/filter?categories=${encodeURIComponent(selectedIds.join(','))}&per_page=${fetchPerPage}&page=${pageToLoad}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!mountedRef.current) return;
      const list = Array.isArray(json) ? json : [];

      const totalHeader = res.headers ? res.headers.get('X-WP-Total') || res.headers.get('X-WC-Total') : null;
      const total = totalHeader ? parseInt(totalHeader, 10) : 0;

      if (append) setProducts((prev) => prev.concat(list)); else setProducts(list);

      if (total) {
        setHasMore(pageToLoad * PER_PAGE < total);
      } else {
        setHasMore(list.length === PER_PAGE);
      }
    } catch (err) {
      console.error("loadProducts error:", err);
      setProducts([]);
      setHasMore(false);
    } finally {
      if (mountedRef.current) setLoadingProducts(false);
    }
  }, []);

  const togglePanel = (key) => {
    setOpenPanels((prev) => {
      const copy = Array.isArray(prev) ? [...prev] : [];
      const idx = copy.indexOf(key);
      if (idx >= 0) copy.splice(idx, 1);
      else copy.push(key);
      return copy;
    });
  };
  const toggleOption = (filterKey, option) => {
    setSelected((prev) => {
      const cur = new Set(prev[filterKey] || []);
      if (cur.has(option)) cur.delete(option);
      else cur.add(option);
      return { ...prev, [filterKey]: Array.from(cur) };
    });
  };
  const clearFilter = (filterKey) => { setSelected((prev) => { const copy = { ...prev }; delete copy[filterKey]; return copy; }); };

  useEffect(() => {
    // Only run on the "real" mount after Strict Mode cleanup
    mountedRef.current = true;

    async function load() {
      // Guard: if we already started loading, don't start again
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;

      try {
        const slugRes = await fetch(`/api/website/products/get-categories?slug=${encodeURIComponent(DEFAULT_PARENT_SLUG)}`);
        const slugJson = await slugRes.json();
        let parentId = null; if (Array.isArray(slugJson) && slugJson.length) parentId = slugJson[0].id;
        // If merchandise parent category is missing, mark that fact so we don't fall
        // back to listing all products (which previously caused coffee-beans items to appear).
        if (!parentId) {
          if (!mountedRef.current) return;
          setFilters([]);
          setProducts([]);
          setHasMore(false);
          setParentCategoryId(-1);
          return;
        }
        if (!mountedRef.current) return;
        setParentCategoryId(parentId);
        const groupsRes = await fetch(`/api/website/products/get-categories?parent=${parentId}&per_page=100`);
        const groups = await groupsRes.json();
        const builtFilters = [];
        for (const g of groups) {
          const childrenRes = await fetch(`/api/website/products/get-categories?parent=${g.id}&per_page=100`);
          const children = await childrenRes.json();
          const options = Array.isArray(children) && children.length ? children.map((c) => ({ id: c.id, name: c.name })) : [];
          builtFilters.push({ key: String(g.slug || g.id), label: g.name, options });
        }
        if (!mountedRef.current) return; setFilters(builtFilters.length ? builtFilters : [{ key: 'category', label: 'Category', options: groups.map(g => ({ id: g.id, name: g.name })) }]);
        setPage(1); await loadProducts(parentId, [], 1, false);
      } catch (err) { console.error("Failed to load categories/products:", err); setPage(1); await loadProducts(null, [], 1, false); }
    }
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [loadProducts]);

  useEffect(() => {
    // Only run if there are actual filter selections
    const selectedKeys = Object.keys(selected).filter(k => (selected[k] || []).length > 0);
    if (selectedKeys.length === 0) return;

    const selectedGroups = Object.keys(selected).filter((k) => (selected[k] || []).length);

    async function reFetch() {
      setPage(1);
      if (!selectedGroups.length) {
        try {
          // If parentCategoryId is undefined we're still resolving; do nothing.
          if (typeof parentCategoryId === 'undefined') return;
          // If parentCategoryId === -1 it means no parent exists for this page; show no products.
          if (parentCategoryId === -1) {
            if (!mountedRef.current) return;
            setProducts([]);
            setHasMore(false);
            return;
          }
          await loadProducts(parentCategoryId, [], 1, false);
        } catch (err) { console.error("reFetch error:", err); }
        return;
      }

      try {
        const groupResults = [];
        for (const key of selectedGroups) {
          const ids = (selected[key] || []).filter((s) => String(s).match(/^\d+$/));
          if (!ids.length) { groupResults.push([]); continue; }
          const q = encodeURIComponent(ids.join(","));
          const res = await fetch(`/api/website/products/filter?categories=${q}&per_page=100&page=1`);
          const json = await res.json();
          groupResults.push(Array.isArray(json) ? json : []);
        }

        const idCounts = new Map();
        for (const list of groupResults) {
          const unique = new Set(list.map((p) => p.id));
          for (const id of unique) idCounts.set(id, (idCounts.get(id) || 0) + 1);
        }

        const matchedIds = [...idCounts.entries()].filter(([id, cnt]) => cnt === groupResults.length).map(([id]) => id);
        const productMap = new Map();
        for (const list of groupResults) list.forEach((p) => { if (!productMap.has(p.id)) productMap.set(p.id, p); });
        const matchedProducts = matchedIds.map((id) => productMap.get(id)).filter(Boolean);
        if (!mountedRef.current) return;
        setProducts(matchedProducts.slice(0, PER_PAGE));
        setHasMore(matchedProducts.length > PER_PAGE);
      } catch (err) { console.error("reFetch error:", err); if (!mountedRef.current) return; setProducts([]); setHasMore(false); }
    }

    reFetch();
  }, [selected, parentCategoryId, loadProducts]);

  const stripHtml = (html) => { if (!html) return ""; try { return String(html).replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim(); } catch (e) { return String(html); } };
  const truncateText = (text, limit = 100) => { if (!text) return ""; const s = String(text).trim(); return s.length > limit ? s.slice(0, limit).trim() + "..." : s; };
  const formatFinalPrice = (product) => { if (!product) return ""; if (product.price) return `AED ${product.price}`; const txt = stripHtml(product.price_html || ""); const m = txt.match(/[\d,]+(?:\.\d+)?/); if (m) return `AED ${m[0]}`; return txt || ""; };

  return (
    <>
      <div className={styles.Main}>
        <div className={styles.MainConatiner}>
          <div className={styles.TopConatiner}><div className={styles.Title}><h3>Merchandise & Equipments</h3><p>({products.length} items)</p></div><div className={styles.SortFilter}><p>Sort bY:</p><p>Recommended</p></div></div>
          <div className={styles.BottomConatiner}>
            <div className={styles.LeftFilters}><div className={styles.FilterHeading}><p>Filter By :</p></div>
              <div className={styles.Filters}>{(filters.length ? filters : []).map((f) => {
                const hasSelected = (selected[f.key] || []).length > 0;
                const isOpen = (openPanels || []).includes(f.key);
                return (<div key={f.key} className={styles.FilterBlock}><div className={styles.FilterHeader} onClick={() => togglePanel(f.key)} aria-expanded={isOpen}><h4>{f.label}</h4><div style={{ display: "flex", alignItems: "center", gap: 8 }}>{hasSelected ? (<button className={styles.ClearBtn} onClick={(e) => { e.stopPropagation(); clearFilter(f.key); }}>×</button>) : null}<span className={styles.ToggleIcon}>{isOpen ? "-" : "+"}</span></div></div>{isOpen ? (<div className={styles.CheckboxList}>{f.options && f.options.length ? f.options.map((opt) => (<label key={opt.id} className={styles.CheckboxItem}><input type="checkbox" checked={(selected[f.key] || []).includes(opt.id)} onChange={() => toggleOption(f.key, opt.id)} /><span>{opt.name}</span></label>)) : (<div className={styles.CheckboxListEmpty} style={{ color: '#fff' }}>No options</div>)}</div>) : null}</div>);
              })}</div>
            </div>
            <div className={styles.RightProducts}><div className={styles.Products}>{products.length ? products.map((product) => { const title = product.name || product.title || "Product"; const desc = product.short_description || product.description || ""; const imgSrc = (product.images && product.images[0] && product.images[0].src) || null; return (<div key={product.id || product.slug || Math.random()} className={styles.Product}><Link href={`/products/${product.id}`}><div className={styles.ProductsTop}><div className={styles.ProductTopOne}><div className={styles.WishList}><WishlistButton product={product} /></div><div className={styles.ProductImgg}>{imgSrc ? (<Image src={imgSrc} alt={title} width={400} height={350} />) : (<div style={{ width: 400, height: 350, background: '#f4f4f4' }} />)}</div></div><div className={styles.ProductTopTwo}><h2>{title}</h2><p>{truncateText(stripHtml(desc), 100)}</p></div></div></Link><div className={styles.ProductsBottom}><p>{formatFinalPrice(product)}</p><button className={styles.AddToCart} onClick={() => addItem(product.id, 1)}>Add to cart</button></div></div>); }) : (<div style={{ padding: 24 }}>No items available</div>)}</div></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GridFilter;
