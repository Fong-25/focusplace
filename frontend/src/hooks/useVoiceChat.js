import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'

export const useVoiceChat = (socket, roomId, userId) => {
    const [isMuted, setIsMuted] = useState(true)
    const [isConnecting, setIsConnecting] = useState(false)
    const [activeSpeakers, setActiveSpeakers] = useState(new Set())
    const [audioEnabled, setAudioEnabled] = useState(false)

    const localStreamRef = useRef(null)
    const peersRef = useRef(new Map()) // userId -> RTCPeerConnection
    const audioContextRef = useRef(null)
    const analyserRef = useRef(null)

    // ICE servers configuration (using free STUN servers)
    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    }

    // Initialize audio stream
    const initializeAudio = useCallback(async () => {
        if (localStreamRef.current) return localStreamRef.current

        try {
            setIsConnecting(true)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            })

            localStreamRef.current = stream

            // Mute by default
            stream.getAudioTracks().forEach(track => {
                track.enabled = false
            })

            // Setup audio analysis for voice activity detection
            setupVoiceDetection(stream)

            setAudioEnabled(true)
            setIsConnecting(false)

            return stream
        } catch (error) {
            console.error('Failed to get audio stream:', error)
            toast.error('Failed to access microphone')
            setIsConnecting(false)
            throw error
        }
    }, [])

    // Setup voice activity detection
    const setupVoiceDetection = (stream) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const analyser = audioContext.createAnalyser()
        const microphone = audioContext.createMediaStreamSource(stream)

        analyser.smoothingTimeConstant = 0.8
        analyser.fftSize = 512

        microphone.connect(analyser)

        audioContextRef.current = audioContext
        analyserRef.current = analyser

        // Start monitoring voice activity
        monitorVoiceActivity()
    }

    // Monitor voice activity
    const monitorVoiceActivity = () => {
        if (!analyserRef.current) return

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        const threshold = 40 // Low = more sensitive

        const checkVolume = () => {
            if (!analyserRef.current || isMuted) {
                requestAnimationFrame(checkVolume)
                return
            }

            analyserRef.current.getByteFrequencyData(dataArray)
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length

            const isSpeaking = average > threshold

            if (isSpeaking && socket) {
                socket.emit('voiceActivity', { roomId, userId, isSpeaking: true })
            }

            requestAnimationFrame(checkVolume)
        }

        checkVolume()
    }

    // Create peer connection
    const createPeerConnection = useCallback((targetUserId) => {
        const peerConnection = new RTCPeerConnection(iceServers)

        // Add local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current)
            })
        }

        // Handle incoming stream
        peerConnection.ontrack = (event) => {
            const remoteAudio = new Audio()
            remoteAudio.srcObject = event.streams[0]
            remoteAudio.play().catch(err => console.error('Error playing audio:', err))
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('voiceSignal', {
                    roomId,
                    targetUserId,
                    signal: { type: 'ice-candidate', candidate: event.candidate }
                })
            }
        }

        // Connection state monitoring
        peerConnection.onconnectionstatechange = () => {
            console.log(`Peer connection state with ${targetUserId}:`, peerConnection.connectionState)
        }

        peersRef.current.set(targetUserId, peerConnection)
        return peerConnection
    }, [socket, roomId])

    // Create and send offer
    const createOffer = useCallback(async (targetUserId) => {
        try {
            const peerConnection = createPeerConnection(targetUserId)
            const offer = await peerConnection.createOffer()
            await peerConnection.setLocalDescription(offer)

            if (socket) {
                socket.emit('voiceSignal', {
                    roomId,
                    targetUserId,
                    signal: { type: 'offer', sdp: offer }
                })
            }
        } catch (error) {
            console.error('Error creating offer:', error)
        }
    }, [socket, roomId, createPeerConnection])

    // Handle incoming offer
    const handleOffer = useCallback(async (fromUserId, offer) => {
        try {
            const peerConnection = createPeerConnection(fromUserId)
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)

            if (socket) {
                socket.emit('voiceSignal', {
                    roomId,
                    targetUserId: fromUserId,
                    signal: { type: 'answer', sdp: answer }
                })
            }
        } catch (error) {
            console.error('Error handling offer:', error)
        }
    }, [socket, roomId, createPeerConnection])

    // Handle incoming answer
    const handleAnswer = useCallback(async (fromUserId, answer) => {
        try {
            const peerConnection = peersRef.current.get(fromUserId)
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
            }
        } catch (error) {
            console.error('Error handling answer:', error)
        }
    }, [])

    // Handle ICE candidate
    const handleIceCandidate = useCallback(async (fromUserId, candidate) => {
        try {
            const peerConnection = peersRef.current.get(fromUserId)
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error)
        }
    }, [])

    // Toggle mute
    const toggleMute = useCallback(async () => {
        try {
            if (!audioEnabled) {
                await initializeAudio()
            }

            if (localStreamRef.current) {
                const newMutedState = !isMuted
                localStreamRef.current.getAudioTracks().forEach(track => {
                    track.enabled = !newMutedState
                })
                setIsMuted(newMutedState)

                // Notify others
                if (socket) {
                    socket.emit('voiceMuteStatus', { roomId, userId, isMuted: newMutedState })
                }

                toast.success(newMutedState ? 'Microphone muted' : 'Microphone unmuted')
            }
        } catch (error) {
            console.error('Error toggling mute:', error)
            toast.error('Failed to toggle microphone')
        }
    }, [isMuted, audioEnabled, socket, roomId, userId, initializeAudio])

    // Join voice chat
    const joinVoiceChat = useCallback(async (userIds) => {
        try {
            await initializeAudio()

            // Create offers to all existing users
            userIds.forEach(targetUserId => {
                if (targetUserId !== userId) {
                    createOffer(targetUserId)
                }
            })
        } catch (error) {
            console.error('Error joining voice chat:', error)
        }
    }, [userId, initializeAudio, createOffer])

    // Setup socket listeners
    useEffect(() => {
        if (!socket) return

        socket.on('voiceSignal', ({ fromUserId, signal }) => {
            if (signal.type === 'offer') {
                handleOffer(fromUserId, signal.sdp)
            } else if (signal.type === 'answer') {
                handleAnswer(fromUserId, signal.sdp)
            } else if (signal.type === 'ice-candidate') {
                handleIceCandidate(fromUserId, signal.candidate)
            }
        })

        socket.on('voiceActivity', ({ userId: speakerId, isSpeaking }) => {
            setActiveSpeakers(prev => {
                const newSet = new Set(prev)
                if (isSpeaking) {
                    newSet.add(speakerId)
                } else {
                    newSet.delete(speakerId)
                }
                return newSet
            })

            // Auto-clear speaking indicator after 500ms of no activity
            setTimeout(() => {
                setActiveSpeakers(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(speakerId)
                    return newSet
                })
            }, 500)
        })

        socket.on('userJoinedVoice', ({ userId: newUserId }) => {
            if (newUserId !== userId && audioEnabled) {
                createOffer(newUserId)
            }
        })

        socket.on('userLeftVoice', ({ userId: leftUserId }) => {
            const peerConnection = peersRef.current.get(leftUserId)
            if (peerConnection) {
                peerConnection.close()
                peersRef.current.delete(leftUserId)
            }
        })

        return () => {
            socket.off('voiceSignal')
            socket.off('voiceActivity')
            socket.off('userJoinedVoice')
            socket.off('userLeftVoice')
        }
    }, [socket, userId, audioEnabled, handleOffer, handleAnswer, handleIceCandidate, createOffer])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop())
            }

            peersRef.current.forEach(peer => peer.close())
            peersRef.current.clear()

            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [])

    return {
        isMuted,
        isConnecting,
        audioEnabled,
        activeSpeakers,
        toggleMute,
        joinVoiceChat
    }
}