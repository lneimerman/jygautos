// Datos de contacto del negocio (un solo lugar para editarlos).
export const WHATSAPP_DISPLAY = '11 3000-3349';
// Formato internacional para wa.me: 54 (Argentina) + 9 (celular) + 11 + número
export const WHATSAPP_NUMBER = '5491130003349';

export function whatsappLink(text?: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}` + (text ? `?text=${encodeURIComponent(text)}` : '');
}
