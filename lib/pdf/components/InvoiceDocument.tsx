import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { InvoiceData } from '../types/invoice.types';
import { formatCurrency } from '../utils/invoiceFormatter';

// Professional color scheme
const colors = {
    primary: '#6C7A5F',
    secondary: '#64748b',
    dark: '#1e293b',
    light: '#f8fafc',
    border: '#e2e8f0',
    text: '#334155',
};

// Styles for the PDF document
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: colors.text,
    },
    // Header Section
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: `2px solid ${colors.primary}`,
    },
    logo: {
        width: 120,
        height: 40,
        objectFit: 'contain',
    },
    companyInfo: {
        textAlign: 'right',
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
    },
    companyDetails: {
        fontSize: 9,
        color: colors.secondary,
        lineHeight: 1.4,
    },
    // Invoice Title
    invoiceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.dark,
        marginBottom: 20,
    },
    // Metadata Section
    metadataSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    metadataBox: {
        width: '48%',
    },
    metadataLabel: {
        fontSize: 8,
        color: colors.secondary,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    metadataValue: {
        fontSize: 10,
        color: colors.dark,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    // Address Section
    addressSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    addressBox: {
        width: '48%',
        padding: 15,
        backgroundColor: colors.light,
        borderRadius: 4,
    },
    addressTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: 9,
        lineHeight: 1.5,
        color: colors.text,
    },
    // Table Section
    table: {
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        color: 'white',
        padding: 10,
        fontWeight: 'bold',
        fontSize: 9,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: `1px solid ${colors.border}`,
        padding: 10,
        fontSize: 9,
    },
    tableRowAlt: {
        backgroundColor: colors.light,
    },
    // Table Columns
    colItem: {
        width: '40%',
    },
    colQty: {
        width: '15%',
        textAlign: 'center',
    },
    colPrice: {
        width: '15%',
        textAlign: 'right',
    },
    colTax: {
        width: '15%',
        textAlign: 'right',
    },
    colTotal: {
        width: '15%',
        textAlign: 'right',
    },
    // Summary Section
    summarySection: {
        marginTop: 20,
        marginLeft: 'auto',
        width: '50%',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        fontSize: 10,
    },
    summaryLabel: {
        color: colors.secondary,
    },
    summaryValue: {
        fontWeight: 'bold',
        color: colors.dark,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: colors.primary,
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
    },
    // Notes Section
    notesSection: {
        marginTop: 30,
        padding: 15,
        backgroundColor: colors.light,
        borderLeft: `4px solid ${colors.primary}`,
    },
    notesTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
    },
    notesText: {
        fontSize: 9,
        lineHeight: 1.5,
        color: colors.text,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: colors.secondary,
        borderTop: `1px solid ${colors.border}`,
        paddingTop: 10,
    },
});

