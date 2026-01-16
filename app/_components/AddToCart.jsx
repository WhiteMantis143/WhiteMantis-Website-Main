'use client';
import React, { useState } from "react";
import { useCart } from '../_context/CartContext';
import toast from 'react-hot-toast';

const AddToCart = ({ product }) => {
  const { addItem, refresh } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (loading) return;

    // Check if product prop is provided
    if (!product) {
      console.error('Product prop is required for AddToCart component');
      return;
    }

    console.log(product)

    setLoading(true);
    try {
      await addItem(product.product_id, product.quantity || 1, {
        name: product.name, variation_id: product.variation_id,
        description: product.description,
        image: product.image,
      });
      await refresh(); // Refresh cart to get updated data from server
      toast.success('Added to cart!');
    } catch (err) {
      console.error('Add to cart error', err);
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      style={{
        width: "100%",
        backgroundColor: "#6C7A5F",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: 500,
        border: "none",
        padding: "12px clamp(24px, 5vw, 61.5px)",

        whiteSpace: "nowrap",
        cursor: loading ? "wait" : "pointer",
        transition: "background-color 0.2s ease",
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) e.target.style.backgroundColor = "#5f6f57";
      }}
      onMouseLeave={(e) => {
        if (!loading) e.target.style.backgroundColor = "#6C7A5F";
      }}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
};

export default AddToCart;
