import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Phone validation (basic international format)
export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number'
).optional();

// Postal code validation
export const postalCodeSchema = z.string().min(3, 'Postal code must be at least 3 characters');

// Country code (ISO 3166-1 alpha-2)
export const countryCodeSchema = z.string().length(2, 'Country code must be 2 characters');

// SKU validation
export const skuSchema = z.string().regex(
  /^[A-Z0-9-]+$/,
  'SKU must contain only uppercase letters, numbers, and hyphens'
);

// Code validation (for sites, labs, kits)
export const codeSchema = z.string().regex(
  /^[A-Z0-9-]+$/,
  'Code must contain only uppercase letters, numbers, and hyphens'
);

// Positive number validation
export const positiveNumberSchema = z.number().positive('Must be a positive number');

// Non-negative number validation
export const nonNegativeNumberSchema = z.number().nonnegative('Must be a non-negative number');

// Currency validation
export const currencySchema = z.number().nonnegative().multipleOf(0.01);

/**
 * Validate EU country code
 */
export function isEUCountry(countryCode: string): boolean {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  return euCountries.includes(countryCode.toUpperCase());
}

/**
 * Validate weight (in kg)
 */
export function validateWeight(weight: number): boolean {
  return weight > 0 && weight <= 1000; // Max 1000kg
}

/**
 * Validate dimensions (in cm)
 */
export function validateDimensions(length: number, width: number, height: number): boolean {
  return length > 0 && width > 0 && height > 0 &&
         length <= 300 && width <= 300 && height <= 300; // Max 3m per side
}
