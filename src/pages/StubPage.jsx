import React from "react";

export default function StubPage({ title }) {
    return (
        <div className="flex items-center justify-center p-20 card border-dashed border-2 bg-gray-50/50">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-400 opacity-50  tracking-widest">{title} Module</h2>
                <p className="mt-2 text-gray-400">This module is coming soon or in development.</p>
            </div>
        </div>
    );
}
