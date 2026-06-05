import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-w-16 items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-semibold leading-6 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      // Variants mirror the Figma "Button" component's `Style` property
      // (Primary, Secondary, Ghost, Destructive, Ai, Inverted), wired to the
      // button-local --color-btn-* tokens bridged in src/styles/index.css.
      variant: {
        default:
          'bg-btn-primary text-btn-primary-foreground hover:bg-btn-primary-hover active:bg-btn-primary-active',
        secondary:
          'border border-border bg-transparent text-btn-link hover:bg-btn-secondary-hover hover:text-btn-link-hover active:bg-btn-secondary-active active:text-btn-link-active',
        ghost:
          'bg-transparent text-btn-link underline-offset-4 hover:text-btn-link-hover hover:underline active:text-btn-link-active active:underline',
        destructive:
          'bg-btn-destructive text-btn-destructive-foreground hover:bg-btn-destructive-hover active:bg-btn-destructive-active',
        ai: 'text-btn-primary-foreground [background-image:var(--ui-background-ai-idle)] hover:[background-image:var(--ui-background-ai-hover)] active:[background-image:var(--ui-background-ai-active)]',
        inverted:
          'bg-btn-inverted text-btn-inverted-foreground hover:bg-btn-inverted-hover active:bg-btn-inverted-active',
        // Not in the Figma "Button" component, but retained for parity with
        // the shared @acronis-platform/shadcn-uikit-demos (used by legacy too).
        outline:
          'border border-border bg-background hover:bg-accent/10 active:bg-accent/20',
        link: 'text-primary underline-offset-4 hover:underline',
        translucent:
          'bg-foreground/20 text-foreground hover:bg-foreground/30 active:bg-foreground/40',
      },
      size: {
        default: 'h-8 px-3 py-1',
        sm: 'h-7 px-2 py-0.5 text-xs',
        lg: 'h-10 px-4 py-2',
        icon: 'h-8 w-8 min-w-0 p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Replace the rendered `<button>` with another element or component
   * (Base UI composition). Accepts a React element or a render function —
   * the component's props and class names are merged onto it.
   */
  render?: useRender.RenderProp;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, render, ...props }, ref) => {
    return useRender({
      render,
      ref,
      defaultTagName: 'button',
      props: mergeProps<'button'>(
        { className: cn(buttonVariants({ variant, size, className })) },
        props
      ),
    });
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
