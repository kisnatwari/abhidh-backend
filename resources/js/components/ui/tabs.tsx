import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className }: TabsProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const value = controlledValue ?? internalValue;
    const handleValueChange = onValueChange ?? setInternalValue;

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function TabsList({ children, className, ...props }: TabsListProps) {
    return (
        <div
            className={cn(
                'inline-flex h-auto items-center justify-center gap-1 rounded-2xl bg-muted/30 p-1.5 backdrop-blur-md border border-border/50 shadow-sm',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    children: React.ReactNode;
    count?: number;
}

export function TabsTrigger({ value, children, count, className, ...props }: TabsTriggerProps) {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error('TabsTrigger must be used within Tabs');
    }

    const isActive = context.value === value;

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => context.onValueChange(value)}
            className={cn(
                'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_4px_16px_-6px_rgba(18,40,90,0.5)] scale-[1.02]'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-[1.01] active:scale-[0.99]',
                className,
            )}
            {...props}
        >
            <span className="relative z-10">{children}</span>
            {count !== undefined && (
                <span
                    className={cn(
                        'relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold transition-all',
                        isActive
                            ? 'bg-primary-foreground/25 text-primary-foreground shadow-sm'
                            : 'bg-muted/80 text-muted-foreground',
                    )}
                >
                    {count}
                </span>
            )}
            {isActive && (
                <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
            )}
        </button>
    );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    children: React.ReactNode;
}

export function TabsContent({ value, children, className, ...props }: TabsContentProps) {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error('TabsContent must be used within Tabs');
    }

    if (context.value !== value) {
        return null;
    }

    return (
        <div
            role="tabpanel"
            className={cn(
                'mt-8 transition-opacity duration-300 ease-in-out',
                className,
            )}
            style={{ opacity: 1 }}
            {...props}
        >
            {children}
        </div>
    );
}

