import { motion } from 'framer-motion';

export function ProgressRing({ percentage, status, size = 48, strokeWidth = 4 }: { percentage: number, status: string, size?: number, strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const isCompleted = status === 'completed';
    const isInProgress = status === 'in-progress';

    return (
        <div className="relative inline-flex items-center justify-center pt-0" style={{ width: size, height: size }}>
            {/* Background ring */}
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    className="stroke-muted"
                    fill="none"
                />
                {/* Progress ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={isInProgress ? 'url(#amd-gradient)' : isCompleted ? 'var(--success)' : 'transparent'}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <defs>
                    <linearGradient id="amd-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--brand-end)" />
                    </linearGradient>
                </defs>
            </svg>
            {/* Percentage Center Text */}
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {percentage}%
            </div>
        </div>
    );
}
