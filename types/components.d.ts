// types/components.d.ts
declare module '@/components/layout' {
  import { FC, ReactNode } from 'react';
  const Layout: FC<{ children: ReactNode; home?: boolean }>;
  export default Layout;
}
