export const hexToRgba = (hex: string | null | undefined, alpha = 1) => {
    if (!hex) {
        return `rgba(29, 78, 216, ${alpha})`;
    }

    const normalizedHex = hex.replace('#', '');
    if (![3, 6].includes(normalizedHex.length)) {
        return `rgba(29, 78, 216, ${alpha})`;
    }

    const chunkSize = normalizedHex.length === 3 ? 1 : 2;
    const expand = (value: string) => (value.length === 1 ? value.repeat(2) : value);

    const r = parseInt(expand(normalizedHex.substring(0, chunkSize)), 16);
    const g = parseInt(expand(normalizedHex.substring(chunkSize, chunkSize * 2)), 16);
    const b = parseInt(expand(normalizedHex.substring(chunkSize * 2, chunkSize * 3)), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

