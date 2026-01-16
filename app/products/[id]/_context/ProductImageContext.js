"use client";

import React, { createContext, useContext, useState } from "react";

const ProductImageContext = createContext();

export const ProductImageProvider = ({ children }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <ProductImageContext.Provider value={{ selectedImage, setSelectedImage }}>
            {children}
        </ProductImageContext.Provider>
    );
};

export const useProductImage = () => useContext(ProductImageContext);
