"use client";
import React, { useEffect, useState } from 'react';
import styles from "./NewsLetter.module.css";

const WP_BASE = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WP_URL || '';

const NewsLetter = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    function onDocClick(e){
      const el = e.target.closest && e.target.closest('[data-newsletter]');
      if(el){
        const val = el.getAttribute('data-newsletter');
        if(!val || val === 'open'){
          e.preventDefault();
          setOpen(true);
        }
      }
    }
    document.addEventListener('click', onDocClick);

    const openHandler = () => setOpen(true);
    window.addEventListener('openNewsletter', openHandler);
    window.openNewsletter = () => setOpen(true);

    return ()=>{
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('openNewsletter', openHandler);
      try{ delete window.openNewsletter }catch(e){}
    }
  }, []);

  async function handleSubmit(e){
    e && e.preventDefault && e.preventDefault();
    if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
      setMessage({type:'error', text:'Please enter a valid email.'});
      return;
    }
    setLoading(true);
    setMessage(null);
    try{
      if(!WP_BASE){
        throw new Error('WordPress base URL not configured (NEXT_PUBLIC_WORDPRESS_URL)');
      }
      const res = await fetch(`${WP_BASE}/wp-json/custom/v1/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email })
      });
      const j = await res.json();
      if(!res.ok){
        throw new Error(j?.message || 'Failed to submit');
      }
      setMessage({type:'success', text: j?.message || 'Subscribed!'});
      setEmail('');
    }catch(err){
      setMessage({type:'error', text: err?.message || 'Submission failed'});
    }finally{
      setLoading(false);
    }
  }

  if(!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={(e)=>{ if(e.target === e.currentTarget) setOpen(false); }}>
      <div className={styles.panel}>
        <button className={styles.closeBtn} aria-label="Close" onClick={()=>setOpen(false)}>×</button>
        <p className={styles.headerSmall}>Specialty Coffee News in Your Inbox</p>
        <h2 className={styles.title}>THE WHITE MANTIS DISPATCH: SUBSCRIBE TO OUR NEWSLETTER!</h2>
        <p className={styles.lead}>Stay connected to the world of specialty coffee craft. Get exclusive access to new product offers, learn expert brewing tips, and receive curated updates on global coffee releases directly in your inbox.</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <input className={styles.input} placeholder="Enter your email address here" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button className={styles.subscribeBtn} type="submit" disabled={loading}>{loading ? '...' : 'Subscribe'}</button>
          </div>
        </form>
        {message ? (<div className={styles.message} style={{ color: message.type === 'success' ? 'green' : '#c0392b' }}>{message.text}</div>) : null}
      </div>
    </div>
  );
}

export default NewsLetter;
