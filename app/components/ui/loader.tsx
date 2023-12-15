import * as React from "react";
import { Loader2 } from "lucide-react";

const Loader = React.forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
  (props, ref) => {
    return (
      <Loader2 ref={ref} {...props} />
    )
  }
)
Loader.displayName = "Loader"

export { Loader };
