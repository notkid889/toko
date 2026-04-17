import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Define the shape of our context
interface ConfirmParams {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
}

interface ConfirmContextType {
    confirm: (params?: ConfirmParams) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmParams>({});

    // We store the Promise resolve function in state so we can call it when the user clicks a button
    const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

    const confirm = useCallback((params?: ConfirmParams) => {
        setOptions(params || {});
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolver({ resolve });
        });
    }, []);

    const handleConfirm = () => {
        resolver?.resolve(true);
        setIsOpen(false);
    };

    const handleCancel = () => {
        resolver?.resolve(false);
        setIsOpen(false);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{options.title || "Are you absolutely sure?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {options.description || "This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            {options.cancelText || "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {options.confirmText || "Continue"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmContext.Provider>
    );
}

// Custom hook to use the confirm dialog
export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};