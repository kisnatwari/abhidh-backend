import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
    const WHATSAPP_NUMBER = "9779801110981"; // Format: 1234567890 (without + or spaces)
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}`;

    return (
        <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed right-6 bottom-8 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Contact us on WhatsApp"
        >
            <MessageCircle className="h-7 w-7 text-white" />
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#25D366] text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Chat with us
            </span>
        </a>
    );
};

export default WhatsAppButton;

