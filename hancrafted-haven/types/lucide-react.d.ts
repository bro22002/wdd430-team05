declare module "lucide-react" {
  import * as React from "react";

  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export const Github: React.FC<IconProps>;
  export const Linkedin: React.FC<IconProps>;
  export const Twitter: React.FC<IconProps>;

  // We can add more icons here if needed
}
