'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect, useMemo } from 'react';
import CheckoutPopup from './CheckoutPopup';
import { transformTestData } from '@/lib/helper';  // Import transformer here

const Button = ({
  children,
  size = 'md',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  icon,
  ariaPressed,
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white',
    secondary: 'bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50',
    success: 'bg-green-600 hover:bg-green-700 text-white',
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
      aria-pressed={ariaPressed}
    >
      {icon}
      {children}
    </button>
  );
};

const CartButtons = ({
  item,
  size = 'sm',
  className = '',
  addText = 'Add',
  inCartText = 'View Cart',
  loadingText = 'Adding...',
}) => {
  const router = useRouter();
  const { addToCart, isItemInCart, setQuickCheckout } = useCart();
  const [adding, setAdding] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  let timerId = null;

  // Memoize transformed item to avoid unnecessary recalculations
  const transformedItem = useMemo(() => transformTestData(item), [item]);

  useEffect(() => {
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(transformedItem);

      setShowPopup(true);
      timerId = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
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

  const handleCheckout = () => {
    setShowPopup(false);
    setQuickCheckout(true);
    router.push('/delivery-address');
  };

  const handleClosePopup = () => setShowPopup(false);

  // Use transformedItem's id for cart check
  const inCart = isItemInCart(transformedItem?.id || transformedItem?._id);

  const cartIcon = (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
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
          ariaPressed="true"
        >
          {inCartText}
        </Button>
      ) : (
        <Button
          size={size}
          variant="primary"
          className={`self-center flex-shrink-0 ${className}`}
          onClick={(e) => {
            e.preventDefault(); 
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={adding}
          ariaPressed="false"
        >
          {adding ? loadingText : addText}
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
