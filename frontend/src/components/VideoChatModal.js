import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import VideoChat from './VideoChat';

const VideoChatModal = ({ isOpen, onClose, matchId, partnerId, partnerName }) => {
    const handleCallEnd = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        Apel video cu {partnerName}
                    </DialogTitle>
                </DialogHeader>
                <VideoChat
                    matchId={matchId}
                    partnerId={partnerId}
                    onEnd={handleCallEnd}
                />
            </DialogContent>
        </Dialog>
    );
};

export default VideoChatModal;
