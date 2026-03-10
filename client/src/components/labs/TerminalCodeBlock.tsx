import { CopyCodeBlock } from '@/components/shared/CopyCodeBlock';

interface TerminalCodeBlockProps {
    command: string;
    title?: string;
}

export function TerminalCodeBlock({ command, title }: TerminalCodeBlockProps) {
    return (
        <CopyCodeBlock
            code={command}
            title={title}
            copyLabel="Copy"
            copiedLabel="Copied!"
            variant="terminal"
            className="my-6"
        />
    );
}
