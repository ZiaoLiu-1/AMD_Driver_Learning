import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface TerminalCodeBlockProps {
    command: string;
    title?: string;
}

export function TerminalCodeBlock({ command, title }: TerminalCodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lines = command.split('\n');

    return (
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#0a0a0a] my-6">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    </div>
                    {title && (
                        <span className="ml-2 text-xs font-mono text-zinc-400">{title}</span>
                    )}
                </div>
                <button
                    onClick={handleCopy}
                    className="text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                {lines.map((line, idx) => {
                    const isComment = line.trim().startsWith('#');
                    const isEmpty = line.trim() === '';
                    if (isEmpty) return <div key={idx} className="h-4" />;
                    return (
                        <div key={idx} className={`whitespace-pre ${isComment ? 'text-zinc-500' : 'text-zinc-100'}`}>
                            {line}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
