import { describe, test, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  describe('Basic functionality', () => {
    test('merges single className string', () => {
      expect(cn('px-4')).toBe('px-4');
    });

    test('merges multiple className strings', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
    });

    test('merges array of classNames', () => {
      expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2');
    });

    test('handles empty string', () => {
      expect(cn('')).toBe('');
    });

    test('handles undefined values', () => {
      expect(cn('px-4', undefined, 'py-2')).toBe('px-4 py-2');
    });

    test('handles null values', () => {
      expect(cn('px-4', null, 'py-2')).toBe('px-4 py-2');
    });

    test('handles false values', () => {
      expect(cn('px-4', false, 'py-2')).toBe('px-4 py-2');
    });

    test('handles zero as falsy', () => {
      expect(cn('px-4', 0, 'py-2')).toBe('px-4 py-2');
    });
  });

  describe('Conditional classes', () => {
    test('includes class when condition is true', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active')).toBe('base active');
    });

    test('excludes class when condition is false', () => {
      const isActive = false;
      expect(cn('base', isActive && 'active')).toBe('base');
    });

    test('handles object with boolean values', () => {
      expect(cn({ 'px-4': true, 'py-2': false, 'text-sm': true })).toBe('px-4 text-sm');
    });

    test('handles mixed conditionals', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
    });
  });

  describe('Tailwind class merging', () => {
    test('merges conflicting padding classes (keeps last)', () => {
      // twMerge should keep the last conflicting class
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    test('merges conflicting background classes (keeps last)', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    test('merges conflicting text color classes (keeps last)', () => {
      expect(cn('text-gray-900', 'text-white')).toBe('text-white');
    });

    test('keeps non-conflicting classes', () => {
      expect(cn('px-4', 'py-2', 'bg-blue-500')).toContain('px-4');
      expect(cn('px-4', 'py-2', 'bg-blue-500')).toContain('py-2');
      expect(cn('px-4', 'py-2', 'bg-blue-500')).toContain('bg-blue-500');
    });

    test('merges responsive classes correctly', () => {
      const result = cn('px-2', 'md:px-4');
      expect(result).toContain('px-2');
      expect(result).toContain('md:px-4');
    });

    test('handles hover and state variants', () => {
      const result = cn('bg-blue-500', 'hover:bg-blue-600');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('hover:bg-blue-600');
    });
  });

  describe('Complex scenarios', () => {
    test('handles mixed arrays and strings', () => {
      expect(cn('px-4', ['py-2', 'text-sm'], 'bg-white')).toBe('px-4 py-2 text-sm bg-white');
    });

    test('handles nested arrays', () => {
      expect(cn(['px-4', ['py-2', 'text-sm']])).toBe('px-4 py-2 text-sm');
    });

    test('handles objects with conditional classes', () => {
      const result = cn({
        'px-4': true,
        'py-2': true,
        'bg-red-500': false,
        'bg-blue-500': true,
      });
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).not.toContain('bg-red-500');
      expect(result).toContain('bg-blue-500');
    });

    test('handles combination of all input types', () => {
      const isActive = true;
      const result = cn(
        'base',
        ['px-4', 'py-2'],
        {
          'bg-blue-500': isActive,
          'bg-gray-500': !isActive,
        },
        isActive && 'active',
        'text-white'
      );
      expect(result).toContain('base');
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('active');
      expect(result).toContain('text-white');
      expect(result).not.toContain('bg-gray-500');
    });

    test('deduplicates identical classes', () => {
      // Should not have duplicates
      const result = cn('px-4', 'px-4', 'py-2');
      const classes = result.split(' ');
      const uniqueClasses = [...new Set(classes)];
      expect(classes.length).toBe(uniqueClasses.length);
    });

    test('handles empty arrays', () => {
      expect(cn([], 'px-4', [])).toBe('px-4');
    });

    test('handles all falsy values', () => {
      expect(cn(false, null, undefined, 0, '')).toBe('');
    });
  });

  describe('Real-world usage patterns', () => {
    test('button variant pattern', () => {
      const variant = 'primary';
      const size = 'md';
      const result = cn(
        'rounded-lg font-medium transition-colors',
        {
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        }
      );
      expect(result).toContain('rounded-lg');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('px-4');
      expect(result).not.toContain('bg-gray-200');
      expect(result).not.toContain('px-3');
    });

    test('card with conditional state', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn(
        'p-4 rounded-lg border',
        isActive && 'border-blue-500 bg-blue-50',
        !isActive && 'border-gray-300',
        isDisabled && 'opacity-50 cursor-not-allowed'
      );
      expect(result).toContain('p-4');
      expect(result).toContain('border-blue-500');
      expect(result).not.toContain('border-gray-300');
      expect(result).not.toContain('opacity-50');
    });

    test('responsive design pattern', () => {
      const result = cn('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-4');
      expect(result).toContain('grid');
      expect(result).toContain('grid-cols-1');
      expect(result).toContain('md:grid-cols-2');
      expect(result).toContain('lg:grid-cols-3');
      expect(result).toContain('gap-4');
    });

    test('dark mode pattern', () => {
      const darkMode = true;
      const result = cn(
        'p-4',
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
        'border',
        darkMode ? 'border-gray-700' : 'border-gray-200'
      );
      expect(result).toContain('bg-gray-900');
      expect(result).toContain('text-white');
      expect(result).toContain('border-gray-700');
      expect(result).not.toContain('bg-white');
    });
  });

  describe('Edge cases', () => {
    test('handles very long class lists', () => {
      const longClassList = Array(50)
        .fill('')
        .map((_, i) => `class-${i}`)
        .join(' ');
      expect(cn(longClassList)).toContain('class-0');
      expect(cn(longClassList)).toContain('class-49');
    });

    test('handles special characters in class names', () => {
      expect(cn('w-1/2', 'h-1/3')).toContain('w-1/2');
      expect(cn('w-1/2', 'h-1/3')).toContain('h-1/3');
    });

    test('handles arbitrary Tailwind values', () => {
      expect(cn('w-[100px]', 'h-[200px]')).toContain('w-[100px]');
      expect(cn('w-[100px]', 'h-[200px]')).toContain('h-[200px]');
    });

    test('handles important modifier', () => {
      expect(cn('!bg-blue-500')).toBe('!bg-blue-500');
    });

    test('handles negative values', () => {
      expect(cn('-mt-4', '-ml-2')).toContain('-mt-4');
      expect(cn('-mt-4', '-ml-2')).toContain('-ml-2');
    });
  });
});
