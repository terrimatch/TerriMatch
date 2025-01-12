// ... imports existente
import { Video } from 'lucide-react';
import VideoChatModal from './VideoChatModal';

const Chat = ({ matchId, partnerId, partnerName }) => {
    const [isVideoChatOpen, setIsVideoChatOpen] = useState(false);
    // ... restul stării existente

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{partnerName}</h2>
                <Button
                    onClick={() => setIsVideoChatOpen(true)}
                    className="flex items-center"
                >
                    <Video className="w-4 h-4 mr-2" />
                    Video Chat
                </Button>
            </div>

            {/* ... restul componentei de chat existente */}

            <VideoChatModal
                isOpen={isVideoChatOpen}
                onClose={() => setIsVideoChatOpen(false)}
                matchId={matchId}
                partnerId={partnerId}
                partnerName={partnerName}
            />
        </div>
    );
};

export default Chat;
