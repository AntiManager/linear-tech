'use client';

import { useState } from 'react';
import Link from 'next/link';
import MegaMenu from './MegaMenu';
import SearchBar from '../search/SearchBar';
import { RFQBasketBadge } from '../rfq/RFQBasket';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
          Линейные системы
        </Link>

        <nav className="ml-8 hidden items-center gap-6 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              className="text-sm font-medium transition-opacity hover:opacity-80"
              onClick={() => setMegaOpen(!megaOpen)}
            >
              Каталог
            </button>
            <MegaMenu isOpen={megaOpen} onClose={() => setMegaOpen(false)} />
          </div>
          <Link href="/about" className="text-sm font-medium transition-opacity hover:opacity-80">
            О компании
          </Link>
          <Link href="/contacts" className="text-sm font-medium transition-opacity hover:opacity-80">
            Контакты
          </Link>
        </nav>

        <div className="hidden flex-1 md:flex md:justify-center">
          <SearchBar />
        </div>

        <a
          href="tel:+73433821172"
          className="hidden shrink-0 text-sm font-medium transition-opacity hover:opacity-80 md:block"
        >
          +7 (343) 382-11-72
        </a>

        <div className="hidden md:flex items-center">
          <RFQBasketBadge />
        </div>

        <button
          className="ml-auto flex items-center md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-primary px-4 pb-4 md:hidden">
          <div className="mb-3 pt-3">
            <SearchBar />
          </div>
          <nav className="flex flex-col gap-3">
            <div>
              <button
                className="w-full text-left text-sm font-medium"
                onClick={() => setMegaOpen(!megaOpen)}
              >
                Каталог
              </button>
              {megaOpen && (
                <div className="mt-2 ml-2 space-y-2">
                  <Link href="/catalog/profilnie-napravlyajushie" className="block text-sm text-white/70" onClick={() => setMenuOpen(false)}>Направляющие HIWIN</Link>
                  <Link href="/catalog/shariko-vintovye-peredachi-shvp" className="block text-sm text-white/70" onClick={() => setMenuOpen(false)}>ШВП HIWIN</Link>
                  <Link href="/catalog/actuators-hiwin" className="block text-sm text-white/70" onClick={() => setMenuOpen(false)}>Актуаторы HIWIN</Link>
                  <Link href="/catalog" className="block text-sm text-accent" onClick={() => setMenuOpen(false)}>Весь каталог</Link>
                </div>
              )}
            </div>
            <Link href="/about" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
              О компании
            </Link>
            <Link href="/contacts" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Контакты
            </Link>
            <a href="tel:+73433821172" className="text-sm font-medium">
              +7 (343) 382-11-72
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
