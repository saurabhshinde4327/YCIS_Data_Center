"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

// Fallback type for DrawerPrimitive.Root props to avoid type extraction issues
interface DrawerRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  shouldScaleBackground?: boolean;
  direction?: "bottom" | "top" | "left" | "right";
  snapPoints?: number[];
  children: React.ReactNode;
}

// Explicit props for Drawer component
interface DrawerProps extends DrawerRootProps {
  // Add any additional custom props here if needed
}

// Props for DrawerContent
interface DrawerContentProps {
  className?: string;
  children: React.ReactNode;
  showHandle?: boolean;
}

// Drawer Root Component
const Drawer: React.FC<DrawerProps> = ({
  shouldScaleBackground = true,
  direction = "bottom",
  snapPoints,
  children,
  open,
  onOpenChange,
  ...props
}) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    direction={direction}
    snapPoints={snapPoints}
    open={open}
    onOpenChange={onOpenChange}
    {...props}
  >
    {children}
  </DrawerPrimitive.Root>
);
Drawer.displayName = "Drawer";

// Drawer Trigger
const DrawerTrigger: React.FC<{
  children: React.ReactNode;
  asChild?: boolean;
}> = (props) => <DrawerPrimitive.Trigger {...props} />;
DrawerTrigger.displayName = "DrawerTrigger";

// Drawer Portal
const DrawerPortal: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => <DrawerPrimitive.Portal>{children}</DrawerPrimitive.Portal>;
DrawerPortal.displayName = "DrawerPortal";

// Drawer Close
const DrawerClose: React.FC<{
  children?: React.ReactNode;
}> = (props) => <DrawerPrimitive.Close {...props} />;
DrawerClose.displayName = "DrawerClose";

// Drawer Overlay
const DrawerOverlay = React.memo(
  React.forwardRef<
    HTMLDivElement,
    { className?: string; onClick?: () => void }
  >(({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      aria-label="Close drawer overlay"
      {...props}
    />
  ))
);
DrawerOverlay.displayName = "DrawerOverlay";

// Drawer Content
const DrawerContent = React.memo(
  React.forwardRef<HTMLDivElement, DrawerContentProps>(
    ({ className, children, showHandle = true, ...props }, ref) => (
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerPrimitive.Content
          ref={ref}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
            className
          )}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {showHandle && (
            <div
              className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted"
              role="presentation"
              aria-hidden="true"
            />
          )}
          {children}
        </DrawerPrimitive.Content>
      </DrawerPortal>
    )
  )
);
DrawerContent.displayName = "DrawerContent";

// Drawer Header
const DrawerHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

// Drawer Footer
const DrawerFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

// Drawer Title
const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  { className?: string; children: React.ReactNode }
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

// Drawer Description
const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  { className?: string; children: React.ReactNode }
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = "DrawerDescription";

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};