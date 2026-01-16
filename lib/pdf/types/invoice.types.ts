// TypeScript interfaces for PDF invoice generation

export interface InvoiceAddress {
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email?: string;
    phone?: string;
}

export interface InvoiceLineItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    total: number;
    tax: number;
    sku?: string;
}

export interface InvoiceMetadata {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
    orderNumber?: string;
    subscriptionNumber?: string;
    paymentMethod?: string;
    transactionId?: string;
}

export interface CompanyInfo {
    name: string;
    logo?: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
    website?: string;
    taxId?: string;
}

export interface InvoiceData {
    metadata: InvoiceMetadata;
    company: CompanyInfo;
    billTo: InvoiceAddress;
    shipTo?: InvoiceAddress;
    lineItems: InvoiceLineItem[];
    subtotal: number;
    tax: number;
    taxLabel?: string;
    shipping: number;
    shippingMethod?: string;
    discount: number;
    discountLabel?: string;
    total: number;
    currency: string;
    currencySymbol: string;
    notes?: string;
    terms?: string;
}

export type InvoiceType = 'order' | 'subscription';
