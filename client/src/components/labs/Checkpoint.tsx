import { CheckCircle2 } from 'lucide-react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

interface CheckpointProps {
    text: string;
    verified: boolean;
    onToggle: () => void;
}

export function Checkpoint({ text, verified, onToggle }: CheckpointProps) {
    return (
        <div
            className={`rounded-xl p-5 border transition-[background-color,border-color] cursor-pointer flex gap-4 items-start ${verified ? 'bg-success/10 border-success/30' : 'bg-success/5 border-success/10 hover:bg-success/10'
                }`}
            onClick={onToggle}
        >
            <div className="mt-0.5 shrink-0">
                <Checkbox.Root
                    checked={verified}
                    onCheckedChange={onToggle}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${verified ? 'bg-success border-success text-white' : 'border-success/50 hover:bg-success/20'
                        }`}
                >
                    <Checkbox.Indicator>
                        <Check className="w-3 h-3" />
                    </Checkbox.Indicator>
                </Checkbox.Root>
            </div>
            <div className="flex-1">
                <div className="text-sm font-semibold text-success mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Checkpoint
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{text}</p>
            </div>
        </div>
    );
}
