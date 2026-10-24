import test from 'node:test';
import assert from 'node:assert/strict';
import { getColorSizeStock, getTotalStock, isComingSoon } from './product';
import { getOrderTimestamp, formatOrderDateTime } from './date';
import { normalizeGovName } from '../store/useStore';
import { Product } from '../types';

test('normalizeGovName strips brackets and extra spaces', () => {
  assert.equal(normalizeGovName('القليوبية (بنها)'), 'القليوبية');
  assert.equal(normalizeGovName('القاهرة'), 'القاهرة');
  assert.equal(normalizeGovName('  الجيزة  '), 'الجيزة');
  assert.equal(normalizeGovName(''), '');
});

test('getColorSizeStock returns stock correctly with color and fallback', () => {
  const dummyProduct: Product = {
    id: 'prod-1',
    name: 'Yozora Oversized',
    subtitle: 'Signature Hoodie',
    category: 'oversized',
    price: 890,
    description: 'Test description',
    fit: 'Oversized',
    sizesStock: { M: 5, L: 10, XL: 8, '2XL': 2 },
    colors: [
      {
        name: 'أسود',
        hex: '#000000',
        sizesStock: { M: 2, L: 4, XL: 3, '2XL': 1 }
      },
      {
        name: 'رمادي',
        hex: '#888888',
        sizesStock: { M: 3, L: 6, XL: 5, '2XL': 1 }
      }
    ],
    images: ['https://example.com/img1.jpg'],
    isFeatured: true,
    rating: 5,
    reviewsCount: 10
  };

  // Color specific stock
  assert.equal(getColorSizeStock(dummyProduct, 'أسود', 'M'), 2);
  assert.equal(getColorSizeStock(dummyProduct, 'أسود', 'L'), 4);
  assert.equal(getColorSizeStock(dummyProduct, 'رمادي', 'L'), 6);

  // Fallback when color has no specific size defined
  assert.equal(getColorSizeStock(dummyProduct, 'أبيض', 'M'), 5);

  // Fallback when colorName is undefined
  assert.equal(getColorSizeStock(dummyProduct, undefined, 'XL'), 8);

  // Undefined product
  assert.equal(getColorSizeStock(undefined, 'أسود', 'M'), 0);
});

test('getTotalStock calculates sum across colors or general sizesStock', () => {
  const productWithColors: Product = {
    id: 'prod-1',
    name: 'Yozora Oversized',
    subtitle: 'Signature Hoodie',
    category: 'oversized',
    price: 890,
    description: 'Test',
    fit: 'Oversized',
    sizesStock: { M: 0, L: 0, XL: 0, '2XL': 0 },
    colors: [
      { name: 'أسود', hex: '#000', sizesStock: { M: 2, L: 3, XL: 0, '2XL': 0 } },
      { name: 'أبيض', hex: '#fff', sizesStock: { M: 1, L: 4, XL: 0, '2XL': 0 } }
    ],
    images: [],
    isFeatured: true,
    rating: 5,
    reviewsCount: 1
  };
  assert.equal(getTotalStock(productWithColors), 10);

  const productWithoutColors: Product = {
    id: 'prod-2',
    name: 'Beyond Basic',
    subtitle: 'Basic Hoodie',
    category: 'basic',
    price: 750,
    description: 'Test',
    fit: 'Regular',
    sizesStock: { M: 5, L: 5, XL: 5, '2XL': 5 },
    colors: [],
    images: [],
    isFeatured: false,
    rating: 5,
    reviewsCount: 1
  };
  assert.equal(getTotalStock(productWithoutColors), 20);
});

test('isComingSoon returns true if comingSoon flag is true or total stock <= 0', () => {
  const comingSoonProd: Product = {
    id: 'p-1',
    name: 'Coming Soon Hoodie',
    subtitle: 'Soon',
    category: 'oversized',
    price: 900,
    description: '',
    fit: '',
    comingSoon: true,
    sizesStock: { M: 10, L: 10, XL: 10, '2XL': 10 },
    colors: [],
    images: [],
    isFeatured: false,
    rating: 5,
    reviewsCount: 0
  };
  assert.equal(isComingSoon(comingSoonProd), true);

  const outOfStockProd: Product = {
    ...comingSoonProd,
    comingSoon: false,
    sizesStock: { M: 0, L: 0, XL: 0, '2XL': 0 }
  };
  assert.equal(isComingSoon(outOfStockProd), true);

  const inStockProd: Product = {
    ...comingSoonProd,
    comingSoon: false,
    sizesStock: { M: 1, L: 0, XL: 0, '2XL': 0 }
  };
  assert.equal(isComingSoon(inStockProd), false);
});

test('getOrderTimestamp parses iso string or ms timestamp safely', () => {
  assert.equal(getOrderTimestamp(undefined, 1700000000000), 1700000000000);
  const iso = '2026-10-24T12:00:00.000Z';
  assert.equal(getOrderTimestamp(iso), new Date(iso).getTime());
  assert.equal(getOrderTimestamp(undefined, undefined), 0);
  assert.equal(getOrderTimestamp('invalid-date-string'), 0);
});

test('formatOrderDateTime formats Arabic relative and full datetime', () => {
  const now = Date.now();
  const resNow = formatOrderDateTime(undefined, now);
  assert.equal(resNow.relative, 'الآن');
  assert.ok(resNow.dateOnly.includes('2026') || resNow.dateOnly.includes('202'));

  const oneHourAgo = now - 65 * 60 * 1000;
  const resPast = formatOrderDateTime(undefined, oneHourAgo);
  assert.ok(resPast.timeOnly.length > 0);
});