interface InvoiceDocumentProps {
    data: InvoiceData;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ data }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.companyName}>{data.company.name}</Text>
                        <Text style={styles.companyDetails}>{data.company.address}</Text>
                        <Text style={styles.companyDetails}>
                            {data.company.city}, {data.company.state} {data.company.postcode}
                        </Text>
                        <Text style={styles.companyDetails}>{data.company.country}</Text>
                    </View>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyDetails}>Email: {data.company.email}</Text>
                        <Text style={styles.companyDetails}>Phone: {data.company.phone}</Text>
                        {data.company.website && (
                            <Text style={styles.companyDetails}>Web: {data.company.website}</Text>
                        )}
                        {data.company.taxId && (
                            <Text style={styles.companyDetails}>{data.company.taxId}</Text>
                        )}
                    </View>
                </View>

                {/* Invoice Title */}
                <Text style={styles.invoiceTitle}>RECEIPT</Text>

                {/* Metadata */}
                <View style={styles.metadataSection}>
                    <View style={styles.metadataBox}>
                        <Text style={styles.metadataLabel}>Receipt Number</Text>
                        <Text style={styles.metadataValue}>{data.metadata.invoiceNumber}</Text>

                        {data.metadata.orderNumber && (
                            <>
                                <Text style={styles.metadataLabel}>Order Number</Text>
                                <Text style={styles.metadataValue}>{data.metadata.orderNumber}</Text>
                            </>
                        )}

                        {data.metadata.subscriptionNumber && (
                            <>
                                <Text style={styles.metadataLabel}>Subscription Number</Text>
                                <Text style={styles.metadataValue}>{data.metadata.subscriptionNumber}</Text>
                            </>
                        )}
                    </View>

                    <View style={styles.metadataBox}>
                        <Text style={styles.metadataLabel}>Receipt Date</Text>
                        <Text style={styles.metadataValue}>{data.metadata.invoiceDate}</Text>

                        {data.metadata.paymentMethod && (
                            <>
                                <Text style={styles.metadataLabel}>Payment Method</Text>
                                <Text style={styles.metadataValue}>{data.metadata.paymentMethod}</Text>
                            </>
                        )}

                        {data.metadata.transactionId && (
                            <>
                                <Text style={styles.metadataLabel}>Transaction ID</Text>
                                <Text style={styles.metadataValue}>{data.metadata.transactionId}</Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Addresses */}
                <View style={styles.addressSection}>
                    <View style={styles.addressBox}>
                        <Text style={styles.addressTitle}>Bill To</Text>
                        <Text style={styles.addressText}>
                            {data.billTo.first_name} {data.billTo.last_name}
                        </Text>
                        {data.billTo.company && (
                            <Text style={styles.addressText}>{data.billTo.company}</Text>
                        )}
                        <Text style={styles.addressText}>{data.billTo.address_1}</Text>
                        {data.billTo.address_2 && (
                            <Text style={styles.addressText}>{data.billTo.address_2}</Text>
                        )}
                        <Text style={styles.addressText}>
                            {data.billTo.city}, {data.billTo.state} {data.billTo.postcode}
                        </Text>
                        <Text style={styles.addressText}>{data.billTo.country}</Text>
                        {data.billTo.email && (
                            <Text style={styles.addressText}>Email: {data.billTo.email}</Text>
                        )}
                        {data.billTo.phone && (
                            <Text style={styles.addressText}>Phone: {data.billTo.phone}</Text>
                        )}
                    </View>

                    {data.shipTo && (
                        <View style={styles.addressBox}>
                            <Text style={styles.addressTitle}>Ship To</Text>
                            <Text style={styles.addressText}>
                                {data.shipTo.first_name} {data.shipTo.last_name}
                            </Text>
                            {data.shipTo.company && (
                                <Text style={styles.addressText}>{data.shipTo.company}</Text>
                            )}
                            <Text style={styles.addressText}>{data.shipTo.address_1}</Text>
                            {data.shipTo.address_2 && (
                                <Text style={styles.addressText}>{data.shipTo.address_2}</Text>
                            )}
                            <Text style={styles.addressText}>
                                {data.shipTo.city}, {data.shipTo.state} {data.shipTo.postcode}
                            </Text>
                            <Text style={styles.addressText}>{data.shipTo.country}</Text>
                        </View>
                    )}
                </View>

                {/* Line Items Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.colItem}>Item</Text>
                        <Text style={styles.colQty}>Qty</Text>
                        <Text style={styles.colPrice}>Price</Text>
                        <Text style={styles.colTax}>Tax</Text>
                        <Text style={styles.colTotal}>Total</Text>
                    </View>

                    {/* Table Rows */}
                    {data.lineItems.map((item, index) => (
                        <View
                            key={item.id}
                            style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                        >
                            <View style={styles.colItem}>
                                <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                                {item.sku && (
                                    <Text style={{ fontSize: 8, color: colors.secondary }}>
                                        SKU: {item.sku}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colPrice}>
                                {formatCurrency(item.price, data.currencySymbol)}
                            </Text>
                            <Text style={styles.colTax}>
                                {formatCurrency(item.tax, data.currencySymbol)}
                            </Text>
                            <Text style={styles.colTotal}>
                                {formatCurrency(item.total, data.currencySymbol)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(data.subtotal, data.currencySymbol)}
                        </Text>
                    </View>

                    {data.discount > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>
                                Discount {data.discountLabel && `(${data.discountLabel})`}
                            </Text>
                            <Text style={styles.summaryValue}>
                                -{formatCurrency(data.discount, data.currencySymbol)}
                            </Text>
                        </View>
                    )}

                    {data.shipping > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>
                                Shipping {data.shippingMethod && `(${data.shippingMethod})`}
                            </Text>
                            <Text style={styles.summaryValue}>
                                {formatCurrency(data.shipping, data.currencySymbol)}
                            </Text>
                        </View>
                    )}

                    {data.tax > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>
                                {data.taxLabel || 'Tax'}
                            </Text>
                            <Text style={styles.summaryValue}>
                                {formatCurrency(data.tax, data.currencySymbol)}
                            </Text>
                        </View>
                    )}

                    <View style={styles.totalRow}>
                        <Text>TOTAL</Text>
                        <Text>{formatCurrency(data.total, data.currencySymbol)}</Text>
                    </View>
                </View>

                {/* Notes */}
                {(data.notes || data.terms) && (
                    <View style={styles.notesSection}>
                        {data.notes && (
                            <>
                                <Text style={styles.notesTitle}>Notes</Text>
                                <Text style={styles.notesText}>{data.notes}</Text>
                            </>
                        )}
                        {data.terms && (
                            <>
                                <Text style={[styles.notesTitle, { marginTop: data.notes ? 10 : 0 }]}>
                                    Terms & Conditions
                                </Text>
                                <Text style={styles.notesText}>{data.terms}</Text>
                            </>
                        )}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Thank you for your business!</Text>
                    <Text>
                        For any questions, please contact us at {data.company.email} or {data.company.phone}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
