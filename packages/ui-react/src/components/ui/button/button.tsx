import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-semibold leading-6 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        outline:
          'border border-border bg-background hover:bg-accent/10 active:bg-accent/20',
        secondary:
          'border border-primary bg-background text-primary hover:bg-primary/10 active:bg-primary/20',
        ghost: 'text-primary hover:bg-accent/10 active:bg-accent/20',
        link: 'text-primary underline-offset-4 hover:underline',
        translucent:
          'bg-foreground/20 text-foreground hover:bg-foreground/30 active:bg-foreground/40',
      },
      size: {
        default: 'h-8 px-2 py-1',
        sm: 'h-7 px-2 py-0.5 text-xs',
        lg: 'h-10 px-4 py-2',
        icon: 'h-8 w-8 p-2',
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
