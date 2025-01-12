import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, TrendingUp, MessageCircle, Video } from 'lucide-react';

const TerriCoinStats = () => {
    const [stats, setStats] = useState({
        balance: 0,
        totalSpent: 0,
        messageCount: 0,
        videoCalls: 0,
        history: []
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const userId = supabase.auth.user().id;

            // Obține balanța curentă
            const { data: wallet } = await supabase
                .from('wallets')
                .select('balance')
                .eq('user_id', userId)
                .single();

            // Obține statistici tranzacții
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('from_user_id', userId)
                .order('created_at', { ascending: true });

            // Calculează statistici
            let totalSpent = 0;
            let messageCount = 0;
            let videoCalls = 0;
            const history = [];

            transactions?.forEach(tx => {
                totalSpent += tx.amount;
                if (tx.type === 'message') messageCount++;
                if (tx.type === 'video_chat') videoCalls++;

                // Grupează pe zile pentru grafic
                const date = new Date(tx.created_at).toLocaleDateString();
                const existingDay = history.find(h => h.date === date);
                if (existingDay) {
                    existingDay.amount += tx.amount;
                } else {
                    history.push({ date, amount: tx.amount });
                }
            });

            setStats({
                balance: wallet?.balance || 0,
                totalSpent,
                messageCount,
                videoCalls,
                history
            });
        } catch (error) {
            console.error('Error fetching TerriCoin stats:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistici principale */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Balanță</p>
                                <p className="text-2xl font-bold">{stats.balance} TC</p>
                            </div>
                            <Coins className="w-8 h-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Cheltuit</p>
                                <p className="text-2xl font-bold">{stats.totalSpent} TC</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Mesaje Plătite</p>
                                <p className="text-2xl font-bold">{stats.messageCount}</p>
                            </div>
                            <MessageCircle className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Apeluri Video</p>
                                <p className="text-2xl font-bold">{stats.videoCalls}</p>
                            </div>
                            <Video className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grafic cheltuieli */}
            <Card>
                <CardHeader>
                    <CardTitle>Istoric Cheltuieli TerriCoin</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.history}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#8884d8" 
                                    name="TerriCoin" 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TerriCoinStats;
