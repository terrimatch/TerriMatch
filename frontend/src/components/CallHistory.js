import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Clock, Coins } from 'lucide-react';

const CallHistory = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCallHistory();
    }, []);

    const fetchCallHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id(id, first_name, last_name),
                    receiver:receiver_id(id, first_name, last_name)
                `)
                .eq('is_video', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCalls(data);
        } catch (error) {
            console.error('Error fetching call history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return '0m';
        const duration = new Date(endTime) - new Date(startTime);
        const minutes = Math.ceil(duration / (1000 * 60));
        return `${minutes}m`;
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Istoric Apeluri Video
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-4">Se încarcă...</div>
                ) : calls.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        Nu ai efectuat încă niciun apel video
                    </div>
                ) : (
                    <div className="space-y-4">
                        {calls.map((call) => {
                            const isOutgoing = call.sender_id === supabase.auth.user().id;
                            const partner = isOutgoing ? call.receiver : call.sender;
                            const duration = formatDuration(call.start_time, call.end_time);
                            const cost = Math.ceil(parseInt(duration) * 1); // 1 TerriCoin/minut

                            return (
                                <div 
                                    key={call.id} 
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${
                                            isOutgoing ? 'bg-blue-100' : 'bg-green-100'
                                        }`}>
                                            <Video className={`w-5 h-5 ${
                                                isOutgoing ? 'text-blue-500' : 'text-green-500'
                                            }`} />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {isOutgoing ? 'Către: ' : 'De la: '}
                                                {partner.first_name} {partner.last_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDateTime(call.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            {duration}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Coins className="w-4 h-4 text-yellow-500" />
                                            {cost} TC
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CallHistory;
