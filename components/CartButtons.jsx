// components/CartButtons.jsx
'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import CheckoutPopup from './CheckoutPopup';

const Button = ({ 
  children, 
  size = 'md', 
  variant = 'primary',
  className = '', 
  disabled = false, 
  onClick,
  icon
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white',
    secondary: 'bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        font-semibold rounded-lg 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-orange-300
        flex items-center gap-1.5
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
};

const CartButtons = ({ 
  item,
  size = 'sm',
  className = ''
}) => {
  const router = useRouter();
  const { addToCart, isItemInCart, setQuickCheckout } = useCart();
  const [adding, setAdding] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(item);
      
      // Show popup for 5 seconds
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000); // Increased from 3 to 5 seconds

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleGoToCart = () => {
    setShowPopup(false);
    router.push('/cart');
  };

  const handleCheckout = async () => {
    setShowPopup(false);
    setQuickCheckout(true);
    router.push('/checkout');
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const inCart = isItemInCart(item.id);

  // Cart icon
  const cartIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  return (
    <>
      {inCart ? (
        <Button
          size={size}
          variant="success"
          className={`self-center flex-shrink-0 ${className}`}
          onClick={handleGoToCart}
          icon={cartIcon}
        >
          View Cart
        </Button>
      ) : (
        <Button
          size={size}
          variant="primary"
          className={`self-center flex-shrink-0 ${className}`}
          onClick={handleAddToCart}
          disabled={adding}
        >
          {adding ? "Adding..." : "Add"}
        </Button>
      )}

      {showPopup && (
        <CheckoutPopup 
          onGoToCart={handleGoToCart} 
          onCheckout={handleCheckout}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default CartButtons;
