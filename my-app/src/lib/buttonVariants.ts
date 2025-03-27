import { cva, type VariantProps } from "class-variance-authority";

export const customButton = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50",
    {
        variants: {
            intent: {
                primary: "bg-primary text-white hover:bg-primary/90",
                secondary: "bg-muted text-foreground hover:bg-muted/80",
                ghost: "bg-muted hover:bg-muted/70 active:scale-95 active:shadow-inner",
                outline: "border border-input hover:bg-accent hover:text-accent-foreground",
                destructive: "bg-destructive text-white hover:bg-destructive/90",
            },
            size: {
                default: "h-9 px-4",
                sm: "h-8 px-3 text-sm",
                lg: "h-10 px-6 text-base",
            },
        },
        defaultVariants: {
            intent: "secondary",
            size: "default",
        },
    }
);

export type CustomButtonProps = VariantProps<typeof customButton>;
