import { InvoiceData, InvoiceLineItem, InvoiceAddress, InvoiceType } from '../types/invoice.types';

/**
 * Format currency value with symbol
 */
export function formatCurrency(amount: number, currencySymbol: string = 'AED'): string {
    return `${currencySymbol} ${amount.toFixed(2)}`;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Get currency symbol from currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
    const symbols: { [key: string]: string } = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'AED': 'AED',
        'SAR': 'SAR',
        'INR': '₹',
    };
    return symbols[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Format WooCommerce address to InvoiceAddress
 */
export function formatAddress(wcAddress: any): InvoiceAddress {
    return {
        first_name: wcAddress.first_name || '',
        last_name: wcAddress.last_name || '',
        company: wcAddress.company || '',
        address_1: wcAddress.address_1 || '',
        address_2: wcAddress.address_2 || '',
        city: wcAddress.city || '',
        state: wcAddress.state || '',
        postcode: wcAddress.postcode || '',
        country: wcAddress.country || '',
        email: wcAddress.email || '',
        phone: wcAddress.phone || '',
    };
}

/**
 * Format WooCommerce line items to InvoiceLineItem
 */
export function formatLineItems(wcLineItems: any[]): InvoiceLineItem[] {
    return wcLineItems.map((item, index) => ({
        id: item.id || index,
        name: item.name || 'Unknown Item',
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        subtotal: parseFloat(item.subtotal) || 0,
        total: parseFloat(item.total) || 0,
        tax: parseFloat(item.total_tax) || 0,
        sku: item.sku || '',
    }));
}

/**
 * Convert WooCommerce order to InvoiceData
 */
export function formatOrderToInvoice(
    order: any,
    paymentDetails?: any
): InvoiceData {
    const currencySymbol = getCurrencySymbol(order.currency || 'AED');

    return {
        metadata: {
            invoiceNumber: `INV-${order.id}`,
            invoiceDate: formatDate(order.date_created || new Date().toISOString()),
            orderNumber: order.number || order.id,
            paymentMethod: order.payment_method_title || 'Stripe',
            transactionId: paymentDetails?.id || order.transaction_id || '',
        },
        company: {
            name: 'White Mantis',
            logo: '/logo.png',
            address: 'Your Company Address',
            city: 'Dubai',
            state: 'Dubai',
            postcode: '00000',
            country: 'UAE',
            email: 'info@whitemantis.com',
            phone: '+971-XXX-XXXX',
            website: 'www.whitemantis.com',
            taxId: 'TRN: XXXXXXXXX',
        },
        billTo: formatAddress(order.billing),
        shipTo: order.shipping ? formatAddress(order.shipping) : undefined,
        lineItems: formatLineItems(order.line_items || []),
        subtotal: parseFloat(order.total) - parseFloat(order.total_tax) - parseFloat(order.shipping_total),
        tax: parseFloat(order.total_tax) || 0,
        taxLabel: order.tax_lines?.[0]?.label || 'VAT',
        shipping: parseFloat(order.shipping_total) || 0,
        shippingMethod: order.shipping_lines?.[0]?.method_title || '',
        discount: parseFloat(order.discount_total) || 0,
        discountLabel: order.coupon_lines?.[0]?.code || '',
        total: parseFloat(order.total) || 0,
        currency: order.currency || 'AED',
        currencySymbol,
        notes: order.customer_note || '',
        terms: 'Thank you for your business!',
    };
}

/**
 * Convert WooCommerce subscription to InvoiceData
 */
export function formatSubscriptionToInvoice(
    subscription: any,
    stripeSubscription?: any,
    latestInvoice?: any
): InvoiceData {
    const currencySymbol = getCurrencySymbol(subscription.currency || 'AED');

    // Use latest invoice data if available from Stripe
    const invoiceDate = latestInvoice?.created
        ? new Date(latestInvoice.created * 1000).toISOString()
        : subscription.date_created;

    return {
        metadata: {
            invoiceNumber: latestInvoice?.number || `INV-SUB-${subscription.id}`,
            invoiceDate: formatDate(invoiceDate),
            subscriptionNumber: subscription.id,
            paymentMethod: subscription.payment_method_title || 'Stripe',
            transactionId: latestInvoice?.payment_intent || stripeSubscription?.latest_invoice || '',
        },
        company: {
            name: 'White Mantis',
            logo: '/logo.png',
            address: 'Your Company Address',
            city: 'Dubai',
            state: 'Dubai',
            postcode: '00000',
            country: 'UAE',
            email: 'info@whitemantis.com',
            phone: '+971-XXX-XXXX',
            website: 'www.whitemantis.com',
            taxId: 'TRN: XXXXXXXXX',
        },
        billTo: formatAddress(subscription.billing),
        shipTo: subscription.shipping ? formatAddress(subscription.shipping) : undefined,
        lineItems: formatLineItems(subscription.line_items || []),
        subtotal: parseFloat(subscription.total) - parseFloat(subscription.total_tax) - parseFloat(subscription.shipping_total || 0),
        tax: parseFloat(subscription.total_tax) || 0,
        taxLabel: subscription.tax_lines?.[0]?.label || 'VAT',
        shipping: parseFloat(subscription.shipping_total) || 0,
        shippingMethod: subscription.shipping_lines?.[0]?.method_title || '',
        discount: parseFloat(subscription.discount_total) || 0,
        discountLabel: subscription.coupon_lines?.[0]?.code || '',
        total: parseFloat(subscription.total) || 0,
        currency: subscription.currency || 'AED',
        currencySymbol,
        notes: subscription.customer_note || '',
        terms: 'This is a recurring subscription. Thank you for your business!',
    };
}
