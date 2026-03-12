import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Reusable utility for merging Tailwind classes */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/** Button component (Zoho Minimalist) */
export function Button({ className, variant = "primary", size = "md", ...props }) {
    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
        secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
        danger: "bg-red-600 text-white hover:bg-red-700",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
        outline: "bg-transparent border border-gray-200 text-gray-600 hover:bg-gray-50"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base font-semibold",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}

/** Input component (Zoho Clean) */
export function Input({ className, label, error, icon, ...props }) {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="block text-xs font-bold text-gray-500  tracking-widest">{label}</label>}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                        {React.cloneElement(icon, { size: 16 })}
                    </div>
                )}
                <input
                    className={cn(
                        "block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none",
                        icon && "pl-11",
                        error && "border-red-500 focus:ring-red-500/5 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold  tracking-wider">{error}</p>}
        </div>
    );
}

/** Card component (Zoho Style) */
export function Card({ className, children, title, footer, noPad = false, ...props }) {
    return (
        <div
            className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}
            {...props}
        >
            {title && (
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 leading-none">{title}</h3>
                </div>
            )}
            <div className={noPad ? '' : 'p-5'}>
                {children}
            </div>
            {footer && (
                <div className="px-5 py-4 border-t border-gray-100">
                    {footer}
                </div>
            )}
        </div>
    );
}

/** Badge component (Zoho Style) */
export function Badge({ children, className, variant = "neutral", size = "md" }) {
    const variants = {
        neutral: "bg-gray-100 text-gray-600 border-gray-200/50",
        primary: "bg-primary-50 text-primary-700 border-primary-100",
        success: "bg-green-50 text-green-700 border-green-100",
        warning: "bg-amber-50 text-amber-700 border-amber-100",
        danger: "bg-red-50 text-red-700 border-red-100",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
        violet: "bg-violet-50 text-violet-700 border-violet-100",
        slate: "bg-slate-100 text-slate-700 border-slate-200",
    };

    const sizes = {
        sm: "px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest",
        md: "px-2 py-0.5 text-[11px] font-semibold",
    };

    return (
        <span className={cn(
            "inline-flex items-center rounded-md border transition-colors",
            variants[variant],
            sizes[size],
            className
        )}>
            {children}
        </span>
    );
}
