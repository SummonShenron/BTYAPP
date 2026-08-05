// pages/Merch.tsx
import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
  sizes?: string[];
  inStock: boolean;
  venmoUsername: string; // Her Venmo handle (e.g., "Jane-Doe-BTY")
}

const merchData: Product[] = [
  {
    id: 'bty-hoodie-01',
    name: 'BTY Oversized Heavyweight Hoodie',
    category: 'Apparel',
    price: '$65.00',
    description: '380GSM ultra-soft fleece hoodie featuring custom high-density silicone BTY logo print on chest.',
    image: logoImg,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    inStock: true,
    venmoUsername: 'YourVenmoHandle', // Replace with her actual Venmo username
  },
  {
    id: 'bty-tee-01',
    name: 'Better Than Yesterday Pump Cover',
    category: 'Apparel',
    price: '$38.00',
    description: '100% combed ring-spun cotton drop-shoulder tee engineered for freedom of movement during heavy lifts.',
    image: logoImg,
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    venmoUsername: 'YourVenmoHandle',
  },
  {
    id: 'bty-shaker-01',
    name: 'Matte Stealth Shaker Bottle (28oz)',
    category: 'Accessories',
    price: '$22.00',
    description: 'BPA-free stainless steel insulated shaker bottle. Keeps drinks sub-zero for up to 12 hours.',
    image: logoImg,
    inStock: true,
    venmoUsername: 'YourVenmoHandle',
  },
  {
    id: 'bty-straps-01',
    name: 'Padded Neoprene Lifting Straps',
    category: 'Gear',
    price: '$18.00',
    description: 'Heavy-duty cotton webbing with 5mm neoprene padding to eliminate wrist strain on heavy pulls.',
    image: logoImg,
    sizes: ['One Size'],
    inStock: true,
    venmoUsername: 'YourVenmoHandle',
  },
];

export default function Merch() {
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleBuyClick = (product: Product) => {
    const size = selectedSizes[product.id] || (product.sizes ? product.sizes[0] : 'One Size');
    
    // Construct a clean Venmo URL with a pre-filled note containing the item and size
    const note = encodeURIComponent(`${product.name} (Size: ${size})`);
    const amount = product.price.replace('$', '');
    
    // Venmo web URL format
    const venmoUrl = `https://venmo.com/${product.venmoUsername}?txn=pay&amount=${amount}&note=${note}`;
    
    window.open(venmoUrl, '_blank');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', fontFamily: 'inherit' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ 
          display: 'inline-block', 
          color: '#38C2DE', 
          fontSize: '0.75rem', 
          fontWeight: 900, 
          letterSpacing: '0.2em', 
          textTransform: 'uppercase', 
          padding: '0.4rem 1rem', 
          borderRadius: '9999px', 
          background: 'rgba(56, 194, 222, 0.1)', 
          border: '1px solid rgba(56, 194, 222, 0.3)',
          marginBottom: '1rem'
        }}>
          Official Equipment & Apparel
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 1rem 0', letterSpacing: '-0.02em' }}>
          BTY ATHLETIC GEAR
        </h1>
        <p style={{ color: '#A0A5AA', fontSize: '1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Wear the mindset. Premium training apparel and biomechanically tested gear designed to endure your toughest sessions.
        </p>
      </div>

      {/* Product Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '2rem' 
      }}>
        {merchData.map((item) => {
          const currentSize = selectedSizes[item.id] || (item.sizes ? item.sizes[0] : '');
          return (
            <div 
              key={item.id} 
              style={{ 
                background: '#16171b', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
            >
              {/* Image Container */}
              <div style={{ 
                height: '220px', 
                background: 'radial-gradient(circle at center, rgba(56, 194, 222, 0.12) 0%, #121316 75%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '1.5rem'
              }}>
                <span style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  left: '12px', 
                  background: 'rgba(0, 0, 0, 0.75)', 
                  backdropFilter: 'blur(8px)', 
                  color: '#38C2DE', 
                  border: '1px solid rgba(56, 194, 222, 0.3)', 
                  fontSize: '0.65rem', 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  padding: '0.3rem 0.7rem', 
                  borderRadius: '20px',
                  zIndex: 2
                }}>
                  {item.category}
                </span>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ 
                    maxHeight: '130px', 
                    maxWidth: '85%', 
                    objectFit: 'contain', 
                    filter: 'drop-shadow(0 0 20px rgba(56, 194, 222, 0.4))' 
                  }}
                />
              </div>

              {/* Content Section */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.4 }}>
                      {item.name}
                    </h3>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#38C2DE', whiteSpace: 'nowrap' }}>
                      {item.price}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#A0A5AA', lineHeight: 1.5, margin: 0 }}>
                    {item.description}
                  </p>
                </div>

                {/* Size Selector */}
                {item.sizes && item.sizes[0] !== 'One Size' && (
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#A0A5AA', letterSpacing: '0.05em' }}>
                        Size
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#38C2DE', background: 'rgba(56, 194, 222, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(56, 194, 222, 0.2)' }}>
                        {currentSize}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${item.sizes.length}, 1fr)`, gap: '0.35rem' }}>
                      {item.sizes.map((s) => {
                        const isSelected = currentSize === s;
                        return (
                          <button
                            key={s}
                            onClick={() => handleSizeSelect(item.id, s)}
                            style={{
                              background: isSelected ? '#38C2DE' : '#121316',
                              color: isSelected ? '#000000' : '#A0A5AA',
                              border: isSelected ? '1px solid #38C2DE' : '1px solid rgba(255, 255, 255, 0.1)',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              padding: '0.5rem 0',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? '0 0 12px rgba(56, 194, 222, 0.5)' : 'none'
                            }}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={() => handleBuyClick(item)}
                  style={{
                    width: '100%',
                    background: '#38C2DE',
                    color: '#000000',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 0 20px rgba(56, 194, 222, 0.3)',
                    marginTop: 'auto'
                  }}
                >
                  Pay via Venmo
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}