export * from "react";

declare module "react" {
  interface PlaceholderProps {
    delayMs?: number;
    fallback?: React.ReactNode;
    children: React.ReactNode;
  }
  export const Placeholder: React.ComponentClass<PlaceholderProps>;
}
