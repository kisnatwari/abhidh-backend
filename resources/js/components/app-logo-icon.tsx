import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            src="/logo.png" 
            alt="Abhidh Logo" 
            {...props}
            className={props.className || 'h-full w-auto object-contain'}
        />
    );
}
