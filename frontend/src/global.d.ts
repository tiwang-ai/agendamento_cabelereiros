declare module 'react-dom/client' {
  import { ReactNode } from 'react';
  interface Root {
    render(children: ReactNode): void;
  }
  function createRoot(element: Element | DocumentFragment): Root;
}

declare module 'qrcode.react' {
  import { ComponentType, SVGProps } from 'react';
  const QRCode: ComponentType<SVGProps<SVGSVGElement> & { value: string }>;
  export default QRCode;
}
