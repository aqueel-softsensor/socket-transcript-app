import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const RandomNumberDisplay = () => {
    // State to store all received transcripts
    const [transcripts, setTranscripts] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Connect to the Socket.IO server
        const socket = io('https://unstruct-api-ssx.softsensor.ai', {
            path: '/unstructured_data/socket.io',
        });

        // Handle connection
        socket.on('connect', () => {
            console.log('Connected to server');
            setConnected(true);

            // Join the specific room (this ID should match the API call's {id})
            socket.emit('join', { room: 'ec0732c9-9e59-460d-b496-9830fd7d272b' });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            setConnected(false);
        });

        // Listen for emitted transcript events
        socket.on('emitting_transcript', (data) => {
            console.log('Received transcript:', data);

            if (data && data.timestamp && data.transcript) {
                // Update transcripts state with the new data, keeping older messages as well
                setTranscripts((prevTranscripts) => {
                    // Add the new transcript to the list of transcripts
                    const updatedTranscripts = [...prevTranscripts, data];

                    // Sort transcripts in descending order by timestamp (newest first)
                    return updatedTranscripts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                });
            } else {
                console.error('Invalid data format or missing fields:', data);
            }
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h1>Socket.IO Transcript Display</h1>
            {connected ? <p>Status: Connected</p> : <p>Status: Disconnected</p>}
            <div>
                {transcripts.length > 0 ? (
                    <div>
                        <h2>Transcripts (Newest First):</h2>
                        {transcripts.map((transcript, index) => (
                            <div key={index}>
                                <p><strong>Timestamp:</strong> {transcript.timestamp}</p>
                                <p><strong>Transcript:</strong> {transcript.transcript || 'No transcript available'}</p>
                                <hr />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Waiting for transcripts...</p>
                )}
            </div>
        </div>
    );
};

export default RandomNumberDisplay;
