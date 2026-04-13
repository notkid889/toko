import { Sparkle } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground bg-linear-to-b from-indigo-500 to-purple-500">
                <Sparkle className="size-5 fill-current text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-base">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Toko Emas
                </span>
            </div>
        </>
    );
}
