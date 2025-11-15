import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const stripHtml = (value?: string | null) => {
    if (!value) {
        return '';
    }

    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

export const formatCategoryLabel = (value?: string | null) => {
    if (!value) {
        return 'General';
    }

    return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};
