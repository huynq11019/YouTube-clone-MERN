import  { useEffect, useRef } from 'react';

const VideoPlayer = ({ videoUrl }) => {
    const playerRef = useRef(null);

    useEffect(() => {
        // Kiểm tra PlayerJS có sẵn không
        if (window.Playerjs) {
            // Khởi tạo PlayerJS với video URL
            new window.Playerjs({
                id: 'player',       // ID của div player
                file: videoUrl,     // URL video cần phát
            });
        }
    }, [videoUrl]);

    return (
        <div>
            {/* Div này sẽ chứa PlayerJS */}
            <div id="player" className={"play-video"} ref={playerRef} style={{ width: '100%', height: '400px' }}></div>
        </div>
    );
};

export default VideoPlayer;
