import React, { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import '../functions/fonts.js'; // Ensure this line is included to register the font
import toCurrency from '../functions/toCurrency';


// Define custom colors
const colors = {
  primary: '#1a936f', // Green
  secondary: '#2e3440', // Black
  accent: '#81a1c1', // Blue
  white: '#ededed', // White
};

// Define font
const font = {
  family: 'Helvetica',
};

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.secondary,
    padding: 20,
    fontFamily: font.family,
  },
  section: {
    marginBottom: 10,
    color: colors.white,
  },
  header: {
    fontSize: 13,
    marginBottom: 10,
    color: colors.primary,
    fontWeight: 'bold',
    fontFamily: font.family,
    textTransform: 'uppercase',
  },
  divider: {
    borderBottom: '1pt solid ' + colors.primary,
    marginBottom: 10,
  },
  lineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  lineItemDescription: {
    width: '70%',
    paddingLeft: 4,
    color: colors.white,
  },
  lineItemPrice: {
    width: '30%',
    textAlign: 'right',
    paddingRight: 4,
    color: colors.primary,
    fontFamily:'Noto Sans',
    fontSize:'14px',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  totalLabel: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  totalValue: {
    color: colors.white,
    fontFamily:'Noto Sans',
    fontSize:'14px',
  },
});

// Component to render invoice PDF
const InvoicePDF = ({ invoice, profile }) => {
  

  const { invoiceNumber, date, clientName, company, address, email, phone, lineItems, advancePayment, discount } = invoice;



  // Recalculate total
  const subtotal = invoice.lineItems.reduce((acc, item) => {
    const price = parseFloat(item.unitPrice);
    if (!isNaN(price)) {
      return acc + price;
    } else {
      console.error(`Invalid unitPrice: ${item.unitPrice}`);
      return acc; // Skip invalid price
    }
  }, 0);
  const total = subtotal - invoice.discount + invoice.tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.section, { flexDirection: 'row' }]}>
          <View style={{ width: '50%', fontSize: 11.5, textTransform: 'uppercase' }}>
            <Text>{profile.company}</Text>
            <Text>{profile.name}</Text>
            <Text>{profile.website}</Text>
            <Text>{profile.phone}</Text>
          </View>
          <View style={{ width: '50%', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 36, color: colors.primary }}>INVOICE</Text>
          </View>
        </View>
        <View style={styles.divider}></View>

        {/* Bill To and Invoice Details */}
        <View style={[styles.section, { flexDirection: 'row' }]}>
          <View style={{ width: '50%', paddingRight: 20 }}>
            <Text style={styles.header}>Bill To</Text>
            <Text>{clientName},</Text>
            <Text>{company},</Text>
            <Text>{address}</Text>
            <Text>{email}</Text>
            <Text>{phone}</Text>
          </View>
          <View style={[{ width: '50%', alignItems: 'flex-end' }]}>
            <Text style={styles.header}>Invoice Details</Text>
            <Text>Invoice Number: {invoiceNumber}</Text>
            <Text>Date: {new Date(date).toLocaleDateString('en-IN')}</Text>
          </View>
        </View>
        <View style={styles.divider}></View>

        {/* Line Items */}
        <View style={styles.section}>
          <View style={[styles.lineItemRow, { backgroundColor: colors.secondary, textTransform: 'uppercase', fontSize: 13 }]}>
            <Text style={[styles.lineItemDescription, { color: colors.primary }]}>Description</Text>
            <Text style={styles.lineItemPrice}>Price</Text>
          </View>
          {lineItems.map((item, index) => (
            <View key={index} style={[styles.lineItemRow, { backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary }]}>
              <Text style={styles.lineItemDescription}>{item.description}</Text>
              <Text style={[styles.lineItemPrice, { color: index % 2 === 0 ? colors.white : colors.white }]}> {toCurrency(item.unitPrice)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.divider}></View>

        {/* Thank You and Total */}
        <View style={[styles.section, { flexDirection: 'row' }]}>
          <View style={{ width: '50%', paddingRight: 20 }}>
            <Text style={styles.header}>Thank You for Your Business</Text>
            <Text style={{fontSize:'12px'}}>Kindly make the payment within 3 days.</Text>
          </View>
          <View style={{ width: '50%', alignItems: 'flex-end' }}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{toCurrency(subtotal)}</Text>
            </View>
            {advancePayment >0 && <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Advance Payment:</Text>
              <Text style={styles.totalValue}>{toCurrency(advancePayment)}</Text>
            </View>}
            {discount>0 && <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>{toCurrency(discount)}</Text>
            </View>}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{toCurrency(total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Balance Due:</Text>
              <Text style={styles.totalValue}>{toCurrency(total - advancePayment)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.divider}></View>

        {/* Payment Details */}
        <View style={[styles.section,{fontSize:'13'}]}>
          <Text style={styles.header}>Payment Details</Text>
          <Text>Account Holder: ROHIT PARAKH</Text>
          <Text>Account Number: 50100366137937</Text>
          <Text>IFSC: HDFC0002461</Text>
          <Text>Branch: K B DASAN ROAD</Text>
          <Text>Account Type: SAVING</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
