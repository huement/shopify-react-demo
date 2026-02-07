"use client";

import { Icon } from "./ui/material-icon";
import { useCart } from "./cart-context";

type HeaderProps = {
  shopName?: string;
  className?: string;
  onMenuToggle?: () => void;
  onAccountOpen?: () => void;
  onSearchOpen?: () => void;
  onCartOpen?: () => void;
  isMenuOpen?: boolean;
};

export function Header({
  shopName = "BRYT",
  className = "",
  onMenuToggle,
  onAccountOpen,
  onSearchOpen,
  onCartOpen,
  isMenuOpen = false,
}: HeaderProps) {
  const { itemCount } = useCart();

  return (
    <header
      className={`flex items-center justify-between py-7 px-5 absolute w-full z-10 text-white group transition duration-500 ease-in-out hover:bg-white hover:text-black ${className}`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex flex-col justify-center items-center gap-1.5 w-11 h-11 min-w-[44px] min-h-[44px] -m-1 p-1 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black group-hover:focus-visible:ring-black touch-manipulation"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <span className="w-6 h-0.5 bg-current transition duration-500 ease-in-out" />
          <span className="w-6 h-0.5 bg-current transition duration-500 ease-in-out" />
          <span className="w-6 h-0.5 bg-current transition duration-500 ease-in-out" />
        </button>
        <div className="font-heading text-3xl tracking-widest font-bold">
          {shopName}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button
          type="button"
          onClick={onAccountOpen}
          className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] p-0 appearance-none text-current hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded hidden md:flex touch-manipulation"
          aria-label="Account"
        >
          <Icon name="person" className="text-2xl block leading-none" />
        </button>
        <button
          type="button"
          onClick={onSearchOpen}
          className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] p-0 appearance-none text-current hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded hidden md:flex touch-manipulation"
          aria-label="Search"
        >
          <Icon name="search" className="text-2xl block leading-none" />
        </button>
        <button
          type="button"
          onClick={onCartOpen}
          className="relative flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] p-0 appearance-none text-current hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded touch-manipulation"
          aria-label={`Cart, ${itemCount} items`}
        >
          <Icon name="shopping_bag" className="text-2xl block leading-none" />
          {itemCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] flex items-center justify-center rounded-full bg-indigo-600 group-hover:bg-cyan-500 text-white group-hover:text-white text-xs font-bold px-1"
              aria-hidden
            >
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
