import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Phone, PhoneOff } from 'lucide-react';

const CallNotification = ({ isOpen, caller, onAccept, onDecline }) => {
    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-500" />
                        Apel video primit
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {caller?.name} te apelează. Costul este de 1 TerriCoin/minut.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onDecline} className="flex items-center gap-2">
                        <PhoneOff className="w-4 h-4" />
                        Refuză
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onAccept}
                        className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                    >
                        <Phone className="w-4 h-4" />
                        Acceptă
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CallNotification;
