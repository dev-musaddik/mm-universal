import i18n from 'i18next';

export const exchangeRate = 120; // 1 USDT = 120 BDT

export const getCurrencyInfo = () => {
    const currentLang = i18n.language || localStorage.getItem('i18nextLng') || 'en';
    const isBn = currentLang.startsWith('bn');
    return {
        code: isBn ? 'BDT' : 'USDT',
        symbol: isBn ? '৳' : 'USDT',
        rate: isBn ? exchangeRate : 1
    };
};

export const formatPrice = (priceInUsdt) => {
    const { symbol, rate } = getCurrencyInfo();
    const converted = Math.round(priceInUsdt * rate);
    if (symbol === '৳') {
        return `৳${converted.toLocaleString('en-IN')}`;
    }
    return `${converted.toLocaleString('en-US')} USDT`;
};

export const convertPrice = (priceInUsdt) => {
    const { rate } = getCurrencyInfo();
    return Math.round(priceInUsdt * rate);
};

export const formatAdminPrice = (amount) => {
    if (amount >= 3000) {
        return `৳${amount.toLocaleString('en-IN')}`;
    }
    return `${amount.toLocaleString('en-US')} USDT`;
};
